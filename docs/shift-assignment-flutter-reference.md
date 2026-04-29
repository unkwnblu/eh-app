# Shift Assignment & Candidate Acceptance — Flutter Reference

> Complete technical reference for replicating the shift assignment and candidate
> acceptance feature from the Edge Harbour web app in a Flutter mobile app.

---

## 1. Database Tables

### `shifts`

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` PK | `gen_random_uuid()` |
| `job_id` | `UUID` FK → `jobs` | `ON DELETE CASCADE` |
| `employer_id` | `UUID` FK → `employers` | `ON DELETE CASCADE` |
| `date` | `DATE` | `YYYY-MM-DD`, local timezone — never convert to UTC |
| `start_time` | `TIME` | `HH:MM:SS` 24-hour |
| `end_time` | `TIME` | `HH:MM:SS` 24-hour |
| `break_minutes` | `INTEGER` | optional, default `0` |
| `department` | `TEXT` | optional |
| `location` | `TEXT` | optional |
| `staff_needed` | `INTEGER` | default `1` |
| `hourly_rate` | `NUMERIC(10,2)` | optional |
| `experience_level` | `TEXT` | `Junior` \| `Mid-level` \| `Senior` |
| `required_certifications` | `TEXT[]` | default `{}` |
| `status` | `TEXT` | `open` \| `filled` \| `cancelled` |
| `notes` | `TEXT` | optional |
| `is_recurring` | `BOOLEAN` | default `false` |
| `recurrence_type` | `TEXT` | `daily` \| `weekly` (null for one-off) |
| `recurrence_days` | `INTEGER[]` | days of week: `0`=Sun … `6`=Sat |
| `recurrence_end_date` | `DATE` | optional, null = open-ended |
| `recurring_group_id` | `UUID` | links all rows from the same recurring series |
| `created_at` | `TIMESTAMPTZ` | `NOW()` |
| `updated_at` | `TIMESTAMPTZ` | auto-updated via trigger |

> **Key design:** every occurrence of a recurring shift is a **separate row** sharing
> the same `recurring_group_id`. A "12-week recurring shift" = 12 individual rows in
> the `shifts` table. The client expands the recurrence pattern to a flat list of
> dates before calling the API.

---

### `shift_assignments`

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` PK | `gen_random_uuid()` |
| `shift_id` | `UUID` FK → `shifts` | `ON DELETE CASCADE` |
| `candidate_id` | `UUID` FK → `profiles` | `ON DELETE CASCADE` |
| `status` | `TEXT` | `pending` \| `confirmed` \| `declined` \| `cancelled` |
| `assigned_at` | `TIMESTAMPTZ` | `NOW()` |

**Unique constraint:** `(shift_id, candidate_id)` — one assignment per candidate per shift.

---

### `candidate_notifications` (relevant fields)

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` PK | |
| `candidate_id` | `UUID` FK → `auth.users` | |
| `type` | `TEXT` | `"shift"` for shift notifications |
| `title` | `TEXT` | |
| `body` | `TEXT` | supports `**bold**` markdown |
| `read` | `BOOLEAN` | default `false` |
| `metadata` | `JSONB` | shift-specific fields (see Section 6) |
| `created_at` | `TIMESTAMPTZ` | |

---

## 2. Assignment State Machine

```
Admin assigns candidate
         │
         ▼
      pending  ◄─── only actionable state for the candidate
         │
   ┌─────┴──────┐
   │            │
accept        decline
   │            │
   ▼            ▼
confirmed    declined
   │
admin cancels
   │
   ▼
cancelled
```

### Shift-level status — auto-synced after every transition

```
confirmed_count >= staff_needed  →  shift.status = "filled"
confirmed_count <  staff_needed  →  shift.status = "open"
admin marks shift cancelled      →  shift.status = "cancelled"  (locked)
```

---

## 3. RLS Policies

```sql
-- Employers see only their own shifts
CREATE POLICY "employer_own_shifts" ON public.shifts
  FOR ALL USING (employer_id = auth.uid());

-- Employers see assignments for their own shifts only
CREATE POLICY "employer_read_shift_assignments" ON public.shift_assignments
  FOR SELECT USING (
    shift_id IN (SELECT id FROM public.shifts WHERE employer_id = auth.uid())
  );
```

- Admins bypass all RLS using the **service role key**.
- Candidates have **no direct RLS** on `shift_assignments` — all candidate access
  goes through API routes that filter by `candidate_id = auth.uid()`.

---

## 4. API Endpoints

All endpoints require a valid Supabase session cookie / Bearer token.
Base URL: your Next.js deployment root (e.g. `https://app.edgeharbour.co.uk`).

---

### Employer Endpoints (`role: employer`)

#### `GET /api/employer/shifts`
Returns a summary of all roles that have shifts.

**Response**
```json
{
  "roles": [
    {
      "jobId": "uuid",
      "title": "Nurse",
      "sector": "Healthcare",
      "totalShifts": 50,
      "filledShifts": 35,
      "openShifts": 15
    }
  ]
}
```

---

#### `GET /api/employer/shifts?jobId=<uuid>`
Returns full shift + assignment detail for one job.

**Response**
```json
{
  "job": {
    "id": "uuid",
    "title": "Nurse",
    "sector": "Healthcare",
    "location": "London, UK",
    "employmentType": "Full-time",
    "status": "live"
  },
  "shifts": [
    {
      "id": "uuid",
      "date": "2025-03-15",
      "startTime": "09:00:00",
      "endTime": "17:00:00",
      "breakMinutes": 60,
      "department": "Emergency",
      "location": "Hospital A",
      "staffNeeded": 3,
      "hourlyRate": 22.50,
      "experienceLevel": "Mid-level",
      "requiredCertifications": ["NMC PIN", "BLS"],
      "status": "open",
      "notes": "High acuity ward",
      "isRecurring": false,
      "assignments": [
        {
          "id": "uuid",
          "candidateId": "uuid",
          "candidateName": "Jane Doe",
          "avatarUrl": "https://...signed-url...",
          "status": "confirmed",
          "assignedAt": "2025-03-01T10:30:00Z"
        }
      ]
    }
  ]
}
```

---

#### `POST /api/employer/shifts`
Create one or more shifts. Recurring dates must be **pre-expanded by the client**.

**Request body**
```json
{
  "jobId": "uuid",
  "date":  "2025-03-15",
  "dates": ["2025-03-15", "2025-03-22"],
  "startTime": "09:00:00",
  "endTime": "17:00:00",
  "department": "Emergency",
  "location": "Hospital A",
  "staffNeeded": 3,
  "hourlyRate": 22.50,
  "experienceLevel": "Mid-level",
  "requiredCertifications": ["NMC PIN"],
  "notes": "...",
  "breakMinutes": 60,
  "isRecurring": true
}
```

- Use `date` (string) for a single shift, or `dates` (array) for multiple.
- When `isRecurring: true` and `dates.length > 1`, the backend auto-generates a
  shared `recurring_group_id` UUID for all created rows.
- Maximum 500 dates per batch.

**Response — 201**
```json
{
  "shifts": [{ "id": "uuid", "date": "2025-03-15" }],
  "count": 1
}
```

---

#### `PATCH /api/employer/shifts/[id]`
Update fields on a single shift.

**Request body** (all optional)
```json
{
  "status": "open",
  "date": "2025-03-16",
  "startTime": "10:00:00",
  "endTime": "18:00:00",
  "breakMinutes": 60,
  "department": "ICU",
  "location": "Hospital B",
  "staffNeeded": 2,
  "hourlyRate": 25.00,
  "notes": "Updated notes"
}
```

**Response — 200**
```json
{ "success": true }
```

---

#### `DELETE /api/employer/shifts/[id]`
Delete a shift entirely.

**Response — 200**
```json
{ "success": true }
```

---

### Admin Endpoints (`role: admin`)

#### `GET /api/admin/shifts?jobId=<uuid>`
Same structure as the employer GET, but includes `pending` and `confirmed`
assignments (not just confirmed).

---

#### `POST /api/admin/shifts`
Create shifts for any job (same request/response shape as employer POST).

---

#### `POST /api/admin/shifts/[shiftId]`
Assign a candidate to a **single** shift.

**Request body**
```json
{ "candidateId": "uuid" }
```

**Behaviour**
1. Creates a `pending` assignment (or reactivates an existing `declined`/`cancelled` row).
2. Sends one shift notification to the candidate.

**Response — 200**
```json
{
  "success": true,
  "assignment": { "id": "uuid", "status": "pending" }
}
```

**Error codes**
| Code | Reason |
|---|---|
| 400 | `candidateId` missing or invalid |
| 404 | Shift not found |
| 409 | Candidate already has an active (`pending`/`confirmed`) assignment |

---

#### `PATCH /api/admin/shifts/[shiftId]`
Cancel a candidate's assignment.

**Request body**
```json
{ "assignmentId": "uuid" }
```

**Behaviour**
1. Sets assignment to `cancelled`.
2. Re-syncs shift status (`filled` → `open` if now below `staff_needed`).
3. Marks the candidate's notification as read with `metadata.acted = "rescinded"`.

**Response — 200**
```json
{ "success": true }
```

**Error codes**
| Code | Reason |
|---|---|
| 400 | `assignmentId` missing |
| 404 | Assignment not found |
| 409 | Assignment already cancelled |

---

#### `POST /api/admin/shifts/assign-group`
Bulk-assign a candidate to multiple shifts (typically a full recurring group)
with a **single consolidated notification**.

**Request body**
```json
{
  "shiftIds": ["uuid1", "uuid2", "uuid3"],
  "candidateId": "uuid"
}
```

**Behaviour**
1. Creates `pending` assignments for all listed shifts (skips any that are
   already active; reactivates `declined`/`cancelled` rows).
2. Sends **one** notification covering the whole group.

**Response — 200**
```json
{
  "success": true,
  "assigned": 3,
  "skipped": 0
}
```

---

### Candidate Endpoints (`role: candidate`)

#### `GET /api/candidate/shifts`
Fetch all shift assignments for the authenticated candidate.

**Response**
```json
{
  "shifts": [
    {
      "assignmentId": "uuid",
      "status": "pending",
      "assignedAt": "2025-03-01T10:30:00Z",
      "shiftId": "uuid",
      "date": "2025-03-15",
      "startTime": "09:00",
      "endTime": "17:00",
      "jobTitle": "Nurse",
      "isRecurring": false,
      "shiftStatus": "open"
    }
  ]
}
```

Only returns assignments with status `pending`, `confirmed`, or `declined`
(never `cancelled`). Ordered by `assigned_at DESC`.

---

#### `POST /api/candidate/shifts`
Accept or decline a shift assignment.

**Request body**
```json
{
  "assignmentId": "uuid",
  "action": "accept"
}
```

`action` must be `"accept"` or `"decline"`.

**Behaviour**
1. Validates assignment is `pending` and belongs to the candidate.
2. Updates the target assignment to `confirmed` or `declined`.
3. **Recurring group cascade:** if the shift has a `recurring_group_id`, all
   other `pending` assignments for this candidate in that group are updated to
   the same status.
4. Re-syncs each affected shift's status (`open` / `filled`).
5. Marks related notifications as read with `metadata.acted = "accepted"|"declined"`.

**Response — 200**
```json
{
  "success": true,
  "actioned": 12
}
```

`actioned` is the total number of assignments updated (1 for a single shift,
N for a recurring group).

**Error codes**
| Code | Reason |
|---|---|
| 400 | Invalid `action` value |
| 404 | Assignment not found or not in `pending` state |

---

### Notification Endpoints

#### `GET /api/candidate/notifications`
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "shift",
      "title": "Shift Assigned",
      "body": "You have been assigned a shift for **Nurse**...",
      "read": false,
      "metadata": { "assignmentId": "uuid", ... },
      "time": "2m ago",
      "createdAt": "2025-03-01T10:30:00Z"
    }
  ],
  "unreadCount": 3
}
```

Returns the 50 most recent notifications.

---

#### `PATCH /api/candidate/notifications`
Mark notifications read.

```json
{ "all": true }
```
or
```json
{ "id": "uuid" }
```

---

## 5. Notification Metadata Shapes

### Single shift assigned
```json
{
  "type": "shift",
  "title": "Shift Assigned",
  "body": "You have been assigned a shift for **Nurse** on **15 Mar** from **09:00** to **17:00**. Please confirm your availability.",
  "metadata": {
    "shiftId": "uuid",
    "assignmentId": "uuid",
    "jobId": "uuid",
    "jobTitle": "Nurse",
    "date": "2025-03-15",
    "startTime": "09:00:00",
    "endTime": "17:00:00",
    "isRecurring": "false"
  }
}
```

### Recurring group assigned
```json
{
  "type": "shift",
  "title": "Recurring Shifts Assigned",
  "body": "You have been offered **12 shifts** for **Nurse** running 17 Mar → 26 Apr, 09:00–17:00 each day. Please confirm your availability.",
  "metadata": {
    "recurringGroupId": "uuid",
    "assignmentId": "uuid",
    "jobId": "uuid",
    "jobTitle": "Nurse",
    "startDate": "2025-03-17",
    "endDate": "2025-04-26",
    "startTime": "09:00:00",
    "endTime": "17:00:00",
    "shiftCount": "12"
  }
}
```

### After candidate responds
The `acted` field is added to `metadata`:
```json
{
  "metadata": {
    "...existing fields...",
    "acted": "accepted"
  }
}
```

Possible `acted` values: `"accepted"` · `"declined"` · `"rescinded"` (admin cancelled)

---

## 6. End-to-End Flow

### Step 1 — Admin creates recurring shifts

**Client** expands the recurrence pattern to a flat date list:
```dart
List<String> generateRecurringDates(
  DateTime start,
  DateTime end,
  String type,       // "daily" | "weekly"
  List<int> weekDays // 0=Sun … 6=Sat, only for "weekly"
) {
  final dates = <String>[];
  var current = start;
  while (!current.isAfter(end)) {
    if (type == "daily" ||
        (type == "weekly" && weekDays.contains(current.weekday % 7))) {
      dates.add(DateFormat('yyyy-MM-dd').format(current));
    }
    current = current.add(const Duration(days: 1));
  }
  return dates;
}
```

**API call**
```
POST /api/admin/shifts
{
  "jobId": "uuid",
  "dates": ["2025-03-17", "2025-03-24", ..., "2025-04-28"],
  "startTime": "09:00:00",
  "endTime": "17:00:00",
  "isRecurring": true
}
```

**Result** — 12 rows in `shifts`, all sharing the same `recurring_group_id`.

---

### Step 2 — Admin assigns candidate to the whole group

```
POST /api/admin/shifts/assign-group
{
  "shiftIds": ["uuid1", ..., "uuid12"],
  "candidateId": "uuid"
}
```

**Result**
- 12 `shift_assignments` rows created with `status: pending`
- 1 notification sent to the candidate:
  > *"You have been offered **12 shifts** for Nurse running 17 Mar → 26 Apr…"*

---

### Step 3 — Candidate opens the app and accepts

```
POST /api/candidate/shifts
{
  "assignmentId": "uuid-of-any-one-assignment",
  "action": "accept"
}
```

**Result**
- All 12 assignments → `confirmed`
- All 12 shifts re-sync status (→ `filled` if `staff_needed = 1`)
- Notification marked read with `acted: "accepted"`
- Response: `{ success: true, actioned: 12 }`

---

### Step 4 — Employer refreshes shift list

```
GET /api/employer/shifts?jobId=uuid
```

All 12 shifts now show `"filled"` with the candidate's avatar displayed.

---

### Full lifecycle diagram

```
Admin creates recurring shifts (expand dates client-side)
    POST /api/admin/shifts  →  N rows in shifts table (shared recurring_group_id)

Admin assigns candidate
    POST /api/admin/shifts/assign-group  →  N pending assignments + 1 notification

Candidate opens app
    GET /api/candidate/notifications  →  sees "12 shifts offered"
    GET /api/candidate/shifts         →  sees 12 pending shifts

Candidate taps Accept
    POST /api/candidate/shifts { action: "accept" }
        → Target assignment: pending → confirmed
        → All siblings in recurring_group_id: pending → confirmed
        → All N shifts: status re-synced (open/filled)
        → Notification: read = true, acted = "accepted"
        ← { success: true, actioned: 12 }

Employer refreshes
    GET /api/employer/shifts?jobId=X  →  all shifts = "filled", avatar shown
```

---

## 7. Flutter Shift-Offers Tab — Supabase-Direct Pattern

> The mobile app **reads `candidate_notifications` directly via the Supabase client**
> rather than through the `/api/candidate/notifications` REST route. This is the
> recommended approach for Flutter because it supports Supabase Realtime out of the box.

### 7.1 Supabase Query

```dart
final rows = await supabase
    .from('candidate_notifications')
    .select('*')
    .eq('candidate_id', userId)
    .order('created_at', ascending: false)
    .limit(50);
```

- No server-side `type` filter — all 50 most-recent notifications are fetched and
  filtered in Dart.

---

### 7.2 Type Filter

```dart
final type = (n['type'] as String? ?? '').toLowerCase();
if (type != 'shift') continue;
```

Accepts `'shift'`, `'Shift'`, `'SHIFT'` — case-insensitive.

---

### 7.3 Pending vs History Split

```dart
final isRead = n['read'] as bool? ?? false;
final meta   = n['metadata'] as Map<String, dynamic>? ?? {};
final acted  = (meta['acted'] as String? ?? '').trim();

if (!isRead && acted.isEmpty) {
  pending.add(n);   // → show Accept / Decline buttons
} else {
  history.add(n);   // → show Accepted / Declined / Rescinded label
}
```

| Condition | Bucket | UI |
|---|---|---|
| `read == false` **AND** `metadata.acted` is empty/null | **pending** | Accept / Decline buttons |
| `read == true` **OR** `metadata.acted` has a value | **history** | Status label |

---

### 7.4 Metadata Fields Used in UI

| Field | Used for |
|---|---|
| `metadata.jobTitle` | Card title (falls back to top-level `title` column if empty) |
| `metadata.date` | Single shift date display |
| `metadata.startDate` + `metadata.endDate` | Recurring date range (`17 Mar → 26 Apr`) |
| `metadata.startTime` + `metadata.endTime` | Time chip (`HH:MM → HH:MM`) |
| `metadata.recurringGroupId` | Non-empty → show recurring badge |
| `metadata.shiftCount` | Number on badge (e.g. `"12 SHIFTS"`) |
| `metadata.assignmentId` | Sent in the POST body on accept / decline |
| `metadata.acted` | History label: `"accepted"` · `"declined"` · `"rescinded"` |

---

### 7.5 Accept / Decline Action

```dart
final response = await http.post(
  Uri.parse('https://app.edgeharbour.co.uk/api/candidate/shifts'),
  headers: {
    'Authorization': 'Bearer ${supabase.auth.currentSession!.accessToken}',
    'Content-Type': 'application/json',
  },
  body: jsonEncode({
    'assignmentId': meta['assignmentId'],
    'action': 'accept', // or 'decline'
  }),
);
```

The backend cascades across the whole `recurring_group_id` automatically — only
one call is needed regardless of how many shifts are in the group.

**Always re-fetch the notification list after a successful response** so the card
moves from pending → history.

---

### 7.6 Debugging Checklist

To verify why a notification isn't appearing on the shift-offers tab, inspect the
`candidate_notifications` row in Supabase:

| Column | Expected value |
|---|---|
| `type` | `'shift'` (any case) |
| `read` | `false` for pending |
| `metadata.assignmentId` | non-empty UUID |
| `metadata.acted` | empty / null for pending |
| `metadata.jobTitle` | job name string |
| `metadata.date` | `YYYY-MM-DD` (single shift) |
| `metadata.startDate` + `metadata.endDate` | `YYYY-MM-DD` each (recurring) |
| `metadata.startTime` | `HH:MM:SS` or `HH:MM` |
| `metadata.endTime` | `HH:MM:SS` or `HH:MM` |

---

## 8. General Flutter Implementation Notes

### Time & date handling
- All times are `HH:MM:SS` (24-hour, **local timezone**).
- All dates are `YYYY-MM-DD` (**local timezone** — never convert to UTC).
- Truncate `HH:MM:SS` → `HH:MM` for display.

### Recurring group — one tap, all shifts
When a candidate acts on any assignment that has a `recurring_group_id`, the
backend cascades the action to all other `pending` siblings automatically.
The Flutter app only needs to send **one** API call with any one `assignmentId`
from the group.

```dart
// Show a badge on recurring shift cards
if (shift.isRecurring) {
  // Display: "Recurring shift — tap to accept/decline all"
}
```

### Always re-fetch after accept/decline
The server updates multiple rows server-side; the local state will be stale.

```dart
final result = await http.post(
  Uri.parse('$base/api/candidate/shifts'),
  body: jsonEncode({ 'assignmentId': id, 'action': 'accept' }),
);

// Refresh list after actioning
await fetchShifts();
```

### Avatar URLs expire after 1 hour
Signed Supabase Storage URLs are short-lived. Do **not** persist them to disk.
Re-request fresh URLs on each screen load.

### Real-time updates
The web app uses polling (no WebSockets). For Flutter you have two options:

**Option A — Polling timer**
```dart
Timer.periodic(const Duration(seconds: 30), (_) async {
  await fetchShifts();
});
```

**Option B — Supabase Realtime (recommended)**
```dart
supabase
  .from('shift_assignments')
  .stream(primaryKey: ['id'])
  .eq('candidate_id', userId)
  .listen((data) {
    // Update UI when assignments change
  });
```

### Recurring date expansion (client-side)
The API always receives a flat `dates[]` array — the client is responsible for
expanding recurrence patterns before calling `POST /api/*/shifts`.

```dart
// Weekday mapping: Dart DateTime.weekday → 1=Mon, 7=Sun
// Server uses: 0=Sun, 1=Mon … 6=Sat
int dartToServer(int dartWeekday) => dartWeekday % 7;
```

### Error handling quick reference
| HTTP code | Meaning | Flutter action |
|---|---|---|
| 400 | Bad request / invalid params | Show validation error |
| 401 | Not authenticated | Redirect to login |
| 404 | Assignment not found / already actioned | Refresh shift list |
| 409 | Candidate already assigned | Silently skip or show info |
| 500 | Server error | Show generic retry message |

---

## 9. Dart Model Skeletons

```dart
enum AssignmentStatus { pending, confirmed, declined, cancelled }

class ShiftAssignment {
  final String assignmentId;
  final AssignmentStatus status;
  final DateTime assignedAt;
  final String shiftId;
  final String date;          // "YYYY-MM-DD"
  final String startTime;     // "HH:MM"
  final String endTime;       // "HH:MM"
  final String jobTitle;
  final bool isRecurring;
  final String shiftStatus;   // "open" | "filled" | "cancelled"
}

class ShiftNotification {
  final String id;
  final String type;          // "shift"
  final String title;
  final String body;
  final bool read;
  final ShiftNotificationMetadata metadata;
  final String time;          // relative: "2m ago"
  final DateTime createdAt;
}

class ShiftNotificationMetadata {
  final String? shiftId;
  final String? assignmentId;
  final String? jobId;
  final String? jobTitle;
  final String? date;             // single shift
  final String? startDate;        // recurring: first date
  final String? endDate;          // recurring: last date
  final String? startTime;
  final String? endTime;
  final String? recurringGroupId;
  final String? shiftCount;       // "12"
  final String? acted;            // "accepted" | "declined" | "rescinded"
}
```

---

## 10. Raw SQL Reference

```sql
-- All shifts for a job
SELECT id, date, start_time, end_time, status, staff_needed, recurring_group_id
FROM shifts
WHERE job_id = $1
ORDER BY date, start_time;

-- All assignments for a shift
SELECT id, candidate_id, status, assigned_at
FROM shift_assignments
WHERE shift_id = $1
ORDER BY assigned_at DESC;

-- All shifts for a candidate (with job title)
SELECT
  sa.id               AS assignment_id,
  sa.status,
  sa.assigned_at,
  s.id                AS shift_id,
  s.date,
  s.start_time,
  s.end_time,
  s.is_recurring,
  s.status            AS shift_status,
  j.title             AS job_title
FROM shift_assignments sa
JOIN shifts s ON sa.shift_id = s.id
JOIN jobs   j ON s.job_id    = j.id
WHERE sa.candidate_id = $1
  AND sa.status = ANY('{pending,confirmed,declined}'::text[])
ORDER BY sa.assigned_at DESC;

-- All shifts in a recurring group
SELECT id, date, start_time, end_time
FROM shifts
WHERE recurring_group_id = $1
ORDER BY date;

-- Sync shift status after a candidate action
UPDATE shifts
SET status = CASE
  WHEN (
    SELECT COUNT(*) FROM shift_assignments
    WHERE shift_id = shifts.id AND status = 'confirmed'
  ) >= staff_needed THEN 'filled'
  ELSE 'open'
END
WHERE id = $1;

-- Cascade accept/decline across recurring group
UPDATE shift_assignments
SET status = $1   -- 'confirmed' or 'declined'
WHERE candidate_id = $2
  AND status = 'pending'
  AND shift_id IN (
    SELECT id FROM shifts WHERE recurring_group_id = $3
  );
```

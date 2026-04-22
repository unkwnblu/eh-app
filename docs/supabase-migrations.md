# Supabase Migrations

All SQL to run in the **Supabase SQL Editor**, in order.

---

## 1. Clock-in / Clock-out

Adds clock timestamps and GPS coordinates to `shift_assignments`, plus an RLS policy so candidates can update their own row.

```sql
ALTER TABLE public.shift_assignments
  ADD COLUMN IF NOT EXISTS clocked_in_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS clocked_out_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS clocked_in_lat  DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS clocked_in_lng  DOUBLE PRECISION;

-- Allow candidates to update their own assignment (clock-in/out only)
CREATE POLICY "candidate_clockinout" ON public.shift_assignments
  FOR UPDATE
  USING (candidate_id = auth.uid())
  WITH CHECK (candidate_id = auth.uid());
```

**Notes**
- `clocked_in_at` / `clocked_out_at` stored in UTC.
- GPS coordinates captured at clock-in only.

---

## 2. Timesheet Approval Status

Adds an approval status column so admins can mark shifts as approved or rejected.

```sql
ALTER TABLE public.shift_assignments
  ADD COLUMN IF NOT EXISTS timesheet_status TEXT DEFAULT 'pending'
  CHECK (timesheet_status IN ('pending', 'approved', 'rejected'));
```

**Notes**
- Default is `'pending'` — newly clocked-out shifts appear as pending until reviewed.
- Valid values: `pending`, `approved`, `rejected`.

---

## 3. Recurring Shifts

Adds a group ID so recurring shifts can be batched together.

```sql
ALTER TABLE public.shifts
  ADD COLUMN IF NOT EXISTS recurring_group_id UUID;
```

**Notes**
- All shifts in the same recurring batch share the same `recurring_group_id`.
- Non-recurring shifts have `NULL`.

---

## 4. Invoices

Stores generated invoices and their line items.

```sql
-- Invoice headers
CREATE TABLE IF NOT EXISTS public.invoices (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT          NOT NULL UNIQUE,
  employer_id    UUID          NOT NULL,
  employer_name  TEXT          NOT NULL,
  period_start   DATE          NOT NULL,
  period_end     DATE          NOT NULL,
  status         TEXT          DEFAULT 'draft'
                   CHECK (status IN ('draft', 'sent', 'paid')),
  subtotal       NUMERIC(10,2) DEFAULT 0,
  vat_rate       NUMERIC(5,2)  DEFAULT 20,
  vat_amount     NUMERIC(10,2) DEFAULT 0,
  total_amount   NUMERIC(10,2) DEFAULT 0,
  notes          TEXT,
  created_at     TIMESTAMPTZ   DEFAULT now(),
  created_by_id  UUID
);

-- Invoice line items
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id     UUID          NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  assignment_id  UUID,
  candidate_name TEXT          NOT NULL,
  job_title      TEXT,
  shift_date     DATE          NOT NULL,
  hours_worked   NUMERIC(6,2),
  hourly_rate    NUMERIC(8,2),
  amount         NUMERIC(10,2) DEFAULT 0
);

-- Enable RLS (service role key bypasses this — all access is via API routes)
ALTER TABLE public.invoices      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- No public policies intentional: direct client access is blocked.
-- Admin API routes use the service role key which bypasses RLS.
```

---

## 5. Library Documents

Stores training materials, SOPs, and resources for the mobile app library tab.

```sql
CREATE TABLE IF NOT EXISTS public.library_documents (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT        NOT NULL,
  category      TEXT        NOT NULL CHECK (category IN ('training', 'sop', 'resource')),
  description   TEXT,
  file_path     TEXT        NOT NULL,  -- storage path OR direct URL for video/article
  file_type     TEXT        NOT NULL CHECK (file_type IN ('pdf', 'video', 'article', 'other')),
  file_size_mb  NUMERIC(6,2),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.library_documents ENABLE ROW LEVEL SECURITY;

-- Authenticated users (candidates/employers) can read documents via the app
CREATE POLICY "authenticated_read_library_documents"
  ON public.library_documents FOR SELECT
  USING (auth.role() = 'authenticated');
```

---

## 6. FAQ Items

Stores FAQ content displayed in the mobile app.

```sql
CREATE TABLE IF NOT EXISTS public.faq_items (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question  TEXT NOT NULL,
  answer    TEXT NOT NULL,
  category  TEXT NOT NULL DEFAULT 'general',  -- 'general', 'payroll', 'shifts', 'compliance'
  "order"   INT  NOT NULL DEFAULT 0
);

ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_faq"
  ON public.faq_items FOR SELECT
  USING (auth.role() = 'authenticated');
```

---

## 7. Library Storage Bucket

Create the bucket in **Supabase Dashboard → Storage → New bucket**:
- **Name:** `library`
- **Public:** No (private)

Then apply these storage policies:

```sql
-- Authenticated users can read training/sop/resource files
CREATE POLICY "authenticated_read_library_files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'library'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] IN ('trainings', 'sops', 'resources')
  );

-- Candidates can manage their own compliance folder
CREATE POLICY "candidate_manage_own_compliance_files"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'library'
    AND (storage.foldername(name))[1] = 'compliance'
    AND auth.uid()::text = (storage.foldername(name))[2]
  )
  WITH CHECK (
    bucket_id = 'library'
    AND (storage.foldername(name))[1] = 'compliance'
    AND auth.uid()::text = (storage.foldername(name))[2]
  );
```

**Storage folder structure:**
```
library/
  trainings/     ← category = 'training' uploaded files
  sops/          ← category = 'sop' uploaded files
  resources/     ← category = 'resource' uploaded files
  compliance/    ← candidate-uploaded compliance documents
```

---

## Run Order

| # | Migration | Safe to re-run |
|---|-----------|----------------|
| 1 | Clock-in / Clock-out | ✅ (`ADD COLUMN IF NOT EXISTS`) |
| 2 | Timesheet Approval Status | ✅ (`ADD COLUMN IF NOT EXISTS`) |
| 3 | Recurring Shifts | ✅ (`ADD COLUMN IF NOT EXISTS`) |
| 4 | Invoices | ✅ (`CREATE TABLE IF NOT EXISTS`) |
| 5 | Library Documents | ✅ (`CREATE TABLE IF NOT EXISTS`) |
| 6 | FAQ Items | ✅ (`CREATE TABLE IF NOT EXISTS`) |
| 7 | Library Storage Bucket | ⚠️ Create bucket manually first, then run policies |

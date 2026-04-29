# Candidate Avatar — Storage Architecture

## Overview

Candidate profile photos are stored in **Supabase Storage** inside the private
`candidate-documents` bucket. Because the bucket is private, images are never
publicly accessible via a bare URL — every consumer of the image must request a
**signed URL** that expires after 1 hour.

---

## Storage path

```
candidate-documents/
└── {candidate_uuid}/
    └── avatar/
        └── {timestamp}.jpg          ← cropped & re-encoded as JPEG (quality 0.92)
```

**Example**
```
candidate-documents/0b85f0b5-21b8-4ab4-a671-a9cc6ec54c6a/avatar/1777277878957.jpg
```

- The first folder segment is always the candidate's **auth UUID** — this is
  what the RLS policy uses to enforce ownership.
- The filename is `Date.now()` in milliseconds, so each new upload gets a unique
  name. The previous file is deleted server-side before the new one is written,
  so there are no orphaned objects.
- The file is always a JPEG regardless of what the user originally selected
  (PNG, WebP, or JPEG input all come out as JPEG after the canvas crop step).

---

## Database columns

Two columns live on the `public.candidates` table:

| Column            | Type   | Purpose                                              |
|-------------------|--------|------------------------------------------------------|
| `avatar_path`     | `TEXT` | Storage object path, e.g. `{uuid}/avatar/{ts}.jpg`  |
| `avatar_file_name`| `TEXT` | Original file name chosen by the user (display only) |

### Migration (run once in Supabase SQL Editor)

```sql
ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS avatar_path      TEXT,
  ADD COLUMN IF NOT EXISTS avatar_file_name TEXT;
```

---

## RLS policy on storage.objects

The `candidate-documents` bucket is **private**. This policy allows a candidate
to read and write only files whose first path segment matches their own user ID:

```sql
CREATE POLICY "candidate_docs_owner_rw"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'candidate-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

`storage.foldername(name)` returns an array of path segments, so `[1]` is the
first folder — the candidate UUID. This means:

- A candidate **can** upload to `{their-uuid}/avatar/anything.jpg`
- A candidate **cannot** read or overwrite `{another-uuid}/avatar/anything.jpg`
- Admins and the API use the **service role key**, which bypasses RLS entirely

---

## Upload flow (client → storage → database)

```
1. User picks a file  →  crop modal (react-easy-crop)
2. "Apply & Upload" clicked
3. canvas.toBlob() produces a cropped JPEG blob
4. supabase.storage.from("candidate-documents").upload(path, blob, { upsert: true })
      ↑ uses the anon/session key — RLS allows because path starts with user.id
5. PUT /api/candidate/avatar  { fileName, filePath }
      ↑ server-side: validates extension, validates path ownership,
        deletes old avatar object if different path,
        UPDATE candidates SET avatar_path = filePath, avatar_file_name = fileName
        returns a fresh 1-hour signed URL
6. UI sets avatarUrl from the response → image renders immediately
```

---

## Read flow (server → signed URL → `<img>`)

Every time a signed URL is needed the service client generates a **1-hour** URL:

```ts
const { data: signed } = await service.storage
  .from("candidate-documents")
  .createSignedUrl(path, 60 * 60);   // 3600 seconds = 1 hour

// returns e.g.
// https://{project}.supabase.co/storage/v1/object/sign/candidate-documents/{path}?token=…
```

### Where signed URLs are generated

| Location | When |
|---|---|
| `GET /api/candidate/avatar` | Candidate loads their own profile page / layout |
| `GET /api/employer/shifts` | Employer views assigned candidates on a shift |
| `GET /api/admin/verification` | Admin reviews a candidate's verification card |
| `GET /api/admin/candidates/[id]` | Admin opens an individual candidate record |

---

## next/image configuration

Because signed URLs come from Supabase, `next/image` needs the hostname
whitelisted in `next.config.ts`:

```ts
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "*.supabase.co",
      pathname: "/storage/v1/object/sign/**",
    },
  ],
},
```

The wildcard `*.supabase.co` covers any Supabase project ref without hardcoding
the project-specific subdomain.

---

## Viewing the image outside the app

Because the bucket is private, there is **no permanent public URL**. To view an
avatar outside of the application:

1. **Supabase Dashboard → Storage → candidate-documents** — browse to
   `{uuid}/avatar/` and click the file to get a temporary download link.
2. **Generate a signed URL via the Supabase CLI or dashboard SQL editor:**

```sql
SELECT storage.create_signed_url(
  'candidate-documents',
  '{uuid}/avatar/{timestamp}.jpg',
  3600    -- seconds the link is valid
);
```

3. **Via the API** — call `GET /api/candidate/avatar` while authenticated as the
   candidate; the response contains `{ url: "https://…", fileName: "…" }`.

---

## Delete flow

`DELETE /api/candidate/avatar`:

1. Reads `avatar_path` from `candidates` row
2. Calls `storage.remove([path])` to delete the object
3. Sets `avatar_path = null` and `avatar_file_name = null` in the database

If the storage delete fails (e.g. object already gone), the database columns are
still cleared so the UI doesn't show a broken image.

---

## File constraints (enforced server-side)

| Constraint | Value |
|---|---|
| Allowed extensions | `jpg`, `jpeg`, `png`, `webp` |
| Max size (client-side pre-check) | 10 MB (raw file before crop) |
| Output format | JPEG, quality 0.92 |
| Path ownership check | `filePath.startsWith(`${user.id}/`)` |

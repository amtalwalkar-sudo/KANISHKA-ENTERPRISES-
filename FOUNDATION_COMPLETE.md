# KFE 2.0 Foundation Contract

This phase is business-neutral. No archived PWA calculation, formula, business boundary, allocation rule, or dashboard definition is authoritative here.

## Data
- Client-generated UUIDs are used for foundation records and Outbox messages.
- Local records carry `id`, `user_id`, `created_at`, `updated_at`, `synced`, and `is_deleted`.
- Timestamps are ISO/UTC.
- Deletes are represented as soft deletes.
- Dexie schema versions are explicit and migrations are non-destructive by default.

## Local-first
- UI writes through View Models and repositories.
- Local persistence is the first write boundary.
- Outbox state is `pending -> processing -> done`, with failures returned to `pending` using exponential backoff.
- Outbox messages have idempotency keys and record IDs.
- Repository and Outbox operations can share a Dexie read/write transaction.

## Synchronization
- Network state is globally monitored through `online`/`offline` events.
- Sync uses a versioned envelope.
- Cloud writes use idempotent upsert semantics.
- Conflict resolution is infrastructure-level LWW using `updated_at`.
- Soft-delete state participates in conflict resolution to prevent accidental resurrection.

## Cloud
- Supabase configuration is isolated behind `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Supabase authentication sessions are persisted by the client SDK.
- RLS isolates rows by authenticated `user_id`.
- The cloud schema uses a generic `kfe_records` envelope; business-specific columns are intentionally absent.

## Resilience
- Startup requests persistent storage where supported.
- Storage health can report usage/quota/persistence status.
- Quota failures are surfaced as a stable foundation error code.
- Backup/restore operates on the generic local foundation data.
- Global errors and unhandled promise rejections are persisted to diagnostics without allowing diagnostics to crash the app.

## Business layer
The following remain intentionally undefined until a new KFE business specification is supplied:
- calculations
- business boundaries
- validation rules with business thresholds
- allocation rules
- dashboard definitions
- financial semantics
- operational semantics

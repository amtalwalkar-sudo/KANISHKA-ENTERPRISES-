# KFE 2.0 Foundation Rules

This stage is infrastructure-only.

- UI/UX is presentation-only and uses View Model contracts.
- Domain contains no business calculations or business boundaries.
- Repository persistence is local-first.
- Dexie/IndexedDB is the local store.
- Records use client-generated UUIDs and synchronization metadata.
- Deletes are represented as soft deletes.
- Outbox and retry are infrastructure concerns.
- Supabase is an optional cloud synchronization target behind a transport boundary.
- Supabase RLS isolates records by authenticated `user_id`.
- No business columns, formulas, validation rules, allocation rules, or dashboard definitions are defined here.

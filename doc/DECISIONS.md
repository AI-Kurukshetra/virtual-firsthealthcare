# DECISIONS

## 2026-03-14
- Upgraded to Next.js 16 and switched to npm to match user request (overriding previous repo standard).
- Centralized multi-tenant access control via helper SQL functions (`current_org_id`, `current_patient_id`, `has_role`) to keep RLS policies consistent.
- Implemented provider assignment checks via existing appointments rather than adding a new assignment table to keep schema changes minimal while enforcing role access.
- Added `conversation_members` to enforce per-user messaging access and used server-side signed URLs for document downloads to avoid exposing storage keys.
- Added `files.bucket` to support separate document/report storage while keeping the existing file metadata model.
- Restricted `users` and `providers` visibility via appointments to keep patient access scoped to assigned providers only.
- Added `WITH CHECK` clauses on update policies to prevent role-based access from being bypassed by changing foreign keys.
- Allowed providers to read prescriptions for assigned patients to support continuity of care.
- Allowed admins to insert messages without conversation membership to preserve full-access semantics.
- Added `profiles` view to standardize role-based redirect logic without duplicating joins in auth flows.
- Added role-aware sidebar filtering to align navigation with access rules.
- Enforced org-level checks in appointment and messaging actions to prevent cross-tenant leakage.
- Switched to flat ESLint config (`eslint.config.mjs`) for Next 16 compatibility and added a role-relation normalizer to safely read role joins across varying Supabase select shapes.
- Hardened appointment RLS so providers can only create/update appointments for patients they are already assigned to, relying on patients/admins to create new provider-patient assignments.

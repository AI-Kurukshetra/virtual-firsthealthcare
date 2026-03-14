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
- Standardized theme styling on CSS variables + Tailwind tokens and used `next-themes` class mode for light/dark/system support.
- Modeled telehealth sessions using `appointment_rooms` with status and timestamps, adding RLS policies instead of introducing a new table.
- Added invoice + payment RLS to keep billing charts/CRUD scoped to role and organization.
- Tightened prescription writes to require provider assignment for the patient to prevent providers from prescribing outside their care relationships.
- Added middleware role guards for `/admin`, `/provider`, and `/patient` routes to enforce early redirects in addition to layout checks.

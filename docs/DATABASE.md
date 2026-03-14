# Database Schema

## Core Tables
- `organizations`, `users`, `roles`, `permissions`, `user_roles`

## Clinical Tables
- `patients`, `providers`, `provider_availability`
- `appointments`, `appointment_rooms`
- `medical_records`, `clinical_notes`, `care_plans`
- `medications`, `prescriptions`
- `allergies`, `vital_signs`, `diagnoses`, `procedures`
- `lab_orders`, `lab_results`
- `documents`, `files`

## Communication & Operations
- `conversations`, `messages`, `notifications`
- `payments`, `invoices`, `claims`, `insurance_plans`
- `analytics_events`, `audit_logs`

## Multi-Tenant Rules
All business tables include `organization_id` and enforce RLS policies.

## RLS Summary
- Patients: access their own data only
- Providers: access org patients and clinical data
- Admins: access all org data

See `database/migrations/20260314000000_init.sql` (mirrored to `supabase/migrations/20260314000000_init.sql`) for DDL and policies.

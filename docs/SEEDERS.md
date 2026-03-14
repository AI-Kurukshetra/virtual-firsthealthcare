# Seed Data

Seed SQL is located in `database/seeders/seed.sql` and mirrored to `supabase/seed.sql` for the Supabase CLI.

## Seeded Entities
- Organization: HealthCare Plus
- Admin: admin@health.com
- Providers: Dr Sarah Johnson (Cardiology), Dr Michael Lee (Dermatology)
- Patients: John Doe, Jane Smith, Emily Davis, Robert Wilson
- Appointments: 5 sample appointments
- Medical Records: Hypertension and Diabetes examples
- Prescriptions: Lisinopril 10mg, Metformin 500mg
- Lab results example

## Notes
- The seed script inserts into `public.users` and references UUIDs that should be used when creating matching Supabase Auth users.

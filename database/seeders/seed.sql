-- Seed data for Virtual Health Platform
-- Note: auth.users rows should be created via Supabase Auth. Use the UUIDs below when creating auth users.

begin;

do $$
declare
  org_id uuid := gen_random_uuid();
  admin_user_id uuid := gen_random_uuid();
  provider1_user_id uuid := gen_random_uuid();
  provider2_user_id uuid := gen_random_uuid();
  patient1_user_id uuid := gen_random_uuid();
  patient2_user_id uuid := gen_random_uuid();
  patient3_user_id uuid := gen_random_uuid();
  patient4_user_id uuid := gen_random_uuid();
  admin_role uuid;
  provider_role uuid;
  patient_role uuid;
  patient1 uuid;
  patient2 uuid;
  patient3 uuid;
  patient4 uuid;
  provider1 uuid;
  provider2 uuid;
  record1 uuid;
  record2 uuid;
  medication1 uuid;
  medication2 uuid;
  appointment1 uuid;
  appointment2 uuid;
  appointment3 uuid;
  appointment4 uuid;
  appointment5 uuid;
  lab_order1 uuid;
  lab_order2 uuid;
begin
  insert into organizations (id, name, slug)
  values (org_id, 'HealthCare Plus', 'healthcare-plus');

  insert into roles (name) values ('admin') returning id into admin_role;
  insert into roles (name) values ('provider') returning id into provider_role;
  insert into roles (name) values ('patient') returning id into patient_role;

  insert into users (id, organization_id, full_name, email)
  values
    (admin_user_id, org_id, 'HealthCare Plus Admin', 'admin@health.com'),
    (provider1_user_id, org_id, 'Dr Sarah Johnson', 'sarah.johnson@health.com'),
    (provider2_user_id, org_id, 'Dr Michael Lee', 'michael.lee@health.com'),
    (patient1_user_id, org_id, 'John Doe', 'john.doe@health.com'),
    (patient2_user_id, org_id, 'Jane Smith', 'jane.smith@health.com'),
    (patient3_user_id, org_id, 'Emily Davis', 'emily.davis@health.com'),
    (patient4_user_id, org_id, 'Robert Wilson', 'robert.wilson@health.com');

  insert into user_roles (user_id, role_id)
  values
    (admin_user_id, admin_role),
    (provider1_user_id, provider_role),
    (provider2_user_id, provider_role),
    (patient1_user_id, patient_role),
    (patient2_user_id, patient_role),
    (patient3_user_id, patient_role),
    (patient4_user_id, patient_role);

  insert into providers (id, organization_id, user_id, specialty, license_number)
  values
    (gen_random_uuid(), org_id, provider1_user_id, 'Cardiology', 'CARD-1029')
  returning id into provider1;

  insert into providers (id, organization_id, user_id, specialty, license_number)
  values
    (gen_random_uuid(), org_id, provider2_user_id, 'Dermatology', 'DERM-8844')
  returning id into provider2;

  insert into patients (id, organization_id, user_id, date_of_birth, gender, phone, address)
  values
    (gen_random_uuid(), org_id, patient1_user_id, '1974-02-14', 'male', '555-0101', '123 Main St')
  returning id into patient1;

  insert into patients (id, organization_id, user_id, date_of_birth, gender, phone, address)
  values
    (gen_random_uuid(), org_id, patient2_user_id, '1979-06-20', 'female', '555-0102', '45 Oak Ave')
  returning id into patient2;

  insert into patients (id, organization_id, user_id, date_of_birth, gender, phone, address)
  values
    (gen_random_uuid(), org_id, patient3_user_id, '1991-11-08', 'female', '555-0103', '88 Pine Rd')
  returning id into patient3;

  insert into patients (id, organization_id, user_id, date_of_birth, gender, phone, address)
  values
    (gen_random_uuid(), org_id, patient4_user_id, '1985-03-27', 'male', '555-0104', '12 Lake Dr')
  returning id into patient4;

  insert into medical_records (id, organization_id, patient_id)
  values
    (gen_random_uuid(), org_id, patient1)
  returning id into record1;

  insert into medical_records (id, organization_id, patient_id)
  values
    (gen_random_uuid(), org_id, patient2)
  returning id into record2;

  insert into clinical_notes (organization_id, medical_record_id, author_id, soap_subjective, soap_objective, soap_assessment, soap_plan)
  values
    (org_id, record1, provider1, 'Reports headaches and fatigue.', 'BP 158/96.', 'Hypertension stage 1.', 'Start Lisinopril 10mg and lifestyle counseling.'),
    (org_id, record2, provider2, 'Increased thirst and fatigue.', 'A1C 7.8%.', 'Type 2 Diabetes.', 'Begin Metformin 500mg and nutrition plan.');

  insert into care_plans (organization_id, medical_record_id, plan)
  values
    (org_id, record1, 'Monitor BP weekly, follow up in 2 weeks.'),
    (org_id, record2, 'Nutrition counseling, track glucose daily.');

  insert into medications (id, name, description)
  values
    (gen_random_uuid(), 'Lisinopril', 'ACE inhibitor')
  returning id into medication1;

  insert into medications (id, name, description)
  values
    (gen_random_uuid(), 'Metformin', 'Biguanide')
  returning id into medication2;

  insert into prescriptions (organization_id, patient_id, provider_id, medication_id, dosage, frequency, start_date)
  values
    (org_id, patient1, provider1, medication1, '10mg', 'daily', '2026-03-01'),
    (org_id, patient2, provider2, medication2, '500mg', 'twice daily', '2026-03-01');

  insert into appointments (organization_id, patient_id, provider_id, scheduled_at, status, reason)
  values
    (org_id, patient1, provider1, '2026-03-18 09:30:00+00', 'confirmed', 'Hypertension follow-up')
  returning id into appointment1;

  insert into appointments (organization_id, patient_id, provider_id, scheduled_at, status, reason)
  values
    (org_id, patient2, provider2, '2026-03-18 16:00:00+00', 'scheduled', 'Diabetes check-in')
  returning id into appointment2;

  insert into appointments (organization_id, patient_id, provider_id, scheduled_at, status, reason)
  values
    (org_id, patient3, provider2, '2026-03-19 11:15:00+00', 'scheduled', 'Dermatology follow-up')
  returning id into appointment3;

  insert into appointments (organization_id, patient_id, provider_id, scheduled_at, status, reason)
  values
    (org_id, patient4, provider1, '2026-03-19 14:45:00+00', 'scheduled', 'Cardiology consult')
  returning id into appointment4;

  insert into appointments (organization_id, patient_id, provider_id, scheduled_at, status, reason)
  values
    (org_id, patient1, provider1, '2026-03-20 10:00:00+00', 'scheduled', 'BP review')
  returning id into appointment5;

  insert into appointment_rooms (organization_id, appointment_id, room_token, status)
  values
    (org_id, appointment1, 'room_apt_201', 'ready');

  insert into lab_orders (organization_id, patient_id, provider_id, status)
  values
    (org_id, patient3, provider2, 'pending')
  returning id into lab_order1;

  insert into lab_orders (organization_id, patient_id, provider_id, status)
  values
    (org_id, patient4, provider1, 'completed')
  returning id into lab_order2;

  insert into lab_results (organization_id, lab_order_id, result)
  values
    (org_id, lab_order2, 'CBC within normal ranges.');

end $$;

commit;

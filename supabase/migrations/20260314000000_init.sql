-- Extensions
create extension if not exists "pgcrypto";

-- Enums
create type appointment_status as enum ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
create type room_status as enum ('ready', 'live', 'ended');
create type message_status as enum ('sent', 'delivered', 'read');
create type invoice_status as enum ('draft', 'issued', 'paid', 'void');
create type claim_status as enum ('submitted', 'approved', 'denied', 'paid');

-- Core org + auth
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists roles (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);

create table if not exists permissions (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);

create table if not exists role_permissions (
  role_id uuid references roles(id) on delete cascade,
  permission_id uuid references permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  full_name text not null,
  email text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists user_roles (
  user_id uuid references users(id) on delete cascade,
  role_id uuid references roles(id) on delete cascade,
  primary key (user_id, role_id)
);

-- Clinical domain
create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  date_of_birth date,
  gender text,
  phone text,
  address text,
  created_at timestamptz not null default now()
);

create table if not exists providers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  specialty text,
  license_number text,
  created_at timestamptz not null default now()
);

create table if not exists provider_availability (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  provider_id uuid references providers(id) on delete cascade,
  day_of_week int not null,
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now()
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  patient_id uuid references patients(id) on delete cascade,
  provider_id uuid references providers(id) on delete set null,
  scheduled_at timestamptz not null,
  status appointment_status not null default 'scheduled',
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists appointment_rooms (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  appointment_id uuid references appointments(id) on delete cascade,
  room_token text not null,
  status room_status not null default 'ready',
  created_at timestamptz not null default now()
);

create table if not exists medical_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  patient_id uuid references patients(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists clinical_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  medical_record_id uuid references medical_records(id) on delete cascade,
  author_id uuid references providers(id) on delete set null,
  soap_subjective text,
  soap_objective text,
  soap_assessment text,
  soap_plan text,
  created_at timestamptz not null default now()
);

create table if not exists care_plans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  medical_record_id uuid references medical_records(id) on delete cascade,
  plan text,
  created_at timestamptz not null default now()
);

create table if not exists medications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text
);

create table if not exists prescriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  patient_id uuid references patients(id) on delete cascade,
  provider_id uuid references providers(id) on delete set null,
  medication_id uuid references medications(id) on delete set null,
  dosage text,
  frequency text,
  start_date date,
  end_date date,
  created_at timestamptz not null default now()
);

create table if not exists allergies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  patient_id uuid references patients(id) on delete cascade,
  allergen text not null,
  reaction text,
  severity text,
  created_at timestamptz not null default now()
);

create table if not exists vital_signs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  patient_id uuid references patients(id) on delete cascade,
  recorded_at timestamptz not null default now(),
  height_cm numeric,
  weight_kg numeric,
  blood_pressure text,
  heart_rate int,
  temperature_c numeric
);

create table if not exists diagnoses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  patient_id uuid references patients(id) on delete cascade,
  code text,
  description text,
  diagnosed_at timestamptz not null default now()
);

create table if not exists procedures (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  patient_id uuid references patients(id) on delete cascade,
  code text,
  description text,
  performed_at timestamptz not null default now()
);

create table if not exists lab_orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  patient_id uuid references patients(id) on delete cascade,
  provider_id uuid references providers(id) on delete set null,
  ordered_at timestamptz not null default now(),
  status text not null default 'pending'
);

create table if not exists lab_results (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  lab_order_id uuid references lab_orders(id) on delete cascade,
  result text,
  reported_at timestamptz not null default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  patient_id uuid references patients(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now()
);

create table if not exists files (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  document_id uuid references documents(id) on delete cascade,
  s3_key text not null,
  mime_type text,
  created_at timestamptz not null default now()
);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  conversation_id uuid references conversations(id) on delete cascade,
  sender_id uuid references users(id) on delete set null,
  body text,
  status message_status not null default 'sent',
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  invoice_id uuid,
  amount numeric not null,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  patient_id uuid references patients(id) on delete set null,
  status invoice_status not null default 'draft',
  total numeric not null,
  due_date date,
  created_at timestamptz not null default now()
);

create table if not exists claims (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  invoice_id uuid references invoices(id) on delete cascade,
  status claim_status not null default 'submitted',
  submitted_at timestamptz not null default now()
);

create table if not exists insurance_plans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  patient_id uuid references patients(id) on delete cascade,
  provider text,
  policy_number text,
  created_at timestamptz not null default now()
);

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  event_name text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  action text not null,
  target text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- Helper functions
create or replace function public.current_org_id() returns uuid
language sql stable as $$
  select organization_id from public.users where id = auth.uid();
$$;

create or replace function public.current_patient_id() returns uuid
language sql stable as $$
  select id from public.patients where user_id = auth.uid();
$$;

create or replace function public.has_role(role_name text) returns boolean
language sql stable as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid() and r.name = role_name
  );
$$;

-- RLS
alter table organizations enable row level security;
alter table users enable row level security;
alter table roles enable row level security;
alter table permissions enable row level security;
alter table role_permissions enable row level security;
alter table user_roles enable row level security;
alter table patients enable row level security;
alter table providers enable row level security;
alter table provider_availability enable row level security;
alter table appointments enable row level security;
alter table appointment_rooms enable row level security;
alter table medical_records enable row level security;
alter table clinical_notes enable row level security;
alter table care_plans enable row level security;
alter table medications enable row level security;
alter table prescriptions enable row level security;
alter table allergies enable row level security;
alter table vital_signs enable row level security;
alter table diagnoses enable row level security;
alter table procedures enable row level security;
alter table lab_orders enable row level security;
alter table lab_results enable row level security;
alter table documents enable row level security;
alter table files enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;
alter table payments enable row level security;
alter table invoices enable row level security;
alter table claims enable row level security;
alter table insurance_plans enable row level security;
alter table analytics_events enable row level security;
alter table audit_logs enable row level security;

-- Policies: organizations + users
create policy "org_members_select" on organizations
  for select using (id = public.current_org_id());

create policy "users_org_select" on users
  for select using (organization_id = public.current_org_id());

create policy "users_self_update" on users
  for update using (id = auth.uid());

-- Policies: clinical data
create policy "patients_access" on patients
  for select using (
    (organization_id = public.current_org_id() and (public.has_role('admin') or public.has_role('provider')))
    or (public.has_role('patient') and user_id = auth.uid())
  );

create policy "patients_write" on patients
  for insert with check (organization_id = public.current_org_id() and public.has_role('admin'));

create policy "providers_access" on providers
  for select using (organization_id = public.current_org_id() and (public.has_role('admin') or public.has_role('provider')));

create policy "appointments_access" on appointments
  for select using (
    (organization_id = public.current_org_id() and (public.has_role('admin') or public.has_role('provider')))
    or (public.has_role('patient') and patient_id = public.current_patient_id())
  );

create policy "records_access" on medical_records
  for select using (
    (organization_id = public.current_org_id() and (public.has_role('admin') or public.has_role('provider')))
    or (public.has_role('patient') and patient_id = public.current_patient_id())
  );

create policy "notes_access" on clinical_notes
  for select using (
    organization_id = public.current_org_id() and (public.has_role('admin') or public.has_role('provider'))
  );

create policy "prescriptions_access" on prescriptions
  for select using (
    (organization_id = public.current_org_id() and (public.has_role('admin') or public.has_role('provider')))
    or (public.has_role('patient') and patient_id = public.current_patient_id())
  );

create policy "labs_access" on lab_orders
  for select using (
    (organization_id = public.current_org_id() and (public.has_role('admin') or public.has_role('provider')))
    or (public.has_role('patient') and patient_id = public.current_patient_id())
  );

create policy "lab_results_access" on lab_results
  for select using (
    organization_id = public.current_org_id() and (public.has_role('admin') or public.has_role('provider'))
  );

create policy "documents_access" on documents
  for select using (
    (organization_id = public.current_org_id() and (public.has_role('admin') or public.has_role('provider')))
    or (public.has_role('patient') and patient_id = public.current_patient_id())
  );

create policy "files_access" on files
  for select using (organization_id = public.current_org_id() and (public.has_role('admin') or public.has_role('provider')));

create policy "messages_access" on messages
  for select using (organization_id = public.current_org_id());

create policy "notifications_access" on notifications
  for select using (organization_id = public.current_org_id() and user_id = auth.uid());

create policy "billing_access" on invoices
  for select using (organization_id = public.current_org_id() and (public.has_role('admin') or public.has_role('provider')));

create policy "analytics_access" on analytics_events
  for select using (organization_id = public.current_org_id() and public.has_role('admin'));

create policy "audit_access" on audit_logs
  for select using (organization_id = public.current_org_id() and public.has_role('admin'));

-- Indexes
create index if not exists idx_users_org on users(organization_id);
create index if not exists idx_patients_org on patients(organization_id);
create index if not exists idx_providers_org on providers(organization_id);
create index if not exists idx_appointments_org on appointments(organization_id);
create index if not exists idx_medical_records_org on medical_records(organization_id);

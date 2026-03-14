import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });
dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const SEED_DOMAIN = "seed.local";

const adminNames = ["Avery Collins", "Priya Sharma", "Marcus Bennett"];

const providerNames = [
  "Isabella Cruz",
  "Ethan Walker",
  "Sofia Nguyen",
  "Liam Patel",
  "Maya Thompson",
  "Noah Rivera",
  "Olivia Martinez",
  "Daniel Kim",
  "Chloe Carter",
  "Arjun Mehta"
];

const patientNames = [
  "Hannah Brooks",
  "Javier Morales",
  "Leah Simmons",
  "Adrian Foster",
  "Emily Chen",
  "William Scott",
  "Zoe James",
  "Samuel Ortiz",
  "Nora Diaz",
  "Jacob Allen",
  "Layla Parker",
  "Omar Flores",
  "Grace Lee",
  "Henry Price",
  "Lucy Nelson",
  "Elias Moore",
  "Ava Nguyen",
  "David Hughes",
  "Mila Sanchez",
  "Ryan Cooper",
  "Ella Wright",
  "Mateo Torres",
  "Riley Howard",
  "Gabriel Ross",
  "Stella Reed",
  "Julian Brooks",
  "Camila Barnes",
  "Thomas Gray",
  "Luna Powell",
  "Nathan Perry"
];

const specialties = [
  "Family Medicine",
  "Internal Medicine",
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Neurology",
  "Endocrinology",
  "Orthopedics",
  "Psychiatry",
  "OB-GYN"
];

const medicationList = [
  "Atorvastatin",
  "Metformin",
  "Lisinopril",
  "Amlodipine",
  "Albuterol",
  "Levothyroxine",
  "Sertraline",
  "Omeprazole",
  "Losartan",
  "Azithromycin"
];

const appointmentReasons = [
  "Annual wellness visit",
  "Follow-up consultation",
  "Medication review",
  "Lab results discussion",
  "Persistent headache",
  "Joint pain assessment",
  "Telehealth check-in",
  "Post-op follow-up",
  "Skin rash evaluation",
  "Anxiety management"
];

const documentTypes = ["Lab Report", "Radiology", "Discharge Summary", "Referral", "Insurance"];
const messageBodies = [
  "Checking in after your last visit.",
  "Please confirm your appointment time.",
  "Your lab results are ready for review.",
  "Remember to take medication with food.",
  "We updated your care plan.",
  "Let us know if symptoms change.",
  "Can we reschedule for next week?",
  "Please upload your insurance card.",
  "Thanks for the update.",
  "I have a follow-up question about my prescription."
];
const allergens = ["Peanuts", "Shellfish", "Penicillin", "Pollen", "Latex", "Dairy"];
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const clinics = [
  "North Bay Family Clinic",
  "Sunset Internal Medicine",
  "Blue Ridge Cardiology",
  "Harborview Pediatrics",
  "Evergreen Neurology",
  "Summit Health Partners"
];
const appointmentTypes: string[] = ["video", "clinic"];
const paymentMethods = ["card", "insurance", "bank_transfer"];

function rand<T>(list: T[]) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomDateWithin(days: number) {
  const now = new Date();
  const offset = Math.floor(Math.random() * days * 24 * 60 * 60 * 1000);
  return new Date(now.getTime() - offset);
}

function randomDateBetween(daysFromNowStart: number, daysFromNowEnd: number) {
  const now = new Date();
  const start = now.getTime() + daysFromNowStart * 24 * 60 * 60 * 1000;
  const end = now.getTime() + daysFromNowEnd * 24 * 60 * 60 * 1000;
  const min = Math.min(start, end);
  const max = Math.max(start, end);
  const offset = Math.floor(Math.random() * (max - min));
  return new Date(min + offset);
}

function toIso(date: Date) {
  return date.toISOString();
}

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function clearData() {
  const tables: { name: string; filterColumn: string }[] = [
    { name: "analytics_events", filterColumn: "id" },
    { name: "audit_logs", filterColumn: "id" },
    { name: "payments", filterColumn: "id" },
    { name: "claims", filterColumn: "id" },
    { name: "invoices", filterColumn: "id" },
    { name: "notifications", filterColumn: "id" },
    { name: "messages", filterColumn: "id" },
    { name: "conversation_members", filterColumn: "conversation_id" },
    { name: "conversations", filterColumn: "id" },
    { name: "files", filterColumn: "id" },
    { name: "documents", filterColumn: "id" },
    { name: "lab_results", filterColumn: "id" },
    { name: "lab_orders", filterColumn: "id" },
    { name: "appointment_rooms", filterColumn: "id" },
    { name: "appointments", filterColumn: "id" },
    { name: "prescriptions", filterColumn: "id" },
    { name: "allergies", filterColumn: "id" },
    { name: "medications", filterColumn: "id" },
    { name: "medical_records", filterColumn: "id" },
    { name: "vital_signs", filterColumn: "id" },
    { name: "diagnoses", filterColumn: "id" },
    { name: "procedures", filterColumn: "id" },
    { name: "insurance_plans", filterColumn: "id" },
    { name: "provider_availability", filterColumn: "id" },
    { name: "providers", filterColumn: "id" },
    { name: "patients", filterColumn: "id" },
    { name: "user_roles", filterColumn: "user_id" },
    { name: "users", filterColumn: "id" },
    { name: "organizations", filterColumn: "id" }
  ];

  for (const table of tables) {
    const { error } = await supabase
      .from(table.name)
      .delete()
      .neq(table.filterColumn, "00000000-0000-0000-0000-000000000000");
    if (error && !error.message.includes("does not exist")) {
      throw error;
    }
  }

  const { data: users } = await supabase.auth.admin.listUsers({ perPage: 200 });
  if (users?.users) {
    const seedUsers = users.users.filter((user) => user.email?.endsWith(`@${SEED_DOMAIN}`));
    for (const user of seedUsers) {
      await supabase.auth.admin.deleteUser(user.id);
    }
  }
}

async function seed() {
  await clearData();

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({ name: "Virtual Health Platform", slug: "virtual-health" })
    .select("id")
    .single();

  if (orgError || !org?.id) throw orgError;

  const organizationId = org.id;

  const roleNames = ["admin", "provider", "patient"];
  const roles: Record<string, string> = {};

  for (const role of roleNames) {
    const { data: existing } = await supabase
      .from("roles")
      .select("id")
      .eq("name", role)
      .maybeSingle();

    if (existing?.id) {
      roles[role] = existing.id;
      continue;
    }

    const { data: created, error } = await supabase
      .from("roles")
      .insert({ name: role })
      .select("id")
      .single();
    if (error || !created?.id) throw error;
    roles[role] = created.id;
  }

  const allUsers: { id: string; full_name: string; email: string; role: string }[] = [];

  async function createAuthUser(fullName: string, role: string, phone: string) {
    const email = `${fullName.toLowerCase().replace(/\s+/g, ".")}@${SEED_DOMAIN}`;
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: "Password123!",
      email_confirm: true,
      user_metadata: { full_name: fullName, role, phone }
    });
    if (error || !data?.user) throw error;
    return { id: data.user.id, email };
  }

  for (const [index, name] of adminNames.entries()) {
    const phone = `+1-646-555-${String(2000 + index).slice(-4)}`;
    const authUser = await createAuthUser(name, "admin", phone);
    allUsers.push({ id: authUser.id, full_name: name, email: authUser.email, role: "admin" });
  }

  for (const [index, name] of providerNames.entries()) {
    const phone = `+1-415-555-${String(3000 + index).slice(-4)}`;
    const authUser = await createAuthUser(name, "provider", phone);
    allUsers.push({ id: authUser.id, full_name: name, email: authUser.email, role: "provider" });
  }

  for (const [index, name] of patientNames.entries()) {
    const phone = `+1-202-555-${String(1000 + index).slice(-4)}`;
    const authUser = await createAuthUser(name, "patient", phone);
    allUsers.push({ id: authUser.id, full_name: name, email: authUser.email, role: "patient" });
  }

  const usersInsert = allUsers.map((user, index) => ({
    id: user.id,
    organization_id: organizationId,
    full_name: user.full_name,
    email: user.email,
    phone: `+1-555-01${String(100 + index).slice(-3)}`,
    created_at: toIso(randomDateWithin(90)),
    profile_image: `https://cdn.${SEED_DOMAIN}/avatars/${index + 1}.jpg`,
    avatar_url: `https://cdn.${SEED_DOMAIN}/avatars/${index + 1}.jpg`
  }));

  const { error: usersError } = await supabase.from("users").insert(usersInsert);
  if (usersError) throw usersError;

  const roleRows = allUsers.map((user) => ({
    user_id: user.id,
    role_id: roles[user.role]
  }));

  const { error: roleError } = await supabase.from("user_roles").insert(roleRows);
  if (roleError) throw roleError;

  const providerUsers = allUsers.filter((user) => user.role === "provider");
  const patientUsers = allUsers.filter((user) => user.role === "patient");

  const { data: providers, error: providerError } = await supabase
    .from("providers")
    .insert(
      providerUsers.map((user, index) => ({
        organization_id: organizationId,
        user_id: user.id,
        specialty: specialties[index % specialties.length],
        license_number: `LIC-${10000 + index}`,
        years_of_experience: 4 + (index % 18),
        bio: `Board-certified ${specialties[index % specialties.length]} specialist focused on virtual-first care delivery.`,
        clinic_name: clinics[index % clinics.length],
        created_at: toIso(randomDateWithin(90))
      }))
    )
    .select("id, user_id");

  if (providerError || !providers) throw providerError;

  const { data: patients, error: patientError } = await supabase
    .from("patients")
    .insert(
      patientUsers.map((user, index) => ({
        organization_id: organizationId,
        user_id: user.id,
        date_of_birth: toDateString(randomDateWithin(20000)),
        gender: rand(["female", "male", "non-binary"]),
        blood_group: rand(bloodGroups),
        emergency_contact: `+1-408-555-${String(2000 + index).slice(-4)}`,
        phone: `+1-202-555-${String(1000 + index).slice(-4)}`,
        address: `${200 + index} Market Street, San Francisco, CA`,
        created_at: toIso(randomDateWithin(90))
      }))
    )
    .select("id, user_id");

  if (patientError || !patients) throw patientError;

  const allergyRows = patients.map((patient) => ({
    organization_id: organizationId,
    patient_id: patient.id,
    allergen: rand(allergens),
    reaction: rand(["Rash", "Hives", "Shortness of breath", "Swelling"]),
    severity: rand(["mild", "moderate", "severe"]),
    created_at: toIso(randomDateWithin(90))
  }));

  await supabase.from("allergies").insert(allergyRows);

  const availabilityRows = providers.flatMap((provider) =>
    [1, 2, 3, 4, 5].map((day) => ({
      organization_id: organizationId,
      provider_id: provider.id,
      day_of_week: day,
      start_time: "09:00",
      end_time: "17:00"
    }))
  );

  await supabase.from("provider_availability").insert(availabilityRows);

  const { data: meds, error: medsError } = await supabase
    .from("medications")
    .insert(medicationList.map((name) => ({ name, description: `${name} standard dosage` })))
    .select("id, name");

  if (medsError || !meds) throw medsError;

  const appointments = [] as any[];
  const patientAssignments = new Map<string, string[]>();

  providers.forEach((provider, index) => {
    const assigned = patients
      .filter((_, patientIndex) => patientIndex % providers.length === index)
      .map((patient) => patient.id);
    patientAssignments.set(provider.id, assigned);
  });

  for (const provider of providers) {
    const assignedPatients = patientAssignments.get(provider.id) ?? [];
    const selected = assignedPatients.slice(0, 3);

    selected.forEach((patientId) => {
      appointments.push({
        organization_id: organizationId,
        patient_id: patientId,
        provider_id: provider.id,
        scheduled_at: toIso(randomDateBetween(1, 14)),
        appointment_type: rand(appointmentTypes),
        status: "scheduled",
        reason: rand(appointmentReasons)
      });
    });
  }

  for (const patient of patients) {
    const provider = providers[patients.indexOf(patient) % providers.length];
    appointments.push({
      organization_id: organizationId,
      patient_id: patient.id,
      provider_id: provider.id,
      scheduled_at: toIso(randomDateBetween(-90, -3)),
      appointment_type: rand(appointmentTypes),
      status: rand(["completed", "cancelled"]),
      reason: rand(appointmentReasons)
    });
  }

  while (appointments.length < 50) {
    const provider = rand(providers);
    const assigned = patientAssignments.get(provider.id) ?? [];
    const patientId = rand(assigned.length ? assigned : patients.map((p) => p.id));
    appointments.push({
      organization_id: organizationId,
      patient_id: patientId,
      provider_id: provider.id,
      scheduled_at: toIso(randomDateBetween(-90, 14)),
      appointment_type: rand(appointmentTypes),
      status: rand(["scheduled", "completed", "cancelled"]),
      reason: rand(appointmentReasons)
    });
  }

  const { data: createdAppointments, error: appointmentError } = await supabase
    .from("appointments")
    .insert(appointments)
    .select("id, patient_id, provider_id");

  if (appointmentError || !createdAppointments) throw appointmentError;

  const roomRows = createdAppointments.slice(0, 20).map((appointment) => ({
    organization_id: organizationId,
    appointment_id: appointment.id,
    room_token: `room_${appointment.id.slice(0, 8)}`,
    status: rand(["ready", "live", "ended"]),
    started_at: toIso(randomDateBetween(-7, 7)),
    ended_at: toIso(randomDateBetween(-6, 8))
  }));

  await supabase.from("appointment_rooms").insert(roomRows);

  const medicalRecords = patients.map((patient) => ({
    organization_id: organizationId,
    patient_id: patient.id
  }));

  await supabase.from("medical_records").insert(medicalRecords);

  const prescriptions = patients.map((patient, index) => ({
    organization_id: organizationId,
    patient_id: patient.id,
    provider_id: providers[index % providers.length].id,
    medication_id: meds[index % meds.length].id,
    dosage: "1 tablet",
    frequency: rand(["once daily", "twice daily", "every 8 hours"]),
    start_date: toDateString(randomDateBetween(-90, -10)),
    end_date: toDateString(randomDateBetween(5, 60))
  }));

  await supabase.from("prescriptions").insert(prescriptions);

  const documents = patients.map((patient, index) => ({
    organization_id: organizationId,
    patient_id: patient.id,
    title: `Patient Report #${index + 1}`,
    document_type: "Lab Report",
    uploaded_at: toIso(randomDateBetween(-90, -1)),
    created_at: toIso(randomDateBetween(-90, -1))
  }));

  while (documents.length < 55) {
    const patient = rand(patients);
    documents.push({
      organization_id: organizationId,
      patient_id: patient.id,
      title: `${rand(documentTypes)} #${documents.length + 1}`,
      document_type: rand(documentTypes),
      uploaded_at: toIso(randomDateBetween(-90, -1)),
      created_at: toIso(randomDateBetween(-90, -1))
    });
  }

  const { data: createdDocs } = await supabase.from("documents").insert(documents).select("id");

  if (createdDocs) {
    const fileRows = createdDocs.map((doc, index) => ({
      organization_id: organizationId,
      document_id: doc.id,
      s3_key: `s3://virtual-health/${doc.id}/document-${index + 1}.pdf`,
      mime_type: "application/pdf",
      file_name: `document-${index + 1}.pdf`,
      file_type: "pdf",
      bucket: index < patients.length ? "reports" : rand(["documents", "reports"])
    }));
    await supabase.from("files").insert(fileRows);
  }

  const conversationRows = [] as { id?: string; organization_id: string }[];
  for (let i = 0; i < 12; i += 1) {
    conversationRows.push({ organization_id: organizationId });
  }

  const { data: conversations } = await supabase.from("conversations").insert(conversationRows).select("id");

  if (conversations) {
    const conversationMembers = conversations.flatMap((conversation, index) => {
      const provider = providers[index % providers.length];
      const patient = patients[index % patients.length];
      return [
        { conversation_id: conversation.id, user_id: provider.user_id, role: "provider" },
        { conversation_id: conversation.id, user_id: patient.user_id, role: "patient" }
      ];
    });

    await supabase.from("conversation_members").insert(conversationMembers);

    const messages = Array.from({ length: 40 }).map((_, index) => {
      const conversation = conversations[index % conversations.length];
      const provider = providers[index % providers.length];
      const patient = patients[index % patients.length];
      const senderId = index % 2 === 0 ? provider.user_id : patient.user_id;
      return {
        organization_id: organizationId,
        conversation_id: conversation.id,
        sender_id: senderId,
        receiver_id: senderId === provider.user_id ? patient.user_id : provider.user_id,
        body: rand(messageBodies),
        status: rand(["sent", "delivered", "read"]),
        created_at: toIso(randomDateWithin(30))
      };
    });

    await supabase.from("messages").insert(messages);
  }

  const notifications = allUsers.map((user, index) => {
    const isRead = index % 4 !== 0;
    return {
      organization_id: organizationId,
      user_id: user.id,
      title: rand(["Appointment update", "New message", "Lab results ready", "Billing notice"]),
      body: rand(["Please check your dashboard.", "Action required.", "Update completed."]),
      type: rand(["info", "alert", "success"]),
      is_read: isRead,
      read_at: isRead ? toIso(randomDateBetween(-7, -1)) : null,
      created_at: toIso(randomDateBetween(-7, 0))
    };
  });

  while (notifications.length < 60) {
    const user = rand(allUsers);
    const isRead = Math.random() > 0.3;
    notifications.push({
      organization_id: organizationId,
      user_id: user.id,
      title: rand(["Appointment update", "New message", "Lab results ready", "Billing notice"]),
      body: rand(["Please check your dashboard.", "Action required.", "Update completed."]),
      type: rand(["info", "alert", "success"]),
      is_read: isRead,
      read_at: isRead ? toIso(randomDateBetween(-7, -1)) : null,
      created_at: toIso(randomDateBetween(-30, 0))
    });
  }

  await supabase.from("notifications").insert(notifications);

  const invoices = Array.from({ length: 25 }).map((_, index) => {
    const patient = rand(patients);
    const appointment = createdAppointments[index % createdAppointments.length];
    const providerId = appointment?.provider_id ?? providers[index % providers.length].id;
    return {
      organization_id: organizationId,
      patient_id: patient.id,
      provider_id: providerId,
      appointment_id: appointment?.id ?? null,
      status: rand(["draft", "issued", "paid", "void"]),
      total: 120 + index * 5,
      currency: "USD",
      payment_method: rand(paymentMethods),
      due_date: toDateString(randomDateBetween(-30, 30)),
      created_at: toIso(randomDateBetween(-90, -1))
    };
  });

  const { data: createdInvoices } = await supabase.from("invoices").insert(invoices).select("id, status, total");

  if (createdInvoices) {
    const payments = createdInvoices
      .filter((invoice) => invoice.status === "paid")
      .map((invoice) => ({
        organization_id: organizationId,
        invoice_id: invoice.id,
        amount: invoice.total,
        paid_at: toIso(randomDateWithin(30))
      }));

    if (payments.length > 0) {
      await supabase.from("payments").insert(payments);
    }
  }

  const auditLogs = Array.from({ length: 50 }).map((_, index) => {
    const user = rand(allUsers);
    return {
      organization_id: organizationId,
      user_id: user.id,
      action: rand(["login", "create_appointment", "upload_document", "write_prescription"]),
      target: rand(["appointments", "documents", "prescriptions", "messages"]),
      metadata: {
        description: rand([
          "User logged in",
          "Appointment created",
          "Document uploaded",
          "Prescription issued"
        ]),
        index
      },
      created_at: toIso(randomDateBetween(-90, 0))
    };
  });

  await supabase.from("audit_logs").insert(auditLogs);

  const analyticsEvents = Array.from({ length: 120 }).map((_, index) => ({
    organization_id: organizationId,
    user_id: rand(allUsers).id,
    event_name: rand(["dashboard_view", "appointment_booked", "message_sent", "record_updated"]),
    metadata: {
      day: index,
      source: rand(["web", "mobile", "api"])
    },
    created_at: toIso(randomDateBetween(-90, 0))
  }));

  await supabase.from("analytics_events").insert(analyticsEvents);

  const summary = {
    users: allUsers.length,
    providers: providers.length,
    patients: patients.length,
    appointments: createdAppointments.length,
    prescriptions: prescriptions.length,
    allergies: allergyRows.length,
    documents: createdDocs?.length ?? 0,
    messages: 40,
    notifications: notifications.length,
    invoices: createdInvoices?.length ?? 0,
    audit_logs: auditLogs.length,
    analytics_events: analyticsEvents.length
  };

  console.log("Seed complete:", summary);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});

"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUserContext } from "@/lib/auth/user-context";
import {
  ensureOrg,
  ensurePatientOrProvider,
  ensureRoleId,
  ensureRoleMapping,
  upsertPublicProfile
} from "@/lib/auth/provision";
import {
  patientCreateSchema,
  patientUpdateSchema,
  type PatientCreateInput,
  type PatientUpdateInput
} from "@/lib/validations/patients";

function parsePatientCreate(formData: FormData): PatientCreateInput {
  return {
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    dateOfBirth: String(formData.get("dateOfBirth") ?? "").trim() || undefined,
    gender: String(formData.get("gender") ?? "").trim() || undefined,
    phone: String(formData.get("phone") ?? "").trim() || undefined,
    address: String(formData.get("address") ?? "").trim() || undefined
  };
}

function parsePatientUpdate(formData: FormData): PatientUpdateInput {
  return {
    id: String(formData.get("id") ?? ""),
    fullName: String(formData.get("fullName") ?? ""),
    dateOfBirth: String(formData.get("dateOfBirth") ?? "").trim() || undefined,
    gender: String(formData.get("gender") ?? "").trim() || undefined,
    phone: String(formData.get("phone") ?? "").trim() || undefined,
    address: String(formData.get("address") ?? "").trim() || undefined
  };
}

export async function createPatientAction(formData: FormData) {
  const parsed = patientCreateSchema.safeParse(parsePatientCreate(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid patient details." };
  }

  const context = await getUserContext();
  if ("error" in context) {
    return { error: context.error };
  }

  if (context.role !== "admin") {
    return { error: "Only admins can create patients." };
  }

  const adminClient = createSupabaseAdminClient();
  const orgId = await ensureOrg(adminClient);
  const roleId = await ensureRoleId(adminClient, "patient");

  const { data: created, error: adminError } = await adminClient.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      full_name: parsed.data.fullName,
      role: "patient"
    }
  });

  if (adminError || !created?.user) {
    return { error: adminError?.message ?? "Failed to create patient." };
  }

  const userId = created.user.id;

  await upsertPublicProfile({
    adminClient,
    userId,
    organizationId: orgId,
    fullName: parsed.data.fullName,
    email: parsed.data.email
  });

  await ensureRoleMapping({ adminClient, userId, roleId });
  await ensurePatientOrProvider({
    adminClient,
    role: "patient",
    organizationId: orgId,
    userId
  });

  const { error: patientError } = await adminClient
    .from("patients")
    .update({
      date_of_birth: parsed.data.dateOfBirth || null,
      gender: parsed.data.gender || null,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null
    })
    .eq("user_id", userId);

  if (patientError) {
    return { error: patientError.message };
  }

  return { success: "Patient created." };
}

export async function updatePatientAction(formData: FormData) {
  const parsed = patientUpdateSchema.safeParse(parsePatientUpdate(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid patient details." };
  }

  const context = await getUserContext();
  if ("error" in context) {
    return { error: context.error };
  }

  const { data: patient } = await context.supabase
    .from("patients")
    .select("id, user_id")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (!patient?.id) {
    return { error: "Patient not found." };
  }

  const { error: updateError } = await context.supabase
    .from("patients")
    .update({
      date_of_birth: parsed.data.dateOfBirth || null,
      gender: parsed.data.gender || null,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null
    })
    .eq("id", parsed.data.id);

  if (updateError) {
    return { error: updateError.message };
  }

  if (patient.user_id) {
    if (context.role === "admin") {
      const adminClient = createSupabaseAdminClient();
      const { error: userError } = await adminClient
        .from("users")
        .update({ full_name: parsed.data.fullName })
        .eq("id", patient.user_id);
      if (userError) {
        return { error: userError.message };
      }
    } else if (patient.user_id === context.userId) {
      const { error: userError } = await context.supabase
        .from("users")
        .update({ full_name: parsed.data.fullName })
        .eq("id", patient.user_id);
      if (userError) {
        return { error: userError.message };
      }
    }
  }

  return { success: "Patient updated." };
}

export async function deletePatientAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing patient id." };

  const context = await getUserContext();
  if ("error" in context) {
    return { error: context.error };
  }

  if (context.role !== "admin") {
    return { error: "Only admins can delete patients." };
  }

  const { error } = await context.supabase.from("patients").delete().eq("id", id);
  if (error) {
    return { error: error.message };
  }

  return { success: "Patient removed." };
}

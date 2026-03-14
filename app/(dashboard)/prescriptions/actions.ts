"use server";

import { getUserContext } from "@/lib/auth/user-context";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  prescriptionCreateSchema,
  prescriptionUpdateSchema,
  type PrescriptionCreateInput,
  type PrescriptionUpdateInput
} from "@/lib/validations/prescriptions";

function parsePrescriptionCreate(formData: FormData): PrescriptionCreateInput {
  return {
    patientId: String(formData.get("patientId") ?? ""),
    providerId: String(formData.get("providerId") ?? ""),
    medicationName: String(formData.get("medicationName") ?? ""),
    dosage: String(formData.get("dosage") ?? "").trim() || undefined,
    frequency: String(formData.get("frequency") ?? "").trim() || undefined,
    startDate: String(formData.get("startDate") ?? "").trim() || undefined,
    endDate: String(formData.get("endDate") ?? "").trim() || undefined
  };
}

function parsePrescriptionUpdate(formData: FormData): PrescriptionUpdateInput {
  return {
    id: String(formData.get("id") ?? ""),
    patientId: String(formData.get("patientId") ?? ""),
    providerId: String(formData.get("providerId") ?? ""),
    medicationName: String(formData.get("medicationName") ?? ""),
    dosage: String(formData.get("dosage") ?? "").trim() || undefined,
    frequency: String(formData.get("frequency") ?? "").trim() || undefined,
    startDate: String(formData.get("startDate") ?? "").trim() || undefined,
    endDate: String(formData.get("endDate") ?? "").trim() || undefined
  };
}

type SupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

async function getOrCreateMedicationId(supabase: SupabaseClient, name: string) {
  const { data: existing, error: existingError } = await supabase
    .from("medications")
    .select("id")
    .eq("name", name)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing?.id) return existing.id as string;

  const { data: created, error: createError } = await supabase
    .from("medications")
    .insert({ name })
    .select("id")
    .single();

  if (createError) {
    throw createError;
  }

  return created.id as string;
}

async function isProviderAssignedToPatient(
  supabase: SupabaseClient,
  patientId: string,
  providerId: string
) {
  const { data } = await supabase
    .from("appointments")
    .select("id")
    .eq("patient_id", patientId)
    .eq("provider_id", providerId)
    .maybeSingle();

  return Boolean(data?.id);
}

export async function createPrescriptionAction(formData: FormData) {
  const parsed = prescriptionCreateSchema.safeParse(parsePrescriptionCreate(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid prescription." };
  }

  const context = await getUserContext();
  if ("error" in context) return { error: context.error };

  if (!context.organizationId) {
    return { error: "Missing organization." };
  }

  if (context.role !== "admin" && context.role !== "provider") {
    return { error: "Only providers and admins can create prescriptions." };
  }

  const providerId =
    context.role === "provider" ? context.providerId : parsed.data.providerId;

  if (!providerId) {
    return { error: "Missing provider." };
  }

  if (context.role === "provider") {
    const assigned = await isProviderAssignedToPatient(
      context.supabase,
      parsed.data.patientId,
      providerId
    );
    if (!assigned) {
      return { error: "Providers can only prescribe for assigned patients." };
    }
  }

  try {
    const medicationId = await getOrCreateMedicationId(
      context.supabase,
      parsed.data.medicationName
    );

    const { error } = await context.supabase.from("prescriptions").insert({
      organization_id: context.organizationId,
      patient_id: parsed.data.patientId,
      provider_id: providerId,
      medication_id: medicationId,
      dosage: parsed.data.dosage ?? null,
      frequency: parsed.data.frequency ?? null,
      start_date: parsed.data.startDate || null,
      end_date: parsed.data.endDate || null
    });

    if (error) {
      return { error: error.message };
    }

    const adminClient = createSupabaseAdminClient();
    const { data: patientRow } = await adminClient
      .from("patients")
      .select("user_id")
      .eq("id", parsed.data.patientId)
      .maybeSingle();

    if (patientRow?.user_id) {
      await adminClient.from("notifications").insert({
        organization_id: context.organizationId,
        user_id: patientRow.user_id,
        title: "New prescription",
        body: parsed.data.medicationName,
        type: "prescription",
        is_read: false
      });
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to save medication." };
  }

  return { success: "Prescription created." };
}

export async function updatePrescriptionAction(formData: FormData) {
  const parsed = prescriptionUpdateSchema.safeParse(parsePrescriptionUpdate(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid prescription." };
  }

  const context = await getUserContext();
  if ("error" in context) return { error: context.error };

  if (context.role !== "admin" && context.role !== "provider") {
    return { error: "Only providers and admins can update prescriptions." };
  }

  const providerId =
    context.role === "provider" ? context.providerId : parsed.data.providerId;

  if (!providerId) {
    return { error: "Missing provider." };
  }

  if (context.role === "provider") {
    const assigned = await isProviderAssignedToPatient(
      context.supabase,
      parsed.data.patientId,
      providerId
    );
    if (!assigned) {
      return { error: "Providers can only prescribe for assigned patients." };
    }
  }

  try {
    const medicationId = await getOrCreateMedicationId(
      context.supabase,
      parsed.data.medicationName
    );

    const { error } = await context.supabase
      .from("prescriptions")
      .update({
        patient_id: parsed.data.patientId,
        provider_id: providerId,
        medication_id: medicationId,
        dosage: parsed.data.dosage ?? null,
        frequency: parsed.data.frequency ?? null,
        start_date: parsed.data.startDate || null,
        end_date: parsed.data.endDate || null
      })
      .eq("id", parsed.data.id);

    if (error) {
      return { error: error.message };
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to update prescription." };
  }

  return { success: "Prescription updated." };
}

export async function deletePrescriptionAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing prescription id." };

  const context = await getUserContext();
  if ("error" in context) return { error: context.error };

  if (context.role !== "admin" && context.role !== "provider") {
    return { error: "Only providers and admins can delete prescriptions." };
  }

  const { error } = await context.supabase.from("prescriptions").delete().eq("id", id);
  if (error) {
    return { error: error.message };
  }

  return { success: "Prescription removed." };
}

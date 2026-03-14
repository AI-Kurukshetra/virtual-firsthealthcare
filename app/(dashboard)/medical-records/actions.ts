"use server";

import { getUserContext } from "@/lib/auth/user-context";
import {
  medicalRecordCreateSchema,
  medicalRecordUpdateSchema,
  type MedicalRecordCreateInput,
  type MedicalRecordUpdateInput
} from "@/lib/validations/medical-records";

function parseMedicalRecordCreate(formData: FormData): MedicalRecordCreateInput {
  return {
    patientId: String(formData.get("patientId") ?? "")
  };
}

function parseMedicalRecordUpdate(formData: FormData): MedicalRecordUpdateInput {
  return {
    id: String(formData.get("id") ?? ""),
    patientId: String(formData.get("patientId") ?? "")
  };
}

export async function createMedicalRecordAction(formData: FormData) {
  const parsed = medicalRecordCreateSchema.safeParse(parseMedicalRecordCreate(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid record." };
  }

  const context = await getUserContext();
  if ("error" in context) return { error: context.error };

  if (!context.organizationId) {
    return { error: "Missing organization." };
  }

  if (context.role !== "admin" && context.role !== "provider") {
    return { error: "Only providers and admins can create records." };
  }

  const { error } = await context.supabase.from("medical_records").insert({
    organization_id: context.organizationId,
    patient_id: parsed.data.patientId
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Medical record created." };
}

export async function updateMedicalRecordAction(formData: FormData) {
  const parsed = medicalRecordUpdateSchema.safeParse(parseMedicalRecordUpdate(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid record." };
  }

  const context = await getUserContext();
  if ("error" in context) return { error: context.error };

  if (context.role !== "admin" && context.role !== "provider") {
    return { error: "Only providers and admins can update records." };
  }

  const { error } = await context.supabase
    .from("medical_records")
    .update({
      patient_id: parsed.data.patientId
    })
    .eq("id", parsed.data.id);

  if (error) {
    return { error: error.message };
  }

  return { success: "Medical record updated." };
}

export async function deleteMedicalRecordAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing record id." };

  const context = await getUserContext();
  if ("error" in context) return { error: context.error };

  if (context.role !== "admin" && context.role !== "provider") {
    return { error: "Only providers and admins can delete records." };
  }

  const { error } = await context.supabase.from("medical_records").delete().eq("id", id);
  if (error) {
    return { error: error.message };
  }

  return { success: "Medical record deleted." };
}

"use server";

import { getUserContext } from "@/lib/auth/user-context";
import {
  appointmentCreateSchema,
  appointmentUpdateSchema,
  type AppointmentCreateInput,
  type AppointmentUpdateInput
} from "@/lib/validations/appointments";

function parseAppointmentCreate(formData: FormData): AppointmentCreateInput {
  const statusValue = String(formData.get("status") ?? "").trim();
  return {
    patientId: String(formData.get("patientId") ?? ""),
    providerId: String(formData.get("providerId") ?? ""),
    scheduledAt: String(formData.get("scheduledAt") ?? ""),
    status: statusValue ? (statusValue as AppointmentCreateInput["status"]) : undefined,
    reason: String(formData.get("reason") ?? "").trim() || undefined
  };
}

function parseAppointmentUpdate(formData: FormData): AppointmentUpdateInput {
  const statusValue = String(formData.get("status") ?? "").trim();
  return {
    id: String(formData.get("id") ?? ""),
    patientId: String(formData.get("patientId") ?? ""),
    providerId: String(formData.get("providerId") ?? ""),
    scheduledAt: String(formData.get("scheduledAt") ?? ""),
    status: statusValue ? (statusValue as AppointmentUpdateInput["status"]) : undefined,
    reason: String(formData.get("reason") ?? "").trim() || undefined
  };
}

export async function createAppointmentAction(formData: FormData) {
  const parsed = appointmentCreateSchema.safeParse(parseAppointmentCreate(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid appointment." };
  }

  const context = await getUserContext();
  if ("error" in context) return { error: context.error };

  if (!context.organizationId) {
    return { error: "Missing organization." };
  }

  const patientId =
    context.role === "patient" ? context.patientId : parsed.data.patientId;
  const providerId =
    context.role === "provider" ? context.providerId : parsed.data.providerId;

  if (!patientId || !providerId) {
    return { error: "Missing patient or provider." };
  }

  if (context.role === "provider") {
    const { data: existingAssignment } = await context.supabase
      .from("appointments")
      .select("id")
      .eq("patient_id", patientId)
      .eq("provider_id", providerId)
      .maybeSingle();

    if (!existingAssignment?.id) {
      return { error: "Providers can only schedule follow-ups for assigned patients." };
    }
  }

  const [{ data: patientRow }, { data: providerRow }] = await Promise.all([
    context.supabase
      .from("patients")
      .select("id")
      .eq("id", patientId)
      .eq("organization_id", context.organizationId)
      .maybeSingle(),
    context.supabase
      .from("providers")
      .select("id")
      .eq("id", providerId)
      .eq("organization_id", context.organizationId)
      .maybeSingle()
  ]);

  if (!patientRow?.id || !providerRow?.id) {
    return { error: "Patient or provider not found in organization." };
  }

  const { error } = await context.supabase.from("appointments").insert({
    organization_id: context.organizationId,
    patient_id: patientId,
    provider_id: providerId,
    scheduled_at: parsed.data.scheduledAt,
    status: parsed.data.status ?? "scheduled",
    reason: parsed.data.reason ?? null
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Appointment created." };
}

export async function updateAppointmentAction(formData: FormData) {
  const parsed = appointmentUpdateSchema.safeParse(parseAppointmentUpdate(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid appointment." };
  }

  const context = await getUserContext();
  if ("error" in context) return { error: context.error };

  const patientId =
    context.role === "patient" ? context.patientId : parsed.data.patientId;
  const providerId =
    context.role === "provider" ? context.providerId : parsed.data.providerId;

  if (!patientId || !providerId) {
    return { error: "Missing patient or provider." };
  }

  if (context.role === "provider") {
    const { data: existingAppointment } = await context.supabase
      .from("appointments")
      .select("id, patient_id, provider_id")
      .eq("id", parsed.data.id)
      .maybeSingle();

    if (!existingAppointment?.id) {
      return { error: "Appointment not found." };
    }

    if (existingAppointment.provider_id && existingAppointment.provider_id !== providerId) {
      return { error: "Providers cannot change the assigned provider." };
    }

    if (existingAppointment.patient_id && existingAppointment.patient_id !== patientId) {
      return { error: "Providers cannot change the patient for this appointment." };
    }
  }

  const [{ data: patientRow }, { data: providerRow }] = await Promise.all([
    context.supabase
      .from("patients")
      .select("id")
      .eq("id", patientId)
      .eq("organization_id", context.organizationId ?? "")
      .maybeSingle(),
    context.supabase
      .from("providers")
      .select("id")
      .eq("id", providerId)
      .eq("organization_id", context.organizationId ?? "")
      .maybeSingle()
  ]);

  if (!patientRow?.id || !providerRow?.id) {
    return { error: "Patient or provider not found in organization." };
  }

  const { error } = await context.supabase
    .from("appointments")
    .update({
      patient_id: patientId,
      provider_id: providerId,
      scheduled_at: parsed.data.scheduledAt,
      status: parsed.data.status ?? "scheduled",
      reason: parsed.data.reason ?? null
    })
    .eq("id", parsed.data.id);

  if (error) {
    return { error: error.message };
  }

  return { success: "Appointment updated." };
}

export async function deleteAppointmentAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing appointment id." };

  const context = await getUserContext();
  if ("error" in context) return { error: context.error };

  const { error } = await context.supabase.from("appointments").delete().eq("id", id);
  if (error) {
    return { error: error.message };
  }

  return { success: "Appointment cancelled." };
}

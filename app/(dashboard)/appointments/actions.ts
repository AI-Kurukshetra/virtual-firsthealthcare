"use server";

import { randomUUID } from "crypto";
import { getUserContext } from "@/lib/auth/user-context";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  appointmentCreateSchema,
  appointmentUpdateSchema,
  type AppointmentCreateInput,
  type AppointmentUpdateInput
} from "@/lib/validations/appointments";

function parseAppointmentCreate(formData: FormData): AppointmentCreateInput {
  const statusValue = String(formData.get("status") ?? "").trim();
  const typeValue = String(formData.get("appointmentType") ?? "").trim();
  return {
    patientId: String(formData.get("patientId") ?? ""),
    providerId: String(formData.get("providerId") ?? ""),
    scheduledAt: String(formData.get("scheduledAt") ?? ""),
    status: statusValue ? (statusValue as AppointmentCreateInput["status"]) : undefined,
    appointmentType: typeValue ? (typeValue as AppointmentCreateInput["appointmentType"]) : undefined,
    reason: String(formData.get("reason") ?? "").trim() || undefined
  };
}

function parseAppointmentUpdate(formData: FormData): AppointmentUpdateInput {
  const statusValue = String(formData.get("status") ?? "").trim();
  const typeValue = String(formData.get("appointmentType") ?? "").trim();
  return {
    id: String(formData.get("id") ?? ""),
    patientId: String(formData.get("patientId") ?? ""),
    providerId: String(formData.get("providerId") ?? ""),
    scheduledAt: String(formData.get("scheduledAt") ?? ""),
    status: statusValue ? (statusValue as AppointmentUpdateInput["status"]) : undefined,
    appointmentType: typeValue ? (typeValue as AppointmentUpdateInput["appointmentType"]) : undefined,
    reason: String(formData.get("reason") ?? "").trim() || undefined
  };
}

async function notifyUsers({
  organizationId,
  userIds,
  title,
  body,
  type
}: {
  organizationId: string;
  userIds: string[];
  title: string;
  body?: string | null;
  type?: string | null;
}) {
  if (userIds.length === 0) return;
  const adminClient = createSupabaseAdminClient();
  await adminClient.from("notifications").insert(
    userIds.map((userId) => ({
      organization_id: organizationId,
      user_id: userId,
      title,
      body: body ?? null,
      type: type ?? "info",
      is_read: false
    }))
  );
}

type PatientRow = { id: string; user_id: string | null };
type ProviderRow = { id: string; user_id: string | null };

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
      .select("id, user_id")
      .eq("id", patientId)
      .eq("organization_id", context.organizationId)
      .maybeSingle<PatientRow>(),
    context.supabase
      .from("providers")
      .select("id, user_id")
      .eq("id", providerId)
      .eq("organization_id", context.organizationId)
      .maybeSingle<ProviderRow>()
  ]);

  if (!patientRow?.id || !providerRow?.id) {
    return { error: "Patient or provider not found in organization." };
  }

  const { error, data: created } = await context.supabase
    .from("appointments")
    .insert({
      organization_id: context.organizationId,
      patient_id: patientId,
      provider_id: providerId,
      scheduled_at: parsed.data.scheduledAt,
      status: parsed.data.status ?? "scheduled",
      appointment_type: parsed.data.appointmentType ?? "video",
      reason: parsed.data.reason ?? null
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  if (created?.id && (parsed.data.appointmentType ?? "video") === "video") {
    const adminClient = createSupabaseAdminClient();
    await adminClient.from("appointment_rooms").insert({
      organization_id: context.organizationId,
      appointment_id: created.id,
      room_token: randomUUID(),
      status: "ready"
    });
  }

  const notifyIds = [patientRow?.user_id, providerRow?.user_id].filter(Boolean) as string[];
  await notifyUsers({
    organizationId: context.organizationId,
    userIds: notifyIds,
    title: "New appointment scheduled",
    body: parsed.data.reason ?? "A new appointment has been scheduled.",
    type: "info"
  });

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
      .select("id, user_id")
      .eq("id", patientId)
      .eq("organization_id", context.organizationId ?? "")
      .maybeSingle<PatientRow>(),
    context.supabase
      .from("providers")
      .select("id, user_id")
      .eq("id", providerId)
      .eq("organization_id", context.organizationId ?? "")
      .maybeSingle<ProviderRow>()
  ]);

  if (!patientRow?.id || !providerRow?.id) {
    return { error: "Patient or provider not found in organization." };
  }

  const { data: existingAppointment } = await context.supabase
    .from("appointments")
    .select("status, appointment_type")
    .eq("id", parsed.data.id)
    .maybeSingle();

  const { error } = await context.supabase
    .from("appointments")
    .update({
      patient_id: patientId,
      provider_id: providerId,
      scheduled_at: parsed.data.scheduledAt,
      status: parsed.data.status ?? "scheduled",
      appointment_type: parsed.data.appointmentType ?? existingAppointment?.appointment_type ?? "video",
      reason: parsed.data.reason ?? null
    })
    .eq("id", parsed.data.id);

  if (error) {
    return { error: error.message };
  }

  const notifyIds = [patientRow?.user_id, providerRow?.user_id].filter(Boolean) as string[];
  if (notifyIds.length > 0 && parsed.data.status && parsed.data.status !== existingAppointment?.status) {
    await notifyUsers({
      organizationId: context.organizationId ?? "",
      userIds: notifyIds,
      title: "Appointment updated",
      body: `Status updated to ${parsed.data.status.replace(/_/g, " ")}.`,
      type: "info"
    });
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

"use server";

import { randomUUID } from "crypto";
import { getUserContext } from "@/lib/auth/user-context";
import {
  telehealthCreateSchema,
  telehealthUpdateSchema,
  type TelehealthCreateInput,
  type TelehealthUpdateInput
} from "@/lib/validations/telehealth";

function parseTelehealthCreate(formData: FormData): TelehealthCreateInput {
  return {
    appointmentId: String(formData.get("appointmentId") ?? "")
  };
}

function parseTelehealthUpdate(formData: FormData): TelehealthUpdateInput {
  return {
    id: String(formData.get("id") ?? "")
  };
}

export async function createTelehealthSessionAction(formData: FormData) {
  const parsed = telehealthCreateSchema.safeParse(parseTelehealthCreate(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid session." };
  }

  const context = await getUserContext();
  if ("error" in context) return { error: context.error };

  if (!context.organizationId) {
    return { error: "Missing organization." };
  }

  if (context.role !== "admin" && context.role !== "provider") {
    return { error: "Only admins and providers can start sessions." };
  }

  const { data: appointment } = await context.supabase
    .from("appointments")
    .select("id, provider_id, patient_id, organization_id")
    .eq("id", parsed.data.appointmentId)
    .maybeSingle();

  if (!appointment?.id) {
    return { error: "Appointment not found." };
  }

  if (appointment.organization_id && appointment.organization_id !== context.organizationId) {
    return { error: "Appointment not in your organization." };
  }

  if (context.role === "provider" && context.providerId && appointment.provider_id !== context.providerId) {
    return { error: "You are not assigned to this appointment." };
  }

  const { data: existing } = await context.supabase
    .from("appointment_rooms")
    .select("id")
    .eq("appointment_id", parsed.data.appointmentId)
    .maybeSingle();

  if (existing?.id) {
    return { success: "Session already exists." };
  }

  const { error } = await context.supabase.from("appointment_rooms").insert({
    organization_id: context.organizationId,
    appointment_id: parsed.data.appointmentId,
    room_token: randomUUID(),
    status: "ready"
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Telehealth session created." };
}

export async function startTelehealthSessionAction(formData: FormData) {
  const parsed = telehealthUpdateSchema.safeParse(parseTelehealthUpdate(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid session." };
  }

  const context = await getUserContext();
  if ("error" in context) return { error: context.error };

  if (context.role !== "admin" && context.role !== "provider") {
    return { error: "Only admins and providers can start sessions." };
  }

  const { data: session } = await context.supabase
    .from("appointment_rooms")
    .select("id, appointment_id")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (!session?.id) {
    return { error: "Session not found." };
  }

  const { error } = await context.supabase
    .from("appointment_rooms")
    .update({ status: "live", started_at: new Date().toISOString() })
    .eq("id", parsed.data.id);

  if (error) {
    return { error: error.message };
  }

  if (session.appointment_id) {
    await context.supabase
      .from("appointments")
      .update({ status: "in_progress" })
      .eq("id", session.appointment_id);
  }

  return { success: "Session started." };
}

export async function endTelehealthSessionAction(formData: FormData) {
  const parsed = telehealthUpdateSchema.safeParse(parseTelehealthUpdate(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid session." };
  }

  const context = await getUserContext();
  if ("error" in context) return { error: context.error };

  if (context.role !== "admin" && context.role !== "provider") {
    return { error: "Only admins and providers can end sessions." };
  }

  const { data: session } = await context.supabase
    .from("appointment_rooms")
    .select("id, appointment_id")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (!session?.id) {
    return { error: "Session not found." };
  }

  const { error } = await context.supabase
    .from("appointment_rooms")
    .update({ status: "ended", ended_at: new Date().toISOString() })
    .eq("id", parsed.data.id);

  if (error) {
    return { error: error.message };
  }

  if (session.appointment_id) {
    await context.supabase
      .from("appointments")
      .update({ status: "completed" })
      .eq("id", session.appointment_id);
  }

  return { success: "Session ended." };
}

export async function deleteTelehealthSessionAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing session id." };

  const context = await getUserContext();
  if ("error" in context) return { error: context.error };

  if (context.role !== "admin") {
    return { error: "Only admins can delete sessions." };
  }

  const { error } = await context.supabase.from("appointment_rooms").delete().eq("id", id);
  if (error) {
    return { error: error.message };
  }

  return { success: "Session removed." };
}

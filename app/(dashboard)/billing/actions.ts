"use server";

import { getUserContext } from "@/lib/auth/user-context";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  invoiceCreateSchema,
  invoiceUpdateSchema,
  type InvoiceCreateInput,
  type InvoiceUpdateInput
} from "@/lib/validations/invoices";

function parseInvoiceCreate(formData: FormData): InvoiceCreateInput {
  return {
    patientId: String(formData.get("patientId") ?? ""),
    providerId: String(formData.get("providerId") ?? "").trim() || undefined,
    appointmentId: String(formData.get("appointmentId") ?? "").trim() || undefined,
    total: Number(formData.get("total") ?? 0),
    status: String(formData.get("status") ?? "").trim() as InvoiceCreateInput["status"],
    dueDate: String(formData.get("dueDate") ?? "").trim() || undefined,
    currency: String(formData.get("currency") ?? "").trim() || undefined,
    paymentMethod: String(formData.get("paymentMethod") ?? "").trim() || undefined
  };
}

function parseInvoiceUpdate(formData: FormData): InvoiceUpdateInput {
  return {
    id: String(formData.get("id") ?? ""),
    patientId: String(formData.get("patientId") ?? ""),
    providerId: String(formData.get("providerId") ?? "").trim() || undefined,
    appointmentId: String(formData.get("appointmentId") ?? "").trim() || undefined,
    total: Number(formData.get("total") ?? 0),
    status: String(formData.get("status") ?? "").trim() as InvoiceUpdateInput["status"],
    dueDate: String(formData.get("dueDate") ?? "").trim() || undefined,
    currency: String(formData.get("currency") ?? "").trim() || undefined,
    paymentMethod: String(formData.get("paymentMethod") ?? "").trim() || undefined
  };
}

async function notifyInvoice(
  organizationId: string,
  patientId: string,
  title: string,
  body?: string | null
) {
  const adminClient = createSupabaseAdminClient();
  const { data: patientRow } = await adminClient
    .from("patients")
    .select("user_id")
    .eq("id", patientId)
    .maybeSingle();

  if (!patientRow?.user_id) return;

  await adminClient.from("notifications").insert({
    organization_id: organizationId,
    user_id: patientRow.user_id,
    title,
    body: body ?? null,
    type: "billing",
    is_read: false
  });
}

export async function createInvoiceAction(formData: FormData) {
  const parsed = invoiceCreateSchema.safeParse(parseInvoiceCreate(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid invoice." };
  }

  const context = await getUserContext();
  if ("error" in context) return { error: context.error };

  if (!context.organizationId) {
    return { error: "Missing organization." };
  }

  if (context.role !== "admin" && context.role !== "provider") {
    return { error: "Only admins and providers can create invoices." };
  }

  const providerId =
    context.role === "provider" ? context.providerId : parsed.data.providerId;

  if (context.role === "provider" && !providerId) {
    return { error: "Missing provider profile." };
  }

  if (context.role === "provider" && providerId) {
    const { data: assignment } = await context.supabase
      .from("appointments")
      .select("id")
      .eq("patient_id", parsed.data.patientId)
      .eq("provider_id", providerId)
      .maybeSingle();

    if (!assignment?.id) {
      return { error: "You are not assigned to this patient." };
    }
  }

  const { data: patientRow } = await context.supabase
    .from("patients")
    .select("id")
    .eq("id", parsed.data.patientId)
    .eq("organization_id", context.organizationId)
    .maybeSingle();

  if (!patientRow?.id) {
    return { error: "Patient not found." };
  }

  if (context.role === "provider" && providerId) {
    const { data: assignment } = await context.supabase
      .from("appointments")
      .select("id")
      .eq("patient_id", parsed.data.patientId)
      .eq("provider_id", providerId)
      .maybeSingle();

    if (!assignment?.id) {
      return { error: "You are not assigned to this patient." };
    }
  }

  if (parsed.data.appointmentId) {
    const { data: appointment } = await context.supabase
      .from("appointments")
      .select("id, provider_id, patient_id")
      .eq("id", parsed.data.appointmentId)
      .maybeSingle();

    if (!appointment?.id) {
      return { error: "Appointment not found." };
    }

    if (appointment.patient_id !== parsed.data.patientId) {
      return { error: "Appointment does not match patient." };
    }

    if (providerId && appointment.provider_id && appointment.provider_id !== providerId) {
      return { error: "Appointment does not match provider." };
    }
  }

  const { data: created, error } = await context.supabase
    .from("invoices")
    .insert({
      organization_id: context.organizationId,
      patient_id: parsed.data.patientId,
      provider_id: providerId ?? null,
      appointment_id: parsed.data.appointmentId ?? null,
      status: parsed.data.status ?? "draft",
      total: parsed.data.total,
      currency: parsed.data.currency ?? "USD",
      payment_method: parsed.data.paymentMethod ?? null,
      due_date: parsed.data.dueDate || null
    })
    .select("id, status, total")
    .single();

  if (error || !created?.id) {
    return { error: error?.message ?? "Failed to create invoice." };
  }

  if (created.status === "paid") {
    const adminClient = createSupabaseAdminClient();
    await adminClient.from("payments").insert({
      organization_id: context.organizationId,
      invoice_id: created.id,
      amount: created.total,
      paid_at: new Date().toISOString()
    });
  }

  await notifyInvoice(
    context.organizationId,
    parsed.data.patientId,
    "New invoice",
    `Invoice ${created.id.slice(0, 8)} issued.`
  );

  return { success: "Invoice created." };
}

export async function updateInvoiceAction(formData: FormData) {
  const parsed = invoiceUpdateSchema.safeParse(parseInvoiceUpdate(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid invoice." };
  }

  const context = await getUserContext();
  if ("error" in context) return { error: context.error };

  if (context.role !== "admin" && context.role !== "provider") {
    return { error: "Only admins and providers can update invoices." };
  }

  const providerId =
    context.role === "provider" ? context.providerId : parsed.data.providerId;

  if (context.role === "provider" && !providerId) {
    return { error: "Missing provider profile." };
  }

  const { data: existing } = await context.supabase
    .from("invoices")
    .select("id, status")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (!existing?.id) {
    return { error: "Invoice not found." };
  }

  const { error } = await context.supabase
    .from("invoices")
    .update({
      patient_id: parsed.data.patientId,
      provider_id: providerId ?? null,
      appointment_id: parsed.data.appointmentId ?? null,
      status: parsed.data.status ?? "draft",
      total: parsed.data.total,
      currency: parsed.data.currency ?? "USD",
      payment_method: parsed.data.paymentMethod ?? null,
      due_date: parsed.data.dueDate || null
    })
    .eq("id", parsed.data.id);

  if (error) {
    return { error: error.message };
  }

  if (parsed.data.status && parsed.data.status !== existing.status) {
    if (parsed.data.status === "paid") {
      const adminClient = createSupabaseAdminClient();
      await adminClient.from("payments").insert({
        organization_id: context.organizationId,
        invoice_id: parsed.data.id,
        amount: parsed.data.total,
        paid_at: new Date().toISOString()
      });
    }
    await notifyInvoice(
      context.organizationId ?? "",
      parsed.data.patientId,
      "Invoice updated",
      `Status updated to ${parsed.data.status}.`
    );
  }

  return { success: "Invoice updated." };
}

export async function deleteInvoiceAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing invoice id." };

  const context = await getUserContext();
  if ("error" in context) return { error: context.error };

  if (context.role !== "admin" && context.role !== "provider") {
    return { error: "Only admins and providers can delete invoices." };
  }

  const { error } = await context.supabase.from("invoices").delete().eq("id", id);
  if (error) {
    return { error: error.message };
  }

  return { success: "Invoice removed." };
}

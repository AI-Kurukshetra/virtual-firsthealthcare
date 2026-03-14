"use server";

import { getUserContext } from "@/lib/auth/user-context";
import {
  notificationCreateSchema,
  notificationUpdateSchema,
  type NotificationCreateInput,
  type NotificationUpdateInput
} from "@/lib/validations/notifications";

function parseNotificationCreate(formData: FormData): NotificationCreateInput {
  return {
    userId: String(formData.get("userId") ?? ""),
    title: String(formData.get("title") ?? ""),
    body: String(formData.get("body") ?? "")
  };
}

function parseNotificationUpdate(formData: FormData): NotificationUpdateInput {
  return {
    id: String(formData.get("id") ?? ""),
    title: String(formData.get("title") ?? ""),
    body: String(formData.get("body") ?? ""),
    read: Boolean(formData.get("read")) || undefined
  };
}

export async function createNotificationAction(formData: FormData) {
  const parsed = notificationCreateSchema.safeParse(parseNotificationCreate(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid notification." };
  }

  const context = await getUserContext();
  if ("error" in context) return { error: context.error };

  if (!context.organizationId) {
    return { error: "Missing organization." };
  }

  if (context.role !== "admin" && parsed.data.userId !== context.userId) {
    return { error: "You can only notify yourself." };
  }

  const { error } = await context.supabase.from("notifications").insert({
    organization_id: context.organizationId,
    user_id: parsed.data.userId,
    title: parsed.data.title,
    body: parsed.data.body
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Notification created." };
}

export async function updateNotificationAction(formData: FormData) {
  const parsed = notificationUpdateSchema.safeParse(parseNotificationUpdate(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid notification." };
  }

  const context = await getUserContext();
  if ("error" in context) return { error: context.error };

  const updatePayload: {
    title?: string;
    body?: string;
    read_at?: string | null;
  } = {};

  if (context.role === "admin") {
    updatePayload.title = parsed.data.title;
    updatePayload.body = parsed.data.body;
  }

  if (parsed.data.read) {
    updatePayload.read_at = new Date().toISOString();
  }

  if (Object.keys(updatePayload).length === 0) {
    return { error: "No changes to apply." };
  }

  const { error } = await context.supabase
    .from("notifications")
    .update(updatePayload)
    .eq("id", parsed.data.id);

  if (error) {
    return { error: error.message };
  }

  return { success: "Notification updated." };
}

export async function deleteNotificationAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing notification id." };

  const context = await getUserContext();
  if ("error" in context) return { error: context.error };

  const { error } = await context.supabase.from("notifications").delete().eq("id", id);
  if (error) {
    return { error: error.message };
  }

  return { success: "Notification removed." };
}

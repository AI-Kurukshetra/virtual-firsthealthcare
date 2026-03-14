"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUserContext } from "@/lib/auth/user-context";
import { extractRoleName } from "@/lib/auth/roles";
import {
  conversationCreateSchema,
  messageCreateSchema,
  messageUpdateSchema,
  type ConversationCreateInput,
  type MessageCreateInput,
  type MessageUpdateInput
} from "@/lib/validations/messages";

function parseConversationCreate(formData: FormData): ConversationCreateInput {
  return {
    participantId: String(formData.get("participantId") ?? "")
  };
}

function parseMessageCreate(formData: FormData): MessageCreateInput {
  return {
    conversationId: String(formData.get("conversationId") ?? ""),
    body: String(formData.get("body") ?? "")
  };
}

function parseMessageUpdate(formData: FormData): MessageUpdateInput {
  return {
    id: String(formData.get("id") ?? ""),
    body: String(formData.get("body") ?? "")
  };
}

async function getUserRoleName(userId: string) {
  const adminClient = createSupabaseAdminClient();
  const { data } = await adminClient
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", userId)
    .maybeSingle();

  return extractRoleName(data?.roles);
}

export async function createConversationAction(formData: FormData) {
  const parsed = conversationCreateSchema.safeParse(parseConversationCreate(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid participant." };
  }

  const context = await getUserContext();
  if ("error" in context) return { error: context.error };

  if (!context.organizationId) {
    return { error: "Missing organization." };
  }

  const adminClient = createSupabaseAdminClient();
  const { data: participantProfile } = await adminClient
    .from("users")
    .select("id, organization_id")
    .eq("id", parsed.data.participantId)
    .maybeSingle();

  if (!participantProfile?.id || participantProfile.organization_id !== context.organizationId) {
    return { error: "Participant is not in your organization." };
  }

  const participantRole = await getUserRoleName(parsed.data.participantId);

  if (context.role === "provider") {
    if (participantRole !== "patient") {
      return { error: "Providers can only message assigned patients." };
    }
    if (!context.providerId) {
      return { error: "Provider profile not found." };
    }

    const { data: patientRow } = await context.supabase
      .from("patients")
      .select("id")
      .eq("user_id", parsed.data.participantId)
      .maybeSingle();

    if (!patientRow?.id) {
      return { error: "Patient not found." };
    }

    const { data: appointment } = await context.supabase
      .from("appointments")
      .select("id")
      .eq("patient_id", patientRow.id)
      .eq("provider_id", context.providerId)
      .maybeSingle();

    if (!appointment?.id) {
      return { error: "You are not assigned to this patient." };
    }
  }

  if (context.role === "patient") {
    if (participantRole !== "provider") {
      return { error: "Patients can only message their provider." };
    }
    if (!context.patientId) {
      return { error: "Patient profile not found." };
    }

    const { data: providerRow } = await context.supabase
      .from("providers")
      .select("id")
      .eq("user_id", parsed.data.participantId)
      .maybeSingle();

    if (!providerRow?.id) {
      return { error: "Provider not found." };
    }

    const { data: appointment } = await context.supabase
      .from("appointments")
      .select("id")
      .eq("patient_id", context.patientId)
      .eq("provider_id", providerRow.id)
      .maybeSingle();

    if (!appointment?.id) {
      return { error: "You are not assigned to this provider." };
    }
  }

  const { data: created, error: createError } = await context.supabase
    .from("conversations")
    .insert({ organization_id: context.organizationId })
    .select("id")
    .single();

  if (createError || !created?.id) {
    return { error: createError?.message ?? "Failed to create conversation." };
  }

  const { error: memberError } = await context.supabase
    .from("conversation_members")
    .insert({ conversation_id: created.id, user_id: context.userId, role: context.role });

  if (memberError) {
    return { error: memberError.message };
  }

  const { error: participantError } = await adminClient
    .from("conversation_members")
    .insert({
      conversation_id: created.id,
      user_id: parsed.data.participantId,
      role: participantRole ?? "member"
    });

  if (participantError) {
    return { error: participantError.message };
  }

  return { success: "Conversation started." };
}

export async function sendMessageAction(formData: FormData) {
  const parsed = messageCreateSchema.safeParse(parseMessageCreate(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid message." };
  }

  const context = await getUserContext();
  if ("error" in context) return { error: context.error };

  if (!context.organizationId) {
    return { error: "Missing organization." };
  }

  const { error } = await context.supabase.from("messages").insert({
    organization_id: context.organizationId,
    conversation_id: parsed.data.conversationId,
    sender_id: context.userId,
    body: parsed.data.body
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Message sent." };
}

export async function updateMessageAction(formData: FormData) {
  const parsed = messageUpdateSchema.safeParse(parseMessageUpdate(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid message." };
  }

  const context = await getUserContext();
  if ("error" in context) return { error: context.error };

  const { error } = await context.supabase
    .from("messages")
    .update({ body: parsed.data.body })
    .eq("id", parsed.data.id);

  if (error) {
    return { error: error.message };
  }

  return { success: "Message updated." };
}

export async function deleteMessageAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing message id." };

  const context = await getUserContext();
  if ("error" in context) return { error: context.error };

  const { error } = await context.supabase.from("messages").delete().eq("id", id);
  if (error) {
    return { error: error.message };
  }

  return { success: "Message deleted." };
}

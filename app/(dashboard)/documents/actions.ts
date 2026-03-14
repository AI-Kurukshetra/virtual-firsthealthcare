"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getUserContext } from "@/lib/auth/user-context";
import {
  documentCreateSchema,
  documentUpdateSchema,
  type DocumentCreateInput,
  type DocumentUpdateInput
} from "@/lib/validations/documents";

const DEFAULT_BUCKET = "documents";

function parseDocumentCreate(formData: FormData): DocumentCreateInput {
  return {
    title: String(formData.get("title") ?? ""),
    patientId: String(formData.get("patientId") ?? ""),
    bucket: (String(formData.get("bucket") ?? "").trim() || undefined) as DocumentCreateInput["bucket"]
  };
}

function parseDocumentUpdate(formData: FormData): DocumentUpdateInput {
  return {
    id: String(formData.get("id") ?? ""),
    title: String(formData.get("title") ?? ""),
    patientId: String(formData.get("patientId") ?? ""),
    bucket: (String(formData.get("bucket") ?? "").trim() || undefined) as DocumentUpdateInput["bucket"]
  };
}

export async function createDocumentAction(formData: FormData) {
  const parsed = documentCreateSchema.safeParse(parseDocumentCreate(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid document." };
  }

  const file = formData.get("file");
  const fileValue = file instanceof File ? file : null;
  const bucket = parsed.data.bucket ?? DEFAULT_BUCKET;

  const context = await getUserContext();
  if ("error" in context) return { error: context.error };

  if (!context.organizationId) {
    return { error: "Missing organization." };
  }

  const patientId =
    context.role === "patient" ? context.patientId : parsed.data.patientId;

  if (!patientId) {
    return { error: "Missing patient." };
  }

  const { data: created, error: createError } = await context.supabase
    .from("documents")
    .insert({
      organization_id: context.organizationId,
      patient_id: patientId,
      title: parsed.data.title
    })
    .select("id")
    .single();

  if (createError || !created?.id) {
    return { error: createError?.message ?? "Failed to create document." };
  }

  if (fileValue) {
    const maxSizeBytes = 10 * 1024 * 1024;
    if (fileValue.size > maxSizeBytes) {
      return { error: "File must be 10MB or less." };
    }

    const adminClient = createSupabaseAdminClient();
    const arrayBuffer = await fileValue.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const path = `${context.organizationId}/${created.id}/${fileValue.name}`;

    const { error: uploadError } = await adminClient.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: fileValue.type || "application/octet-stream",
        upsert: true
      });

    if (uploadError) {
      return { error: uploadError.message };
    }

    const { error: fileError } = await context.supabase.from("files").insert({
      organization_id: context.organizationId,
      document_id: created.id,
      bucket,
      s3_key: path,
      mime_type: fileValue.type || null
    });

    if (fileError) {
      return { error: fileError.message };
    }
  }

  return { success: "Document created." };
}

export async function updateDocumentAction(formData: FormData) {
  const parsed = documentUpdateSchema.safeParse(parseDocumentUpdate(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid document." };
  }

  const context = await getUserContext();
  if ("error" in context) return { error: context.error };

  const patientId =
    context.role === "patient" ? context.patientId : parsed.data.patientId;

  if (!patientId) {
    return { error: "Missing patient." };
  }

  const { error } = await context.supabase
    .from("documents")
    .update({
      title: parsed.data.title,
      patient_id: patientId
    })
    .eq("id", parsed.data.id);

  if (error) {
    return { error: error.message };
  }

  return { success: "Document updated." };
}

export async function deleteDocumentAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing document id." };

  const context = await getUserContext();
  if ("error" in context) return { error: context.error };

  const { error } = await context.supabase.from("documents").delete().eq("id", id);
  if (error) {
    return { error: error.message };
  }

  return { success: "Document removed." };
}

export async function createDocumentDownloadUrl(path: string, bucket = DEFAULT_BUCKET) {
  const adminClient = createSupabaseAdminClient();
  const { data, error } = await adminClient.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 10);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Failed to create download link.");
  }

  return data.signedUrl;
}

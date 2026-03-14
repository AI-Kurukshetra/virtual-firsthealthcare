import { createUploadUrl } from "@/lib/s3/client";

export async function POST(request: Request) {
  const body = await request.json();
  const { key, contentType } = body as { key: string; contentType: string };

  if (!key || !contentType) {
    return Response.json({ error: "Missing key or contentType" }, { status: 400 });
  }

  const url = await createUploadUrl({ key, contentType });
  return Response.json({ url });
}

import { z } from "zod";

export const documentCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  patientId: z.string().uuid(),
  bucket: z.enum(["documents", "reports"]).optional(),
  documentType: z.string().optional()
});

export const documentUpdateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  patientId: z.string().uuid(),
  bucket: z.enum(["documents", "reports"]).optional(),
  documentType: z.string().optional()
});

export type DocumentCreateInput = z.infer<typeof documentCreateSchema>;
export type DocumentUpdateInput = z.infer<typeof documentUpdateSchema>;

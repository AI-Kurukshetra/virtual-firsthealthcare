import { z } from "zod";

const invoiceStatusSchema = z.enum(["draft", "issued", "paid", "void"]);

export const invoiceCreateSchema = z.object({
  patientId: z.string().uuid(),
  providerId: z.string().uuid().optional(),
  appointmentId: z.string().uuid().optional(),
  total: z.coerce.number().positive("Total must be greater than 0"),
  status: invoiceStatusSchema.optional(),
  dueDate: z.string().optional(),
  currency: z.string().min(3).max(3).optional(),
  paymentMethod: z.string().optional()
});

export const invoiceUpdateSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid(),
  providerId: z.string().uuid().optional(),
  appointmentId: z.string().uuid().optional(),
  total: z.coerce.number().positive("Total must be greater than 0"),
  status: invoiceStatusSchema.optional(),
  dueDate: z.string().optional(),
  currency: z.string().min(3).max(3).optional(),
  paymentMethod: z.string().optional()
});

export type InvoiceCreateInput = z.infer<typeof invoiceCreateSchema>;
export type InvoiceUpdateInput = z.infer<typeof invoiceUpdateSchema>;

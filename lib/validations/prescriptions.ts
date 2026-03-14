import { z } from "zod";

export const prescriptionCreateSchema = z.object({
  patientId: z.string().uuid(),
  providerId: z.string().uuid(),
  medicationName: z.string().min(1, "Medication is required"),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

export const prescriptionUpdateSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid(),
  providerId: z.string().uuid(),
  medicationName: z.string().min(1, "Medication is required"),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

export type PrescriptionCreateInput = z.infer<typeof prescriptionCreateSchema>;
export type PrescriptionUpdateInput = z.infer<typeof prescriptionUpdateSchema>;

import { z } from "zod";

export const medicalRecordCreateSchema = z.object({
  patientId: z.string().uuid()
});

export const medicalRecordUpdateSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid()
});

export type MedicalRecordCreateInput = z.infer<typeof medicalRecordCreateSchema>;
export type MedicalRecordUpdateInput = z.infer<typeof medicalRecordUpdateSchema>;

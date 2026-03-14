import { z } from "zod";

const appointmentStatusSchema = z.enum([
  "scheduled",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "no_show"
]);

const appointmentTypeSchema = z.enum(["video", "clinic"]);

export const appointmentCreateSchema = z.object({
  patientId: z.string().uuid(),
  providerId: z.string().uuid(),
  scheduledAt: z.string().min(1, "Scheduled time is required"),
  status: appointmentStatusSchema.optional(),
  appointmentType: appointmentTypeSchema.optional(),
  reason: z.string().optional()
});

export const appointmentUpdateSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid(),
  providerId: z.string().uuid(),
  scheduledAt: z.string().min(1, "Scheduled time is required"),
  status: appointmentStatusSchema.optional(),
  appointmentType: appointmentTypeSchema.optional(),
  reason: z.string().optional()
});

export type AppointmentCreateInput = z.infer<typeof appointmentCreateSchema>;
export type AppointmentUpdateInput = z.infer<typeof appointmentUpdateSchema>;

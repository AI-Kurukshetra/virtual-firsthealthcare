import { z } from "zod";

export const telehealthCreateSchema = z.object({
  appointmentId: z.string().uuid()
});

export const telehealthUpdateSchema = z.object({
  id: z.string().uuid()
});

export type TelehealthCreateInput = z.infer<typeof telehealthCreateSchema>;
export type TelehealthUpdateInput = z.infer<typeof telehealthUpdateSchema>;

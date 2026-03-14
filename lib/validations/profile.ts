import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().optional(),
  address: z.string().optional()
});

export type ProfileInput = z.infer<typeof profileSchema>;

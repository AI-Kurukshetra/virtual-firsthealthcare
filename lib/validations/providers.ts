import { z } from "zod";

export const providerCreateSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  specialty: z.string().optional(),
  licenseNumber: z.string().optional()
});

export const providerUpdateSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().min(1, "Full name is required"),
  specialty: z.string().optional(),
  licenseNumber: z.string().optional()
});

export type ProviderCreateInput = z.infer<typeof providerCreateSchema>;
export type ProviderUpdateInput = z.infer<typeof providerUpdateSchema>;

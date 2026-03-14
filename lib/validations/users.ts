import { z } from "zod";

const roleSchema = z.enum(["admin", "provider", "patient"]);

export const userCreateSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: roleSchema,
  phone: z.string().optional()
});

export const userUpdateSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().min(2),
  role: roleSchema.optional(),
  phone: z.string().optional()
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

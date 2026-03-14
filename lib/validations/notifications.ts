import { z } from "zod";

export const notificationCreateSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Message is required")
});

export const notificationUpdateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Message is required"),
  read: z.boolean().optional()
});

export type NotificationCreateInput = z.infer<typeof notificationCreateSchema>;
export type NotificationUpdateInput = z.infer<typeof notificationUpdateSchema>;

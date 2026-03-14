import { z } from "zod";

export const conversationCreateSchema = z.object({
  participantId: z.string().uuid()
});

export const messageCreateSchema = z.object({
  conversationId: z.string().uuid(),
  body: z.string().min(1, "Message is required")
});

export const messageUpdateSchema = z.object({
  id: z.string().uuid(),
  body: z.string().min(1, "Message is required")
});

export type ConversationCreateInput = z.infer<typeof conversationCreateSchema>;
export type MessageCreateInput = z.infer<typeof messageCreateSchema>;
export type MessageUpdateInput = z.infer<typeof messageUpdateSchema>;

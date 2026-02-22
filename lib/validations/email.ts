import { z } from "zod";

export const emailSchema = z.object({
  to: z.string().email("Invalid recipient email address."),
  subject: z.string().min(3, "Subject must be at least 3 characters."),
  body: z.string().min(10, "Email body is too short."),
});

export type EmailInput = z.infer<typeof emailSchema>;
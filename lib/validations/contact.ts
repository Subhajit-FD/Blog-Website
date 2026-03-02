import { z } from "zod";
import { CONTACT_CATEGORIES } from "@/lib/constants/contact";

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  category: z.enum(CONTACT_CATEGORIES),
  message: z.string().min(10, "Message must be at least 10 characters long."),
});

export type ContactInput = z.infer<typeof contactSchema>;

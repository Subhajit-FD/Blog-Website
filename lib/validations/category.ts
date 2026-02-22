import { z } from "zod";

export const categorySchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  slug: z.string().min(2, "Slug is required."),
  description: z.string().optional(),
  coverImage: z.url("A valid ImageKit URL is required."),
});

export type CategoryInput = z.infer<typeof categorySchema>;
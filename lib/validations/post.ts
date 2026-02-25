import { z } from "zod";

export const postSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  slug: z.string().min(2, "Slug is required."),
  description: z
    .string()
    .min(10, "Please provide a short SEO description (min 10 chars)."),
  content: z.string().min(20, "Blog content cannot be empty."),
  coverImage: z.string().url("A valid cover image is required."),
  coverImageAlt: z.string().optional(),
  category: z.string().min(1, "Please select a category."), // Expects the MongoDB _id string
  teamId: z.string().optional(), // Optional Team ID
  tags: z.array(z.string()).optional(), // Array of tag strings
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]),
  displayTags: z.array(z.enum(["Editor Choice", "Trending"])).optional(),
  publishedAt: z.date().optional(),
});

export type PostInput = z.infer<typeof postSchema>;

import { z } from "zod";

export const settingsSchema = z.object({
  siteName: z.string().min(2, "Site name is required"),
  faviconUrl: z.string().optional(),
  appleTouchIconUrl: z.string().optional(),
  logoUrl: z.string().optional(),
  siteDescription: z
    .string()
    .min(10, "SEO description must be at least 10 chars"),
  seoTitle: z.string().optional(),
  seoImage: z.string().optional(),
  socialLinks: z
    .array(
      z.object({
        title: z.string().min(1, "Title is required"),
        url: z.string().url("Must be a valid URL"),
        icon: z.string().optional(),
      }),
    )
    .optional(),
  shareOptions: z
    .array(
      z.object({
        platform: z.string().min(1, "Platform name is required"),
        baseUrl: z.string().min(1, "Base URL is required"),
        icon: z.string().optional(),
      }),
    )
    .optional(),
  animations: z
    .object({
      global: z.boolean().default(true),
      loader: z.boolean().default(true),
      pageTransition: z.boolean().default(true),
      textHighlight: z.boolean().default(true),
    })
    .default({
      global: true,
      loader: true,
      pageTransition: true,
      textHighlight: true,
    }),
});

export type SettingsInput = z.infer<typeof settingsSchema>;

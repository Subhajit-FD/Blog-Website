import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  image: z.string().url("Invalid image URL.").optional().or(z.literal("")),
});

export const passwordResetSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits."),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long."),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long."),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

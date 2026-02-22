"use server";

import { connectToDatabase } from "@/lib/db";
import Settings from "@/lib/models/Settings";
import { settingsSchema, SettingsInput } from "@/lib/validations/settings";
import { auth } from "@/auth";
import { PERMISSIONS } from "@/lib/config/permissions";
import { revalidatePath } from "next/cache";

// 1. Fetch Global Settings
export async function getSettings() {
  try {
    await connectToDatabase();
    let settings = await Settings.findOne().lean();

    // If it's the very first time booting the app, create the default singleton document
    if (!settings) {
      settings = await Settings.create({});
    }

    return { success: true, data: JSON.parse(JSON.stringify(settings)) };
  } catch (_error) {
    return { error: "Failed to fetch settings." };
  }
}

// 2. Update Global Settings
export async function updateSettings(data: SettingsInput) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const userPerms = session.user.permissions;
  const isManager = (userPerms & PERMISSIONS.MANAGE_SETTINGS) !== 0;
  const isAdmin = (userPerms & PERMISSIONS.ADMINISTRATOR) !== 0;

  if (!isManager && !isAdmin) return { error: "Forbidden" };

  const validatedData = settingsSchema.safeParse(data);
  if (!validatedData.success) return { error: "Invalid data." };

  try {
    await connectToDatabase();

    // Security check: If a non-admin tries to hack the request and change SEO/Logo, we strip those fields out.
    const updatePayload = { ...validatedData.data };
    if (!isAdmin) {
      delete (updatePayload as any).siteDescription;
      delete (updatePayload as any).logoUrl;
      delete (updatePayload as any).faviconUrl;
      delete (updatePayload as any).appleTouchIconUrl;
      delete (updatePayload as any).seoTitle;
      delete (updatePayload as any).seoImage;
    }

    // The Singleton Upsert
    await Settings.findOneAndUpdate(
      {}, // Empty filter targets the first/only document
      { $set: updatePayload },
      { new: true, upsert: true },
    );

    revalidatePath("/", "layout"); // Revalidates the entire app so the new Logo shows everywhere!
    return { success: true, message: "Settings updated successfully." };
  } catch (error) {
    return { error: "Failed to update settings." };
  }
}

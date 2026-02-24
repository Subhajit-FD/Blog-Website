"use server";

import { connectToDatabase } from "@/lib/db";
import Settings from "@/lib/models/Settings";
import { settingsSchema, SettingsInput } from "@/lib/validations/settings";
import { auth } from "@/auth";
import { PERMISSIONS } from "@/lib/config/permissions";
import { revalidatePath, unstable_cache } from "next/cache";

import { cache } from "react";

// Per-request deduplication (React cache) — prevents duplicate calls in a single render
const fetchSettingsInternal = cache(async () => {
  return await cachedGetSettings();
});

// Next.js persistent cache — caches result across requests for 1 hour, tagged for purging
const cachedGetSettings = unstable_cache(
  async () => {
    try {
      await connectToDatabase();
      let settings = await Settings.findOne().lean();

      if (!settings) {
        settings = await Settings.create({});
      }

      return { success: true, data: JSON.parse(JSON.stringify(settings)) };
    } catch (_error) {
      return { error: "Failed to fetch settings." };
    }
  },
  ["settings"],
  {
    revalidate: 3600, // 1 hour
    tags: ["settings"],
  },
);

// 1. Fetch Global Settings
export async function getSettings() {
  return await fetchSettingsInternal();
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

    const updatePayload = { ...validatedData.data };
    if (!isAdmin) {
      delete (updatePayload as any).siteDescription;
      delete (updatePayload as any).logoUrl;
      delete (updatePayload as any).faviconUrl;
      delete (updatePayload as any).appleTouchIconUrl;
      delete (updatePayload as any).seoTitle;
      delete (updatePayload as any).seoImage;
    }

    await Settings.findOneAndUpdate(
      {},
      { $set: updatePayload },
      { new: true, upsert: true },
    );

    revalidatePath("/", "layout");
    return { success: true, message: "Settings updated successfully." };
  } catch (error) {
    return { error: "Failed to update settings." };
  }
}

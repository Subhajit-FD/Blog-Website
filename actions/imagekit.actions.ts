"use server";

import ImageKit from "imagekit";
import { auth } from "@/auth";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

export async function deleteImageFromImageKit(url: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  try {
    const endpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!;
    console.log(`[ImageKit Delete] Attempting to delete: ${url}`);
    console.log(`[ImageKit Delete] Configured endpoint: ${endpoint}`);

    // Check if the URL is actually an ImageKit URL
    if (!url.startsWith(endpoint)) {
      console.log(`[ImageKit Delete] URL does not match endpoint. Skipping.`);
      return { success: true };
    }

    const path = url.replace(endpoint, "");
    const name = path.split("/").pop();

    console.log(`[ImageKit Delete] Extracted path: ${path}, name: ${name}`);

    if (!name) {
      console.log(`[ImageKit Delete] No valid name found. Skipping.`);
      return { success: true };
    }

    // Search for the file in ImageKit by its name
    const files = await imagekit.listFiles({
      searchQuery: `name="${name}"`,
    });

    console.log(
      `[ImageKit Delete] Found ${files.length} matching files by name.`,
    );

    // Find the exact match
    const file: any = files.find(
      (f: any) =>
        f.url === url ||
        f.filePath === path ||
        decodeURIComponent(url).includes(f.filePath) ||
        decodeURIComponent(path).includes(f.filePath),
    );

    if (file && file.fileId) {
      console.log(
        `[ImageKit Delete] Exact match found! fileId: ${file.fileId}. Calling delete API...`,
      );
      await imagekit.deleteFile(file.fileId);
      console.log(`[ImageKit Delete] File successfully deleted from ImageKit.`);
      return { success: true };
    }

    console.log(
      `[ImageKit Delete] No exact match found in the API response. Skipping.`,
    );
    return { success: true };
  } catch (error) {
    console.error("[ImageKit Delete] Error:", error);
    return { error: "Failed to delete image from ImageKit" };
  }
}

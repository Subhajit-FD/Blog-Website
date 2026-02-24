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
    // Check if the URL is actually an ImageKit URL
    if (!url.startsWith(endpoint)) {
      return { success: true };
    }

    const path = url.replace(endpoint, "");
    const name = path.split("/").pop();

    if (!name) {
      return { success: true };
    }

    // Search for the file in ImageKit by its name
    const files = await imagekit.listFiles({
      searchQuery: `name="${name}"`,
    });

    // Find the exact match
    const file: any = files.find(
      (f: any) =>
        f.url === url ||
        f.filePath === path ||
        decodeURIComponent(url).includes(f.filePath) ||
        decodeURIComponent(path).includes(f.filePath),
    );

    if (file && file.fileId) {
      await imagekit.deleteFile(file.fileId);
      return { success: true };
    }

    return { success: true };
  } catch (error) {
    console.error("[ImageKit Delete] Error:", error);
    return { error: "Failed to delete image from ImageKit" };
  }
}

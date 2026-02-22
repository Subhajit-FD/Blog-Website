import imageCompression from "browser-image-compression";

// 1. Define strict types for our subfolders
export type ImageFolderDestination = "blog" | "category" | "user-profile" | "site";

export async function compressAndUploadImage(
  file: File,
  destination: ImageFolderDestination, // 2. Require the destination when calling the function
) {
  try {
    // 1. COMPRESSION STAGE
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    const compressedFile = await imageCompression(file, options);

    // 2. AUTHENTICATION STAGE
    const authRes = await fetch("/api/imagekit/auth");
    if (!authRes.ok) {
      const errorText = await authRes.text();
      throw new Error(`Failed to authenticate: ${authRes.status} ${errorText}`);
    }

    const { token, expire, signature } = await authRes.json();

    // 3. UPLOAD STAGE
    const formData = new FormData();
    formData.append("file", compressedFile);
    formData.append("fileName", file.name);
    formData.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!);
    formData.append("signature", signature);
    formData.append("expire", expire.toString());
    formData.append("token", token);

    // 4. DYNAMIC FOLDER ROUTING
    // This creates paths like: /blog-website-3-0/blog OR /blog-website-3-0/category
    formData.append("folder", `/blog-website-3-0/${destination}`);

    const uploadRes = await fetch(
      "https://upload.imagekit.io/api/v1/files/upload",
      {
        method: "POST",
        body: formData,
      },
    );

    if (!uploadRes.ok) {
      const errorData = await uploadRes.json();
      throw new Error(
        `ImageKit upload failed: ${errorData.message || uploadRes.statusText}`,
      );
    }

    const data = await uploadRes.json();

    return {
      success: true,
      url: data.url,
      fileId: data.fileId,
    };
  } catch (error: any) {
    console.error("Image pipeline failed:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to compress or upload image." };
  }
}

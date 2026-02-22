import ImageKit from "imagekit";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

export async function GET() {
  try {
    const session = await auth();
    // Validate session. Even if they don't have dashboard access, we might allow profile image uploads?
    // Let's at least enforce that they are logged in.
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(imagekit.getAuthenticationParameters());
  } catch (error) {
    console.error("ImageKit Auth Error:", error);
    return NextResponse.json(
      { error: "Failed to authenticate" },
      { status: 500 },
    );
  }
}

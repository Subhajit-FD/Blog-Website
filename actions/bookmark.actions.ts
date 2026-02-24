"use server";

import { connectToDatabase } from "@/lib/db";
import User from "@/lib/models/User";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

/**
 * Returns an array of bookmarked post IDs for the currently logged-in user.
 * Used by server components to pre-highlight bookmark buttons without client fetching.
 */
export async function getUserBookmarks(): Promise<string[]> {
  const session = await auth();
  if (!session?.user?.email) return [];

  try {
    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email })
      .select("bookmarks")
      .lean();
    if (!user?.bookmarks) return [];
    return user.bookmarks.map((id: any) => id.toString());
  } catch {
    return [];
  }
}

export async function toggleBookmark(postId: string, currentPath: string) {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: "You must be logged in to bookmark posts." };
  }

  try {
    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });

    if (!user) return { error: "User not found." };

    // Check if the post is already bookmarked
    const isBookmarked = user.bookmarks.includes(postId);

    if (isBookmarked) {
      // Remove it
      await User.findByIdAndUpdate(user._id, { $pull: { bookmarks: postId } });
    } else {
      // Add it
      await User.findByIdAndUpdate(user._id, {
        $addToSet: { bookmarks: postId },
      });
    }

    // Revalidate the page the user is currently on so the UI updates instantly
    revalidatePath(currentPath);

    return {
      success: true,
      message: isBookmarked ? "Removed from bookmarks." : "Saved to bookmarks.",
      isBookmarked: !isBookmarked,
    };
  } catch (error) {
    return { error: "Failed to update bookmark." };
  }
}

export async function getBookmarkedPosts() {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: "You must be logged in to view bookmarks." };
  }

  try {
    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email }).populate({
      path: "bookmarks",
      populate: [
        { path: "author", select: "name image" },
        { path: "category", select: "title slug" },
      ],
    });

    if (!user) return { error: "User not found." };

    return {
      success: true,
      data: user.bookmarks,
    };
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return { error: "Failed to fetch bookmarks." };
  }
}

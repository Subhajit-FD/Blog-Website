"use server";

import { connectToDatabase } from "@/lib/db";
import Post from "@/lib/models/Post";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// 1. INCREMENT VIEW (Called by the invisible tracker)
export async function incrementView(postId: string) {
  try {
    await connectToDatabase();
    // $inc atomically adds 1 to the current views value
    await Post.findByIdAndUpdate(postId, { $inc: { views: 1 } });
    return { success: true };
  } catch (error) {
    return { error: "Failed to increment view." };
  }
}

// 2. TOGGLE LIKE (Called by the Like button)
export async function toggleLike(postId: string, currentPath: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "You must be logged in to like a post." };

  try {
    await connectToDatabase();
    // Only fetch the likes array to save bandwidth
    const post = await Post.findById(postId).select("likes");
    if (!post) return { error: "Post not found." };

    const hasLiked = post.likes.includes(session.user.id);

    if (hasLiked) {
      // $pull completely removes their specific ID from the array
      await Post.findByIdAndUpdate(postId, { $pull: { likes: session.user.id } });
    } else {
      // $addToSet mathematically guarantees the ID is only added once
      await Post.findByIdAndUpdate(postId, { $addToSet: { likes: session.user.id } });
    }

    revalidatePath(currentPath);
    return { success: true, isLiked: !hasLiked };
  } catch (error) {
    return { error: "Failed to toggle like." };
  }
}
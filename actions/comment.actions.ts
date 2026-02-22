"use server";

import { connectToDatabase } from "@/lib/db";
import Comment from "@/lib/models/Comment";
import Post from "@/lib/models/Post";
import User from "@/lib/models/User";
import { auth } from "@/auth";
import { PERMISSIONS } from "@/lib/config/permissions";
import { revalidatePath } from "next/cache";

// 1. FETCH COMMENTS
export async function getDashboardComments() {
  try {
    await connectToDatabase();
    const comments = await Comment.find()
      .populate({ path: "post", select: "title slug", model: Post })
      .populate({ path: "author", select: "name email", model: User })
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      data: comments.map((c: any) => ({
        ...c,
        _id: c._id.toString(),
        post: c.post ? { ...c.post, _id: c.post._id.toString() } : null,
        author: c.author ? { ...c.author, _id: c.author._id.toString() } : null,
      })),
    };
  } catch (error) {
    return { error: "Failed to fetch comments." };
  }
}

// 2. DELETE COMMENT
export async function deleteComment(id: string) {
  const session = await auth();
  const permissions = session?.user?.permissions ?? 0;
  const canDelete =
    (permissions & PERMISSIONS.DELETE_COMMENT) !== 0 ||
    (permissions & PERMISSIONS.ADMINISTRATOR) !== 0;

  if (!canDelete) return { error: "Permission denied." };

  try {
    await connectToDatabase();
    await Comment.findByIdAndDelete(id);
    revalidatePath("/dashboard/comments");
    return { success: true, message: "Comment deleted." };
  } catch (error) {
    return { error: "Failed to delete comment." };
  }
}

// 3. UPDATE COMMENT (Edit text or Approve/Hide)
export async function updateComment(
  id: string,
  content: string,
  isApproved: boolean,
) {
  const session = await auth();
  // Changed to DELETE_COMMENT as a proxy for "Mod Power" since EDIT_COMMENT was removed
  const permissions = session?.user?.permissions ?? 0;
  const canEdit =
    (permissions & PERMISSIONS.DELETE_COMMENT) !== 0 ||
    (permissions & PERMISSIONS.ADMINISTRATOR) !== 0;

  if (!canEdit) return { error: "Permission denied." };

  try {
    await connectToDatabase();
    await Comment.findByIdAndUpdate(id, { content, isApproved });
    revalidatePath("/dashboard/comments");
    return { success: true, message: "Comment updated successfully." };
  } catch (error) {
    return { error: "Failed to update comment." };
  }
}
// 4. GET COMMENTS FOR A POST
export async function getPostComments(postId: string) {
  try {
    await connectToDatabase();
    const comments = await Comment.find({ post: postId, isApproved: true })
      .populate({ path: "author", select: "name image", model: User })
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      data: comments.map((c: any) => ({
        ...c,
        _id: c._id.toString(),
        post: c.post.toString(),
        author: c.author ? { ...c.author, _id: c.author._id.toString() } : null,
      })),
    };
  } catch (error) {
    return { error: "Failed to fetch comments." };
  }
}

// 5. CREATE COMMENT
export async function createComment(postId: string, content: string) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return { error: "You must be logged in to comment." };

    if (!content.trim()) return { error: "Comment cannot be empty." };

    await connectToDatabase();

    const newComment = await Comment.create({
      content,
      post: postId,
      author: session.user.id,
      isApproved: true, // Auto-approve for now, or change logic if needed
    });

    revalidatePath(`/blog/[slug]`); // We might not have slug here easily, but we can rely on client refresh or specific path if passed.
    // Actually, it's better to pass the path or just return success and let client update.
    // However, revalidatePath works with actual paths.
    // Since we don't have the slug here, we can revalidate the specific path if we pass it, or just revalidate the layout?
    // For now, let's return success and let the client component handle the UI update (e.g. optimistic or refetch).
    // But to be safe, we can try to find the post to get the slug for revalidation, or just revalidate '/blog'.

    // Let's find post to get slug for better revalidation
    const post = await Post.findById(postId).select("slug");
    if (post) {
      revalidatePath(`/blog/${post.slug}`);
    }

    return { success: true, message: "Comment posted successfully!" };
  } catch (error) {
    return { error: "Failed to post comment." };
  }
}

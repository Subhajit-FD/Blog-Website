"use server";

import { connectToDatabase } from "@/lib/db";
import Post from "@/lib/models/Post";

export async function getPopularTags(limit = 5) {
  try {
    await connectToDatabase();

    const tags = await Post.aggregate([
      // Only consider published posts
      { $match: { status: "PUBLISHED" } },
      // Unwind the tags array so we get one document per tag
      { $unwind: "$tags" },
      // Group by tag name and count occurrences
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      // Sort in descending order of count
      { $sort: { count: -1 } },
      // Limit to the top N tags
      { $limit: limit },
    ]);

    return {
      success: true,
      data: tags.map((tag) => ({ name: tag._id, count: tag.count })),
    };
  } catch (error) {
    console.error("Failed to fetch popular tags:", error);
    return { success: false, error: "Failed to fetch popular tags", data: [] };
  }
}

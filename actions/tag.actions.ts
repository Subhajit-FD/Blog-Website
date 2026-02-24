"use server";

import { connectToDatabase } from "@/lib/db";
import Post from "@/lib/models/Post";
import { unstable_cache } from "next/cache";

export const getPopularTags = unstable_cache(
  async (limit = 5) => {
    try {
      await connectToDatabase();

      const tags = await Post.aggregate([
        { $match: { status: "PUBLISHED" } },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit },
      ]);

      return {
        success: true,
        data: tags.map((tag) => ({ name: tag._id, count: tag.count })),
      };
    } catch (error) {
      console.error("Failed to fetch popular tags:", error);
      return {
        success: false,
        error: "Failed to fetch popular tags",
        data: [],
      };
    }
  },
  ["popular-tags"],
  {
    revalidate: 3600, // 1 hour — tags change infrequently
    tags: ["posts"],
  },
);

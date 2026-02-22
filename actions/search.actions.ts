"use server";

import { connectToDatabase } from "@/lib/db";
import Post from "@/lib/models/Post";
import Category from "@/lib/models/Category";

import { auth } from "@/auth";
import User from "@/lib/models/User";
import { PERMISSIONS } from "@/lib/config/permissions";

export async function globalSearch(query: string) {
  if (!query || query.length < 2)
    return { posts: [], categories: [], users: [] };

  const session = await auth();
  const userPerms = (session?.user?.permissions as number) ?? 0;

  await connectToDatabase();

  // 1. Define promises array
  const promises: any[] = [
    // Public: Posts
    Post.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    })
      .select("title slug")
      .limit(5)
      .lean(),

    // Public: Categories
    Category.find({
      title: { $regex: query, $options: "i" },
    })
      .select("title slug")
      .limit(5)
      .lean(),
  ];

  // 2. Conditional: Users (Requires READ_USER or ADMIN)
  const canViewUsers =
    (userPerms & PERMISSIONS.READ_USER) !== 0 ||
    (userPerms & PERMISSIONS.ADMINISTRATOR) !== 0;

  if (canViewUsers) {
    promises.push(
      User.find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
        ],
      })
        .select("name email")
        .limit(5)
        .lean(),
    );
  } else {
    promises.push(Promise.resolve([])); // Placeholder
  }

  // 3. Execute
  const [posts, categories, users] = await Promise.all(promises);

  return {
    posts: posts.map((p: any) => ({
      ...p,
      _id: p._id.toString(),
      type: "post",
    })),
    categories: categories.map((c: any) => ({
      ...c,
      _id: c._id.toString(),
      type: "category",
    })),
    users: users.map((u: any) => ({
      ...u,
      _id: u._id.toString(),
      type: "user",
    })),
  };
}

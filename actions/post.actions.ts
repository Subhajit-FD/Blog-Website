"use server";

import { connectToDatabase } from "@/lib/db";
import Post from "@/lib/models/Post";
import Category from "@/lib/models/Category"; // Required for populate()
import User from "@/lib/models/User"; // Required for populate()
import Team from "@/lib/models/Team"; // Required for populate()
import { postSchema, PostInput } from "@/lib/validations/post";
import { auth } from "@/auth";
import { revalidatePath, unstable_cache } from "next/cache";
import { PERMISSIONS } from "@/lib/config/permissions";

// Helper for strict role-based permissions
// Helper for strict role-based permissions
async function checkPermissions(permission: number) {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    throw new Error("Unauthorized");
  }

  const userPerms = user.permissions || 0;

  if ((userPerms & permission) === 0) {
    // Check for Admin override if direct permission is missing
    if ((userPerms & PERMISSIONS.ADMINISTRATOR) !== 0) {
      return user;
    }
    throw new Error("Unauthorized");
  }
  return user;
}

// 0. Helper for Public Status Filtering
const getPublicStatusFilter = () => {
  const now = new Date();
  return {
    $or: [
      { status: "PUBLISHED" },
      { status: "SCHEDULED", publishedAt: { $lte: now } },
    ],
  };
};

// 1. CREATE POST
export async function createPost(data: PostInput) {
  try {
    const user = await checkPermissions(PERMISSIONS.CREATE_POST);

    const validatedData = postSchema.safeParse(data);
    if (!validatedData.success) return { error: "Invalid data provided." };

    await connectToDatabase();

    const existingPost = await Post.findOne({ slug: validatedData.data.slug });
    if (existingPost)
      return { error: "A post with this URL slug already exists." };

    await Post.create({
      ...validatedData.data,
      author: user.id,
    });

    revalidatePath("/dashboard/posts");
    revalidatePath("/blog");
    revalidatePath("/", "page");

    return {
      success: true,
      message: `Post successfully saved as ${validatedData.data.status}!`,
    };
  } catch (error: any) {
    return { error: error.message || "Failed to create post." };
  }
}

// 2. READ POSTS (For the Dashboard Table)
export async function getPosts() {
  try {
    await connectToDatabase();

    // .populate() fetches the linked Category and User data instead of just returning their IDs
    const posts = await Post.find()
      .populate({ path: "category", select: "title slug", model: Category })
      .populate({ path: "author", select: "name email", model: User })
      .populate({ path: "teamId", select: "name", model: Team })
      .sort({ createdAt: -1 })
      .lean();

    // Convert MongoDB ObjectIds to strings to prevent Next.js hydration errors
    const serializedPosts = posts.map((post: any) => ({
      ...post,
      _id: post._id.toString(),
      category: post.category
        ? { ...post.category, _id: post.category._id.toString() }
        : null,
      author: post.author
        ? { ...post.author, _id: post.author._id.toString() }
        : null,
    }));

    return { success: true, data: serializedPosts };
  } catch (error: any) {
    return { error: "Failed to fetch posts." };
  }
}

// 3. UPDATE POST
export async function updatePost(id: string, data: PostInput) {
  try {
    await checkPermissions(PERMISSIONS.UPDATE_POST);

    const validatedData = postSchema.safeParse(data);
    if (!validatedData.success) return { error: "Invalid data." };

    await connectToDatabase();

    // Prevent stealing an existing slug from another post
    const duplicate = await Post.findOne({
      slug: validatedData.data.slug,
      _id: { $ne: id },
    });
    if (duplicate) return { error: "Slug is already in use by another post." };

    const updateData: any = { ...validatedData.data };
    if (!updateData.teamId) {
      updateData.teamId = null;
    }
    await Post.findByIdAndUpdate(id, updateData);

    revalidatePath("/dashboard/posts");
    revalidatePath(`/blog/${validatedData.data.slug}`);
    revalidatePath("/blog");
    revalidatePath("/", "page");

    return { success: true, message: "Post updated successfully!" };
  } catch (error: any) {
    return { error: error.message || "Failed to update post." };
  }
}

// 4. DELETE POST
export async function deletePost(id: string) {
  try {
    await checkPermissions(PERMISSIONS.DELETE_POST); // Editors cannot delete posts

    await connectToDatabase();
    await Post.findByIdAndDelete(id);

    revalidatePath("/dashboard/posts");
    revalidatePath("/blog");
    revalidatePath("/", "page");

    return { success: true, message: "Post permanently deleted." };
  } catch (error: any) {
    return { error: error.message || "Failed to delete post." };
  }
}

// 5. FETCH SINGLE POST BY ID
export async function getPostById(id: string) {
  try {
    await connectToDatabase();

    // Using .lean() for performance
    const post = await Post.findById(id).lean();

    if (!post) {
      return { error: "Post not found." };
    }

    // Convert ObjectIds to strings so React Hook Form can read them
    return {
      success: true,
      data: {
        ...post,
        _id: post._id.toString(),
        category: post.category.toString(),
        author: post.author.toString(),
        teamId: post.teamId ? post.teamId.toString() : null,
      },
    };
  } catch (error: any) {
    return { error: "Failed to fetch post." };
  }
}

// 6. FETCH PUBLIC POSTS — cached 30 minutes, purged when posts mutate
export const getPublicPosts = unstable_cache(
  async () => {
    try {
      await connectToDatabase();
      const posts = await Post.find(getPublicStatusFilter())
        .populate({ path: "category", select: "title slug", model: Category })
        .populate({ path: "author", select: "name image", model: User })
        .populate({ path: "teamId", select: "name", model: Team })
        .sort({ createdAt: -1 })
        .lean();

      return {
        success: true,
        data: posts.map((post: any) => ({
          ...post,
          _id: post._id.toString(),
          category: post.category
            ? { ...post.category, _id: post.category._id.toString() }
            : null,
          author: post.author
            ? { ...post.author, _id: post.author._id.toString() }
            : null,
        })),
      };
    } catch (error) {
      return { error: "Failed to fetch posts." };
    }
  },
  ["public-posts"],
  { revalidate: 1800, tags: ["posts"] },
);

// 7. FETCH PUBLIC POST BY SLUG
export async function getPostBySlug(slug: string) {
  try {
    await connectToDatabase();

    const post = await Post.findOne({
      slug,
      ...getPublicStatusFilter(),
    })
      .populate({ path: "category", select: "title slug", model: Category })
      .populate({ path: "author", select: "name image", model: User })
      .populate({ path: "teamId", select: "name", model: Team })
      .lean();

    if (!post) return { error: "Post not found." };

    return {
      success: true,
      data: {
        ...post,
        _id: post._id.toString(),
        category: post.category
          ? { ...post.category, _id: post.category._id.toString() }
          : null,
        author: post.author
          ? { ...post.author, _id: post.author._id.toString() }
          : null,
        likes: post.likes ? post.likes.map((id: any) => id.toString()) : [],
      },
    };
  } catch (error) {
    return { error: "Failed to fetch post." };
  }
}

// 8. FETCH POSTS BY CATEGORY
export async function getPostsByCategory(categoryId: string) {
  try {
    await connectToDatabase();

    const posts = await Post.find({
      category: categoryId,
      ...getPublicStatusFilter(),
    })
      .populate({ path: "category", select: "title slug", model: Category })
      .populate({ path: "author", select: "name image", model: User })
      .populate({ path: "teamId", select: "name", model: Team })
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      data: posts.map((post: any) => ({
        ...post,
        _id: post._id.toString(),
        category: post.category
          ? { ...post.category, _id: post.category._id.toString() }
          : null,
        author: post.author
          ? { ...post.author, _id: post.author._id.toString() }
          : null,
      })),
    };
  } catch (error) {
    return { error: "Failed to fetch posts." };
  }
}

// 9. SEARCH POSTS
export async function searchPosts(query: string) {
  try {
    await connectToDatabase();
    const regex = new RegExp(query, "i"); // Case-insensitive search

    const posts = await Post.find({
      ...getPublicStatusFilter(),
      $and: [
        {
          $or: [{ title: { $regex: regex } }, { tags: { $in: [regex] } }],
        },
      ],
    })
      .select("title slug coverImage category") // Select only necessary fields
      .populate({ path: "category", select: "title", model: Category })
      .limit(5)
      .lean();

    return {
      success: true,
      data: posts.map((post: any) => ({
        ...post,
        _id: post._id.toString(),
        category: post.category
          ? { ...post.category, _id: post.category._id.toString() }
          : null,
      })),
    };
  } catch (error) {
    console.error("Search error:", error);
    return { error: "Failed to search posts." };
  }
}

// 10. GET EDITOR'S CHOICE POSTS
export async function getEditorsChoicePosts() {
  try {
    await connectToDatabase();
    const posts = await Post.find({
      displayTags: "Editor Choice",
      ...getPublicStatusFilter(),
    })
      .populate({ path: "category", select: "title slug", model: Category })
      .populate({ path: "author", select: "name image", model: User })
      .populate({ path: "teamId", select: "name", model: Team })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    return {
      success: true,
      data: posts.map((post: any) => ({
        ...post,
        _id: post._id.toString(),
        category: post.category
          ? { ...post.category, _id: post.category._id.toString() }
          : null,
        author: post.author
          ? { ...post.author, _id: post.author._id.toString() }
          : null,
      })),
    };
  } catch (error) {
    return { error: "Failed to fetch Editor's Choice posts." };
  }
}

// 11. GET RANDOM CATEGORY POST (For Homepage Feature)
export async function getRandomCategoryPost() {
  try {
    await connectToDatabase();

    const publishedQuery = getPublicStatusFilter();

    // 1. Get all category IDs that have at least one published post
    const categoryIds = await Post.distinct("category", publishedQuery);

    if (categoryIds.length === 0) return { success: true, data: null };

    // 2. Pick a random category ID
    const randomCategoryId =
      categoryIds[Math.floor(Math.random() * categoryIds.length)];

    // 3. Fetch the latest post from that category
    const post = await Post.findOne({
      category: randomCategoryId,
      ...publishedQuery,
    })
      .sort({ createdAt: -1 }) // Latest post
      .populate({ path: "category", select: "title slug", model: Category })
      .populate({ path: "author", select: "name image", model: User })
      .populate({ path: "teamId", select: "name", model: Team })
      .lean();

    if (!post) return { success: true, data: null };

    return {
      success: true,
      data: {
        ...post,
        _id: post._id.toString(),
        category: post.category
          ? { ...post.category, _id: post.category._id.toString() }
          : null,
        author: post.author
          ? { ...post.author, _id: post.author._id.toString() }
          : null,
      },
    };
  } catch (error) {
    console.error("Random category fetch error:", error);
    return { error: "Failed to fetch random category post." };
  }
}

// 11. GET TRENDING POSTS — with fallback to most-viewed when not enough tagged posts
export async function getTrendingPosts() {
  const LIMIT = 5;
  try {
    await connectToDatabase();
    const publicFilter = getPublicStatusFilter();

    const serializePost = (post: any) => ({
      ...post,
      _id: post._id.toString(),
      category: post.category
        ? { ...post.category, _id: post.category._id.toString() }
        : null,
      author: post.author
        ? { ...post.author, _id: post.author._id.toString() }
        : null,
    });

    // 1. First, get manually-tagged Trending posts
    const tagged = await Post.find({
      displayTags: "Trending",
      ...publicFilter,
    })
      .sort({ createdAt: -1 })
      .limit(LIMIT)
      .populate({ path: "category", select: "title slug", model: Category })
      .populate({ path: "author", select: "name image", model: User })
      .populate({ path: "teamId", select: "name", model: Team })
      .lean();

    if (tagged.length >= LIMIT) {
      return { success: true, data: tagged.map(serializePost) };
    }

    // 2. Fallback: fill remaining slots with most-viewed posts (exclude already fetched)
    const taggedIds = tagged.map((p: any) => p._id);
    const needed = LIMIT - tagged.length;
    const fallback = await Post.find({
      ...publicFilter,
      _id: { $nin: taggedIds },
    })
      .sort({ views: -1, createdAt: -1 })
      .limit(needed)
      .populate({ path: "category", select: "title slug", model: Category })
      .populate({ path: "author", select: "name image", model: User })
      .populate({ path: "teamId", select: "name", model: Team })
      .lean();

    return {
      success: true,
      data: [...tagged, ...fallback].map(serializePost),
    };
  } catch (error) {
    return { error: "Failed to fetch Trending posts." };
  }
}

// 12. GET LATEST POST (HERO) — always fresh so imported posts appear immediately
export async function getLatestPost() {
  try {
    await connectToDatabase();
    const post = await Post.findOne(getPublicStatusFilter())
      .sort({ createdAt: -1 })
      .populate({ path: "category", select: "title slug", model: Category })
      .populate({ path: "author", select: "name image", model: User })
      .populate({ path: "teamId", select: "name", model: Team })
      .lean();

    if (!post) return { error: "No posts found." };

    return {
      success: true,
      data: {
        ...post,
        _id: post._id.toString(),
        category: post.category
          ? { ...post.category, _id: post.category._id.toString() }
          : null,
        author: post.author
          ? { ...post.author, _id: post.author._id.toString() }
          : null,
      },
    };
  } catch (error) {
    return { error: "Failed to fetch latest post." };
  }
}
// 13. GET RANDOM POSTS (For Pagination Feature)
export async function getRandomPosts(limit: number = 12) {
  try {
    await connectToDatabase();

    const pipeline = [
      {
        $match: getPublicStatusFilter(),
      },
      { $sample: { size: limit } },
    ];

    const posts = await Post.aggregate(pipeline);

    // Populate after aggregation
    await Post.populate(posts, [
      { path: "category", select: "title slug", model: Category },
      { path: "author", select: "name image", model: User },
      { path: "teamId", select: "name", model: Team },
    ]);

    // Deep sanitize to remove any Mongoose internal properties and convert ObjectIds/Dates to strings
    const serializedPosts = JSON.parse(JSON.stringify(posts));

    return {
      success: true,
      data: serializedPosts,
    };
  } catch (error) {
    console.error("Random posts fetch error:", error);
    return { error: "Failed to fetch random posts." };
  }
}

// 14. GET POSTS BY TAG — for the /tag/[slug] public page
export async function getPostsByTag(tag: string) {
  try {
    await connectToDatabase();

    const posts = await Post.find({
      tags: { $regex: new RegExp(`^${tag}$`, "i") }, // case-insensitive exact match
      ...getPublicStatusFilter(),
    })
      .populate({ path: "category", select: "title slug", model: Category })
      .populate({ path: "author", select: "name image", model: User })
      .populate({ path: "teamId", select: "name", model: Team })
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      data: posts.map((post: any) => ({
        ...post,
        _id: post._id.toString(),
        category: post.category
          ? { ...post.category, _id: post.category._id.toString() }
          : null,
        author: post.author
          ? { ...post.author, _id: post.author._id.toString() }
          : null,
      })),
    };
  } catch (error) {
    return { error: "Failed to fetch posts by tag." };
  }
}

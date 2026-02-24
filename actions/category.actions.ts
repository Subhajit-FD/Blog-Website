"use server";

import { connectToDatabase } from "@/lib/db";
import Category from "@/lib/models/Category";
import { categorySchema, CategoryInput } from "@/lib/validations/category";
import { auth } from "@/auth";
import { revalidatePath, unstable_cache } from "next/cache";
import { PERMISSIONS } from "@/lib/config/permissions";

// Helper function to check permissions
async function checkPermissions(requiredPermission: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userPerms = session.user.permissions;

  if ((userPerms & PERMISSIONS.ADMINISTRATOR) === PERMISSIONS.ADMINISTRATOR) {
    return session.user;
  }

  if ((userPerms & requiredPermission) !== requiredPermission) {
    throw new Error("Forbidden: You do not have the required permissions.");
  }

  return session.user;
}

// 1. CREATE CATEGORY
export async function createCategory(data: CategoryInput) {
  try {
    await checkPermissions(PERMISSIONS.CREATE_CATEGORY);

    const validatedData = categorySchema.safeParse(data);
    if (!validatedData.success) {
      return { error: "Invalid data provided." };
    }

    await connectToDatabase();

    const existingCategory = await Category.findOne({
      slug: validatedData.data.slug,
    });
    if (existingCategory) {
      return { error: "A category with this slug already exists." };
    }

    await Category.create(validatedData.data);

    revalidatePath("/dashboard/categories");
    revalidatePath("/blog");

    return { success: true, message: "Category created successfully!" };
  } catch (error: any) {
    return { error: error.message || "Failed to create category." };
  }
}

// 2. READ CATEGORIES (For Dashboard — no cache, always fresh)
export async function getCategories() {
  try {
    await connectToDatabase();
    const categories = await Category.find().sort({ createdAt: -1 }).lean();

    return {
      success: true,
      data: categories.map((cat) => ({
        ...cat,
        _id: cat._id.toString(),
      })),
    };
  } catch (error) {
    return { error: "Failed to fetch categories." };
  }
}

// 3. UPDATE CATEGORY
export async function updateCategory(id: string, data: CategoryInput) {
  try {
    await checkPermissions(PERMISSIONS.UPDATE_CATEGORY);

    const validatedData = categorySchema.safeParse(data);
    if (!validatedData.success) return { error: "Invalid data." };

    await connectToDatabase();

    const duplicate = await Category.findOne({
      slug: validatedData.data.slug,
      _id: { $ne: id },
    });
    if (duplicate)
      return { error: "Slug is already in use by another category." };

    await Category.findByIdAndUpdate(id, validatedData.data);

    revalidatePath("/dashboard/categories");
    return { success: true, message: "Category updated!" };
  } catch (error: any) {
    return { error: error.message || "Failed to update category." };
  }
}

// 4. DELETE CATEGORY
export async function deleteCategory(id: string) {
  try {
    await checkPermissions(PERMISSIONS.DELETE_CATEGORY);

    await connectToDatabase();
    await Category.findByIdAndDelete(id);

    revalidatePath("/dashboard/categories");
    return { success: true, message: "Category deleted." };
  } catch (error: any) {
    return { error: error.message || "Failed to delete category." };
  }
}

// 5. GET PUBLIC CATEGORIES — cached for 1 hour, revalidated on category change
export const getPublicCategories = unstable_cache(
  async () => {
    try {
      await connectToDatabase();
      const categories = await Category.find()
        .select("title slug")
        .limit(10)
        .lean();
      return {
        success: true,
        data: categories.map((c: any) => ({ ...c, _id: c._id.toString() })),
      };
    } catch (error) {
      return { error: "Failed to fetch categories" };
    }
  },
  ["public-categories"],
  {
    revalidate: 3600,
    tags: ["categories"],
  },
);

// 6. GET CATEGORY BY SLUG — cached per slug for 1 hour
export async function getCategoryBySlug(slug: string) {
  const cached = unstable_cache(
    async (s: string) => {
      try {
        await connectToDatabase();
        const category = await Category.findOne({ slug: s }).lean();
        if (!category) return { error: "Category not found" };

        return {
          success: true,
          data: {
            ...category,
            _id: category._id.toString(),
          },
        };
      } catch (error) {
        return { error: "Failed to fetch category" };
      }
    },
    [`category-${slug}`],
    { revalidate: 3600, tags: ["categories"] },
  );
  return cached(slug);
}

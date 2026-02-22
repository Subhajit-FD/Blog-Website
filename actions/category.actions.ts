"use server";

import { connectToDatabase } from "@/lib/db";
import Category from "@/lib/models/Category";
import { categorySchema, CategoryInput } from "@/lib/validations/category";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { PERMISSIONS } from "@/lib/config/permissions";

// Helper function to check permissions
async function checkPermissions(requiredPermission: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userPerms = session.user.permissions;

  // 1. Master Admin Override
  if ((userPerms & PERMISSIONS.ADMINISTRATOR) === PERMISSIONS.ADMINISTRATOR) {
    return session.user;
  }

  // 2. Specific Permission Check
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

    // Check if slug is already taken (Slugs must be unique for URLs to work)
    const existingCategory = await Category.findOne({
      slug: validatedData.data.slug,
    });
    if (existingCategory) {
      return { error: "A category with this slug already exists." };
    }

    await Category.create(validatedData.data);

    revalidatePath("/dashboard/categories"); // Refresh the dashboard table
    revalidatePath("/blog"); // Refresh the public blog

    return { success: true, message: "Category created successfully!" };
  } catch (error: any) {
    return { error: error.message || "Failed to create category." };
  }
}

// 2. READ CATEGORIES (Get all)
export async function getCategories() {
  try {
    await connectToDatabase();
    // Use .lean() to return plain JS objects, preventing the DataCloneError!
    const categories = await Category.find().sort({ createdAt: -1 }).lean();

    // We stringify the _id to avoid React hydration issues with MongoDB ObjectIds
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

    // Check if the NEW slug belongs to a DIFFERENT category
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

// 5. GET PUBLIC CATEGORIES
export async function getPublicCategories() {
  try {
    await connectToDatabase();
    // Only fetch what we need for the navbar to keep it lightning fast
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
}

// 6. GET CATEGORY BY SLUG
export async function getCategoryBySlug(slug: string) {
  try {
    await connectToDatabase();
    const category = await Category.findOne({ slug }).lean();
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
}

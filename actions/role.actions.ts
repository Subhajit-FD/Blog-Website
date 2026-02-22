"use server";

import { connectToDatabase } from "@/lib/db";
import Role from "@/lib/models/Role";
import { auth } from "@/auth";
import { PERMISSIONS } from "@/lib/config/permissions";
import { revalidatePath } from "next/cache";
import slugify from "slugify";

// Helper to check specific permissions
async function checkRolePermission(permission: number) {
  const session = await auth();
  const perms = (session?.user?.permissions as number) || 0;
  return (
    (perms & permission) !== 0 || (perms & PERMISSIONS.ADMINISTRATOR) !== 0
  );
}

export async function createRole(data: {
  name: string;
  description: string;
  permissions: number;
}) {
  const session = await auth();
  const userPerms = (session?.user?.permissions as number) || 0;
  const isActorAdmin = (userPerms & PERMISSIONS.ADMINISTRATOR) !== 0;

  if (!isActorAdmin && (userPerms & PERMISSIONS.CREATE_ROLE) === 0)
    return { error: "Permission denied." };

  // Prevent Privilege Escalation: cannot grant permissions you don't have
  if (!isActorAdmin && (data.permissions & ~userPerms) !== 0) {
    return {
      error: "You cannot create a role with permissions you do not possess.",
    };
  }

  try {
    await connectToDatabase();

    const slug = slugify(data.name, { lower: true, strict: true });

    // check if slug exists
    const existing = await Role.findOne({ slug });
    if (existing) return { error: "Role name already exists." };

    const newRole = await Role.create({
      name: data.name,
      slug,
      description: data.description,
      permissions: data.permissions,
      isSystem: false,
    });

    revalidatePath("/dashboard/roles");
    return { success: true, role: JSON.parse(JSON.stringify(newRole)) };
  } catch (error) {
    return { error: "Failed to create role." };
  }
}

export async function updateRole(
  id: string,
  data: { name: string; description: string; permissions: number },
) {
  const session = await auth();
  const userPerms = (session?.user?.permissions as number) || 0;
  const isActorAdmin = (userPerms & PERMISSIONS.ADMINISTRATOR) !== 0;

  if (!isActorAdmin && (userPerms & PERMISSIONS.UPDATE_ROLE) === 0)
    return { error: "Permission denied." };

  // Prevent Privilege Escalation
  if (!isActorAdmin && (data.permissions & ~userPerms) !== 0) {
    return {
      error: "You cannot update a role with permissions you do not possess.",
    };
  }

  try {
    await connectToDatabase();

    const slug = slugify(data.name, { lower: true, strict: true });

    // check if slug exists for OTHER roles
    const existing = await Role.findOne({ slug, _id: { $ne: id } });
    if (existing) return { error: "Role name already taken." };

    await Role.findByIdAndUpdate(id, {
      name: data.name,
      slug,
      description: data.description,
      permissions: data.permissions,
    });

    revalidatePath("/dashboard/roles");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update role." };
  }
}

export async function deleteRole(id: string) {
  if (!(await checkRolePermission(PERMISSIONS.DELETE_ROLE)))
    return { error: "Permission denied." };

  try {
    await connectToDatabase();

    const role = await Role.findById(id);
    if (!role) return { error: "Role not found." };
    if (role.isSystem) return { error: "Cannot delete system roles." };

    await Role.findByIdAndDelete(id);

    revalidatePath("/dashboard/roles");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete role." };
  }
}

export async function getRoles() {
  // Allow view access to users who need to Assign Roles (UPDATE_USER) or Manage Roles
  const session = await auth();
  const perms = (session?.user?.permissions as number) || 0;
  const canView =
    (perms & PERMISSIONS.UPDATE_USER) !== 0 ||
    (perms & PERMISSIONS.CREATE_ROLE) !== 0 ||
    (perms & PERMISSIONS.ADMINISTRATOR) !== 0;

  if (!canView) return { error: "Permission denied." };

  try {
    await connectToDatabase();
    const roles = await Role.find().sort({ createdAt: 1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(roles)) };
  } catch (error) {
    return { error: "Failed to fetch roles." };
  }
}

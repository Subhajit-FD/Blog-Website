"use server";

import { connectToDatabase } from "@/lib/db";
import Team from "@/lib/models/Team";
import { auth } from "@/auth";
import { PERMISSIONS } from "@/lib/config/permissions";
import { revalidatePath } from "next/cache";

export async function createTeam(name: string) {
  const session = await auth();
  const canManage =
    (session?.user?.permissions
      ? session.user.permissions & PERMISSIONS.ADMINISTRATOR
      : 0) !== 0;

  if (!canManage) return { error: "Permission denied. Admin access required." };

  if (!name.trim()) return { error: "Team name is required." };

  try {
    await connectToDatabase();

    const existingTeam = await Team.findOne({ name });
    if (existingTeam) {
      return { error: "A team with this name already exists." };
    }

    await Team.create({ name });

    revalidatePath("/dashboard/teams");
    return { success: true, message: "Team created successfully." };
  } catch (error: any) {
    return { error: error.message || "Failed to create team." };
  }
}

export async function getTeams() {
  try {
    await connectToDatabase();

    const teams = await Team.find().sort({ name: 1 }).lean();

    // Convert ObjectIds to strings
    const serializedTeams = teams.map((team: any) => ({
      ...team,
      _id: team._id.toString(),
    }));

    return { success: true, data: serializedTeams };
  } catch (error: any) {
    return { error: "Failed to fetch teams." };
  }
}

export async function deleteTeam(id: string) {
  const session = await auth();
  const canManage =
    (session?.user?.permissions
      ? session.user.permissions & PERMISSIONS.DELETE_TEAM
      : 0) !== 0 ||
    (session?.user?.permissions
      ? session.user.permissions & PERMISSIONS.ADMINISTRATOR
      : 0) !== 0;

  if (!canManage) return { error: "Permission denied." };

  try {
    await connectToDatabase();

    await Team.findByIdAndDelete(id);

    // After deleting a team, we should probably remove references from Users and Posts
    // For now we'll just delete the team itself.

    revalidatePath("/dashboard/teams");
    revalidatePath("/dashboard/users"); // In case users were showing this team
    revalidatePath("/dashboard/posts");

    return { success: true, message: "Team deleted successfully." };
  } catch (error: any) {
    return { error: error.message || "Failed to delete team." };
  }
}

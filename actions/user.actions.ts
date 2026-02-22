"use server";

import { connectToDatabase } from "@/lib/db";
import User from "@/lib/models/User";
import Role from "@/lib/models/Role";
import Team from "@/lib/models/Team";
import { auth } from "@/auth";
import { PERMISSIONS } from "@/lib/config/permissions";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { verifyOTP } from "./otp.actions";
import {
  profileSchema,
  ProfileInput,
  changePasswordSchema,
  ChangePasswordInput,
} from "@/lib/validations/user";
import { verifyPassword } from "@/lib/helpers/password";

// ... existing code ...

export async function assignRoleToUser(userId: string, roleId: string) {
  const session = await auth();
  const userPerms = (session?.user?.permissions as number) ?? 0;
  const isActorAdmin = (userPerms & PERMISSIONS.ADMINISTRATOR) !== 0;

  const canManage = (userPerms & PERMISSIONS.UPDATE_USER) !== 0 || isActorAdmin;

  if (!canManage) return { error: "Permission denied." };

  try {
    await connectToDatabase();

    const role = await Role.findById(roleId);
    if (!role) return { error: "Role not found." };

    // Prevent Privilege Escalation: You cannot assign a role with permissions that you do not have yourself
    if (!isActorAdmin && (role.permissions & ~userPerms) !== 0) {
      return {
        error:
          "You cannot assign a role with permissions higher than your own.",
      };
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) return { error: "User not found." };

    if (
      !isActorAdmin &&
      (targetUser.permissions & PERMISSIONS.ADMINISTRATOR) !== 0
    ) {
      return { error: "You cannot alter the role of a Master Admin." };
    }

    // Update user: set roleId AND cache the permissions
    await User.findByIdAndUpdate(userId, {
      roleId: roleId,
      permissions: role.permissions,
    });

    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error) {
    return { error: "Failed to assign role." };
  }
}

export async function assignTeamToUser(userId: string, teamId: string | null) {
  const session = await auth();
  const permissions = session?.user?.permissions ?? 0;
  const canManage =
    (permissions & PERMISSIONS.UPDATE_USER) !== 0 ||
    (permissions & PERMISSIONS.ADMINISTRATOR) !== 0;

  if (!canManage) return { error: "Permission denied." };

  try {
    await connectToDatabase();

    if (teamId) {
      const team = await Team.findById(teamId);
      if (!team) return { error: "Team not found." };
    }

    await User.findByIdAndUpdate(userId, {
      teamId: teamId || null,
    });

    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error) {
    return { error: "Failed to assign team." };
  }
}

export async function updateUserRole(
  targetUserId: string,
  newPermissionBit: number,
) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const adminPerms = session?.user?.permissions ?? 0;

  // 1. Check if the logged-in user has UPDATE_USER permission
  const canManage =
    (adminPerms & PERMISSIONS.UPDATE_USER) !== 0 ||
    (adminPerms & PERMISSIONS.ADMINISTRATOR) !== 0;
  if (!canManage) return { error: "Forbidden" };

  await connectToDatabase();
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) return { error: "User not found" };

  // 2. Hierarchy Check: You cannot manage someone with ADMINISTRATOR bit if you don't have it
  const isTargetAdmin =
    (targetUser.permissions & PERMISSIONS.ADMINISTRATOR) !== 0;
  const isActorAdmin = (adminPerms & PERMISSIONS.ADMINISTRATOR) !== 0;

  if (isTargetAdmin && !isActorAdmin) {
    return { error: "You cannot change the role of a Master Admin." };
  }

  // 3. Update the bits
  // NOTE: If we are manually setting bits, we probably want to UNSET the roleId
  // so the UI knows this is a "Custom" role now, not linked to the Role definition.
  // Unless we are just re-syncing? Let's unset roleId to be safe showing "Custom".
  targetUser.permissions = newPermissionBit;
  targetUser.roleId = undefined; // Unlink role if manually changed
  await targetUser.save();

  revalidatePath("/dashboard/users");
  return { success: true };
}

// 1. UPDATE PROFILE (Name & Image)
export async function updateUserProfile(data: ProfileInput) {
  const session = await auth();
  if (!session?.user?.email) return { error: "Unauthorized" };

  const validatedData = profileSchema.safeParse(data);
  if (!validatedData.success) return { error: "Invalid data." };

  try {
    await connectToDatabase();
    await User.findOneAndUpdate(
      { email: session.user.email },
      { name: validatedData.data.name, image: validatedData.data.image },
    );

    revalidatePath("/dashboard/profile");
    return { success: true, message: "Profile updated successfully!" };
  } catch (error) {
    return { error: "Failed to update profile." };
  }
}

// 2. RESET PASSWORD (With OTP Verification)
export async function resetPasswordWithOtp(
  email: string,
  otp: string,
  newPassword: string,
) {
  try {
    // 1. Verify the OTP explicitly for the "PASSWORD_RESET" action
    const otpVerification = await verifyOTP(email, otp, "PASSWORD_RESET");
    if (otpVerification.error) {
      return { error: otpVerification.error };
    }

    // 2. Hash the new password securely
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // 3. Update the database
    await connectToDatabase();
    await User.findOneAndUpdate({ email }, { password: hashedPassword });

    return {
      success: true,
      message:
        "Password updated successfully! You can now log in with your new password.",
    };
  } catch (error) {
    return { error: "Failed to reset password." };
  }
}

// 3. CHANGE PASSWORD (Logged in user)
export async function changePassword(data: ChangePasswordInput) {
  const session = await auth();
  if (!session?.user?.email) return { error: "Unauthorized" };

  const validated = changePasswordSchema.safeParse(data);
  if (!validated.success) return { error: "Invalid data." };

  const { currentPassword, newPassword } = validated.data;

  try {
    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email }).select(
      "+password",
    );

    if (!user) return { error: "User not found." };
    if (!user.password)
      return {
        error:
          "You are logged in with a provider (e.g. Google). Cannot change password.",
      };

    const isMatch = await verifyPassword(currentPassword, user.password);
    if (!isMatch) return { error: "Incorrect current password." };

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    return { success: true, message: "Password changed successfully!" };
  } catch (error) {
    return { error: "Failed to change password." };
  }
}

"use client";

import { useState, useTransition } from "react";
import {
  updateUserRole,
  assignRoleToUser,
  assignTeamToUser,
} from "@/actions/user.actions";
import { PERMISSIONS, ROLES } from "@/lib/config/permissions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Shield, MoreHorizontal, Check, Users } from "lucide-react";

interface Role {
  _id: string;
  name: string;
  slug: string; // Added slug
  permissions: number;
}

interface Team {
  _id: string;
  name: string;
}

export default function UserRoleRow({
  user,
  currentUserPermissions,
  roles = [],
  teams = [],
}: {
  user: any;
  currentUserPermissions: number;
  roles: Role[];
  teams?: Team[];
}) {
  const [isPending, startTransition] = useTransition();

  // Legacy Bitwise Update
  const handlePermissionChange = (newBit: number) => {
    startTransition(async () => {
      // For legacy presets, we might want to clear the custom roleId
      // But updateUserRole handles the bitwise update.
      // If we are setting a 'preset' (like ADMIN), we should ideally find the Admin role and assign it.
      // For now, we'll keep the direct bitwise update for "Force Admin" and resets.
      const res = await updateUserRole(user._id, newBit);
      if (res.error) toast.error(res.error);
      else toast.success("Permissions updated!");
    });
  };

  // Dynamic Role Assignment
  const handleAssignRole = (roleId: string) => {
    startTransition(async () => {
      const res = await assignRoleToUser(user._id, roleId);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Role assigned!");
      }
    });
  };

  // Dynamic Team Assignment
  const handleAssignTeam = (teamId: string | null) => {
    startTransition(async () => {
      const res = await assignTeamToUser(user._id, teamId);
      if (res.error) toast.error(res.error);
      else {
        toast.success(teamId ? "Team assigned!" : "Team unassigned!");
      }
    });
  };

  // Helper to check if user has a specific bit for labeling
  const isBitSet = (bit: number) => (user.permissions & bit) === bit;

  // Determine Display Role
  let displayRoleName = "Custom";
  let roleBadgeVariant: "default" | "secondary" | "outline" | "destructive" =
    "outline";

  if (user.roleId) {
    displayRoleName = user.roleId.name;
    // Style based on some heuristics or specific slugs
    if (user.roleId.slug === "admin") roleBadgeVariant = "destructive";
    else if (user.roleId.slug === "manager") roleBadgeVariant = "default";
    else if (user.roleId.slug === "editor") roleBadgeVariant = "secondary";
    else roleBadgeVariant = "secondary";
  } else {
    // Fallback: Try to match permissions to known roles if NO roleId is set
    // This handles users who were assigned bits before the role system was fully used
    if (user.permissions === ROLES.ADMIN) {
      displayRoleName = "Admin (Legacy)";
      roleBadgeVariant = "destructive";
    } else if (user.permissions === ROLES.USER) {
      displayRoleName = "User";
      roleBadgeVariant = "outline";
    } else {
      // Check if permissions match any predefined role exactly
      const matchedRole = roles.find((r) => r.permissions === user.permissions);
      if (matchedRole) {
        displayRoleName = `${matchedRole.name} (Unlinked)`;
        roleBadgeVariant = "secondary";
      }
    }
  }

  return (
    <TableRow>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{user.name}</span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Badge variant={roleBadgeVariant}>{displayRoleName}</Badge>
            {user.teamId && (
              <Badge variant="outline" className="border-primary text-primary">
                {user.teamId.name}
              </Badge>
            )}
          </div>
          <div className="flex gap-1 flex-wrap mt-1">
            {isBitSet(PERMISSIONS.ADMINISTRATOR) && (
              <Badge variant="destructive" className="text-[10px] h-5">
                MASTER
              </Badge>
            )}
            {isBitSet(PERMISSIONS.VIEW_DASHBOARD) && (
              <Badge variant="secondary" className="text-[10px] h-5">
                DASHBOARD
              </Badge>
            )}
            {/* Only show "Custom" bits if it's not a standard simple role */}
            {user.permissions !== ROLES.USER &&
              // Only show custom indicator if no role is assigned but bits are present
              !user.roleId && (
                <Badge variant="outline" className="text-[10px] h-5 bg-muted">
                  Custom
                </Badge>
              )}
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isPending}>
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            {/* DYNAMIC ROLES SUBMENU */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Shield className="w-4 h-4 mr-2" /> Assign Role
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {roles.length > 0 ? (
                  roles.map((role) => (
                    <DropdownMenuItem
                      key={role._id}
                      onClick={() => handleAssignRole(role._id)}
                    >
                      <span>{role.name}</span>
                      {user.roleId?._id === role._id && (
                        <Check className="w-4 h-4 ml-auto" />
                      )}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>No roles created</DropdownMenuItem>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            {/* DYNAMIC TEAMS SUBMENU */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Users className="w-4 h-4 mr-2" /> Assign Team
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => handleAssignTeam(null)}>
                  <span>None</span>
                  {!user.teamId && <Check className="w-4 h-4 ml-auto" />}
                </DropdownMenuItem>
                {teams.map((team) => (
                  <DropdownMenuItem
                    key={team._id}
                    onClick={() => handleAssignTeam(team._id)}
                  >
                    <span>{team.name}</span>
                    {user.teamId?._id === team._id && (
                      <Check className="w-4 h-4 ml-auto" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => handlePermissionChange(0)} // Reset to 0 (ROLES.USER)
            >
              Reset to User
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => handlePermissionChange(PERMISSIONS.ADMINISTRATOR)}
              disabled={
                (currentUserPermissions & PERMISSIONS.ADMINISTRATOR) === 0
              }
            >
              Force Admin
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

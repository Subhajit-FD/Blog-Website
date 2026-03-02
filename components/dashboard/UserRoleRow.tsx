"use client";

import { useState, useTransition } from "react";
import {
  updateUserRole,
  assignRoleToUser,
  toggleTeamForUser,
  clearAllTeamsFromUser,
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
import { Shield, MoreHorizontal, Check, Users, X } from "lucide-react";

interface Role {
  _id: string;
  name: string;
  slug: string;
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

  const handlePermissionChange = (newBit: number) => {
    startTransition(async () => {
      const res = await updateUserRole(user._id, newBit);
      if (res.error) toast.error(res.error);
      else toast.success("Permissions updated!");
    });
  };

  const handleAssignRole = (roleId: string) => {
    startTransition(async () => {
      const res = await assignRoleToUser(user._id, roleId);
      if (res.error) toast.error(res.error);
      else toast.success("Role assigned!");
    });
  };

  const handleToggleTeam = (teamId: string, teamName: string) => {
    startTransition(async () => {
      const res = await toggleTeamForUser(user._id, teamId);
      if (res.error) toast.error(res.error);
      else
        toast.success(
          res.removed ? `Removed from ${teamName}` : `Added to ${teamName}`,
        );
    });
  };

  const handleClearTeams = () => {
    startTransition(async () => {
      const res = await clearAllTeamsFromUser(user._id);
      if (res.error) toast.error(res.error);
      else toast.success("All teams cleared.");
    });
  };

  const isBitSet = (bit: number) => (user.permissions & bit) === bit;

  // Determine if a team is currently assigned
  const userTeamIds: string[] = (user.teamIds || []).map((t: any) =>
    typeof t === "string" ? t : t._id?.toString?.() || "",
  );
  const hasTeam = (teamId: string) => userTeamIds.includes(teamId);

  // Get populated team objects for display
  const assignedTeams: { _id: string; name: string }[] = (
    user.teamIds || []
  ).filter((t: any) => t && typeof t === "object" && t.name);

  // Determine Display Role
  let displayRoleName = "Custom";
  let roleBadgeVariant: "default" | "secondary" | "outline" | "destructive" =
    "outline";

  if (user.roleId) {
    displayRoleName = user.roleId.name;
    if (user.roleId.slug === "admin") roleBadgeVariant = "destructive";
    else if (user.roleId.slug === "manager") roleBadgeVariant = "default";
    else roleBadgeVariant = "secondary";
  } else {
    if (user.permissions === ROLES.ADMIN) {
      displayRoleName = "Admin (Legacy)";
      roleBadgeVariant = "destructive";
    } else if (user.permissions === ROLES.USER) {
      displayRoleName = "User";
      roleBadgeVariant = "outline";
    } else {
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
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={roleBadgeVariant}>{displayRoleName}</Badge>
            {/* Multi-team badges */}
            {assignedTeams.map((team) => (
              <Badge
                key={team._id}
                variant="outline"
                className="border-primary text-primary flex items-center gap-1 pr-1"
              >
                {team.name}
                <button
                  disabled={isPending}
                  onClick={() => handleToggleTeam(team._id, team.name)}
                  className="hover:text-destructive transition-colors ml-0.5"
                  title={`Remove from ${team.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
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
            {user.permissions !== ROLES.USER && !user.roleId && (
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

            {/* MULTI-TEAM SUBMENU */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Users className="w-4 h-4 mr-2" /> Assign Teams
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {teams.length > 0 ? (
                  <>
                    {teams.map((team) => (
                      <DropdownMenuItem
                        key={team._id}
                        onClick={() => handleToggleTeam(team._id, team.name)}
                      >
                        <span>{team.name}</span>
                        {hasTeam(team._id) && (
                          <Check className="w-4 h-4 ml-auto text-primary" />
                        )}
                      </DropdownMenuItem>
                    ))}
                    {assignedTeams.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={handleClearTeams}
                          className="text-muted-foreground text-xs"
                        >
                          Clear all teams
                        </DropdownMenuItem>
                      </>
                    )}
                  </>
                ) : (
                  <DropdownMenuItem disabled>No teams created</DropdownMenuItem>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => handlePermissionChange(0)}>
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

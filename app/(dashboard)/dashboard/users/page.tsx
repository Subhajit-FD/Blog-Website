import { connectToDatabase } from "@/lib/db";
import User from "@/lib/models/User";
import Role from "@/lib/models/Role";
import Team from "@/lib/models/Team";
import { PERMISSIONS } from "@/lib/config/permissions";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import UsersTable from "@/components/dashboard/UsersTable";

export default async function UsersPage() {
  const session = await auth();

  const currentUserPermissions = session?.user?.permissions || 0;
  const isAdmin = (currentUserPermissions & PERMISSIONS.ADMINISTRATOR) !== 0;
  const canAccess =
    (currentUserPermissions & PERMISSIONS.READ_USER) !== 0 || isAdmin;

  if (!canAccess) redirect("/dashboard");

  await connectToDatabase();
  const users = await User.find()
    .select("name email permissions roleId teamIds")
    .populate("roleId", "name")
    .populate("teamIds", "name")
    .lean();
  const roles = await Role.find().select("name slug permissions").lean();
  const teams = await Team.find().select("name").lean();

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Assign and manage staff roles, permissions, and teams.
        </p>
      </div>

      <UsersTable
        users={JSON.parse(JSON.stringify(users))}
        currentUserPermissions={currentUserPermissions}
        roles={JSON.parse(JSON.stringify(roles))}
        teams={JSON.parse(JSON.stringify(teams))}
      />
    </div>
  );
}

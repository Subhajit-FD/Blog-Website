import { auth } from "@/auth";
import { getRoles, deleteRole } from "@/actions/role.actions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Shield, Trash2, Edit } from "lucide-react";
import { PERMISSIONS } from "@/lib/config/permissions";

export default async function RolesPage() {
  const session = await auth();
  const isAdmin =
    ((session?.user?.permissions || 0) & PERMISSIONS.ADMINISTRATOR) !== 0;

  if (!isAdmin) {
    return (
      <div className="p-8">
        Access Denied. Only Administrators can manage roles.
      </div>
    );
  }

  const { success, data } = await getRoles();
  const roles = success ? data : [];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Role Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage custom roles and their permissions.
          </p>
        </div>
        <Link href="/dashboard/roles/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        </Link>
      </div>

      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Permissions ID</TableHead>
              <TableHead>System Role?</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role: any) => (
              <TableRow key={role._id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell>
                  <code className="bg-muted px-2 py-1 rounded text-xs">
                    {role.permissions}
                  </code>
                </TableCell>
                <TableCell>
                  {role.isSystem ? (
                    <Badge variant="secondary">System</Badge>
                  ) : (
                    <Badge variant="outline">Custom</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/dashboard/roles/${role._id}`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4 text-slate-500" />
                      </Button>
                    </Link>
                    {!role.isSystem && (
                      <form
                        action={async () => {
                          "use server";
                          await deleteRole(role._id);
                        }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {roles.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-32 text-muted-foreground"
                >
                  No roles found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

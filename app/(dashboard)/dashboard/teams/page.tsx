import { getTeams } from "@/actions/team.actions";
import { auth } from "@/auth";
import { PERMISSIONS } from "@/lib/config/permissions";
import { redirect } from "next/navigation";
import { CreateTeamForm } from "./CreateTeamForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DeleteTeamAction from "@/components/dashboard/DeleteTeamAction";

export default async function TeamsPage() {
  const session = await auth();
  const isAdmin =
    (session?.user?.permissions
      ? session.user.permissions & PERMISSIONS.ADMINISTRATOR
      : 0) !== 0;
  if (!isAdmin) redirect("/dashboard");

  const response = await getTeams();
  const teams = response.success ? response.data : [];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Teams Management</h1>
        <p className="text-muted-foreground">
          Create and manage teams to assign to users.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 border rounded-xl p-6 bg-card shadow-sm h-fit">
          <h2 className="text-xl font-semibold mb-4">Create New Team</h2>
          <CreateTeamForm />
        </div>

        <div className="md:col-span-2 bg-card border rounded-xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Team Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center h-24 text-muted-foreground">
                    No teams found.
                  </TableCell>
                </TableRow>
              ) : (
                teams.map((team: any) => (
                  <TableRow key={team._id}>
                    <TableCell className="font-medium">{team.name}</TableCell>
                    <TableCell className="text-right">
                      <DeleteTeamAction
                        teamId={team._id}
                        teamName={team.name}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

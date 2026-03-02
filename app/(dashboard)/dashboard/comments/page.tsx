import { auth } from "@/auth";
import { PERMISSIONS } from "@/lib/config/permissions";
import { redirect } from "next/navigation";
import { getDashboardComments } from "@/actions/comment.actions";
import CommentsTable from "@/components/dashboard/CommentsTable";

export default async function CommentsPage() {
  const session = await auth();

  const permissions = session?.user?.permissions ?? 0;
  const canAccess =
    (permissions & PERMISSIONS.DELETE_COMMENT) !== 0 ||
    (permissions & PERMISSIONS.ADMINISTRATOR) !== 0;

  if (!canAccess) redirect("/dashboard");

  const response = await getDashboardComments();
  const comments = response.success ? response.data : [];

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Moderation Queue</h1>
        <p className="text-muted-foreground mt-1">
          Manage, edit, and moderate user discussions.
        </p>
      </div>

      <CommentsTable comments={comments} />
    </div>
  );
}

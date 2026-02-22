import { auth } from "@/auth";
import { PERMISSIONS } from "@/lib/config/permissions";
import { redirect } from "next/navigation";
import { getDashboardComments } from "@/actions/comment.actions";

import DeleteCommentAction from "@/components/dashboard/DeleteCommentAction";
import EditCommentAction from "@/components/dashboard/EditCommentAction";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function CommentsPage() {
  const session = await auth();

  // Guard: Must have DELETE_COMMENT or ADMIN bits
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

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[35%]">Comment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>On Post</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comments.map((comment: any) => (
              <TableRow key={comment._id} className="hover:bg-muted/50">
                <TableCell>
                  <p
                    className="text-sm font-medium line-clamp-2"
                    title={comment.content}
                  >
                    {comment.content}
                  </p>
                </TableCell>
                <TableCell>
                  {comment.isApproved !== false ? (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30"
                    >
                      Visible
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-muted text-muted-foreground hover:bg-muted"
                    >
                      Hidden
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm text-foreground">
                      {comment.author?.name || "Unknown"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {comment.author?.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className="text-sm text-muted-foreground block truncate max-w-[150px]"
                    title={comment.post?.title}
                  >
                    {comment.post?.title || "Deleted Post"}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {new Date(comment.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </TableCell>
                <TableCell className="text-right space-x-2 whitespace-nowrap">
                  <EditCommentAction comment={comment} />
                  <DeleteCommentAction commentId={comment._id} />
                </TableCell>
              </TableRow>
            ))}

            {comments.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  The moderation queue is currently empty.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

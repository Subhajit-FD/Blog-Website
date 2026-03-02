"use client";

import { useState } from "react";
import DeleteCommentAction from "@/components/dashboard/DeleteCommentAction";
import EditCommentAction from "@/components/dashboard/EditCommentAction";
import DataPagination from "@/components/dashboard/DataPagination";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const PAGE_SIZE = 20;

interface CommentsTableProps {
  comments: any[];
}

export default function CommentsTable({ comments }: CommentsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(comments.length / PAGE_SIZE);
  const paginatedComments = comments.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
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
          {paginatedComments.map((comment: any) => (
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

          {paginatedComments.length === 0 && (
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
      <DataPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={comments.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

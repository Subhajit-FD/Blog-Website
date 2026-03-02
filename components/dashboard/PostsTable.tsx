"use client";

import { useState } from "react";
import Link from "next/link";
import DeletePostAction from "@/components/dashboard/DeletePostAction";
import DataPagination from "@/components/dashboard/DataPagination";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil } from "lucide-react";

const PAGE_SIZE = 20;

interface PostsTableProps {
  posts: any[];
}

export default function PostsTable({ posts }: PostsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(posts.length / PAGE_SIZE);
  const paginatedPosts = posts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[40%]">Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedPosts?.map((post: any) => (
            <TableRow
              key={post._id}
              className="hover:bg-muted/50 transition-colors"
            >
              <TableCell className="font-medium">
                <p
                  className="truncate max-w-[300px] lg:max-w-[500px]"
                  title={post.title}
                >
                  {post.title}
                </p>
                <p className="text-xs text-muted-foreground font-normal mt-1">
                  /{post.slug}
                </p>
              </TableCell>

              <TableCell>
                <Badge
                  variant={
                    post.status === "PUBLISHED" ? "default" : "secondary"
                  }
                >
                  {post.status}
                </Badge>
              </TableCell>

              <TableCell className="text-muted-foreground">
                {post.category?.title || "Uncategorized"}
              </TableCell>

              <TableCell className="text-muted-foreground">
                {post.author?.name || "Unknown"}
              </TableCell>

              <TableCell className="text-muted-foreground whitespace-nowrap">
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </TableCell>

              <TableCell className="text-right space-x-2">
                <Link href={`/dashboard/posts/${post._id}/edit`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </Link>
                <DeletePostAction postId={post._id} postTitle={post.title} />
              </TableCell>
            </TableRow>
          ))}

          {paginatedPosts?.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-32 text-center text-muted-foreground"
              >
                No posts found. Start writing your first masterpiece!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DataPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={posts.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

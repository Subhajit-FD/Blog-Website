import Link from "next/link";
import { getPosts } from "@/actions/post.actions";
import DeletePostAction from "@/components/dashboard/DeletePostAction";

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
import { Pencil, Plus } from "lucide-react";

export default async function PostsPage() {
  // Fetch posts directly on the server
  const response = await getPosts();
  const posts = response.success ? response.data : [];

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Posts</h1>
          <p className="text-muted-foreground mt-1">
            Manage your content, edit drafts, and publish to the world.
          </p>
        </div>
        <Link href="/dashboard/posts/write">
          <Button>
            <Plus className="w-4 h-4 mr-2" /> Write Post
          </Button>
        </Link>
      </div>

      {/* The Data Table */}
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
            {posts?.map((post: any) => (
              <TableRow
                key={post._id}
                className="hover:bg-muted/50 transition-colors"
              >
                {/* Post Title & Slug */}
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

                {/* Status Badge */}
                <TableCell>
                  <Badge
                    variant={
                      post.status === "PUBLISHED" ? "default" : "secondary"
                    }
                  >
                    {post.status}
                  </Badge>
                </TableCell>

                {/* Category (populated by Mongoose) */}
                <TableCell className="text-muted-foreground">
                  {post.category?.title || "Uncategorized"}
                </TableCell>

                {/* Author (populated by Mongoose) */}
                <TableCell className="text-muted-foreground">
                  {post.author?.name || "Unknown"}
                </TableCell>

                {/* Date Formatting */}
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </TableCell>

                {/* Actions (Edit & Delete) */}
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

                  {/* Our Reusable Client-Side Delete Action */}
                  <DeletePostAction postId={post._id} postTitle={post.title} />
                </TableCell>
              </TableRow>
            ))}

            {posts?.length === 0 && (
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
      </div>
    </div>
  );
}

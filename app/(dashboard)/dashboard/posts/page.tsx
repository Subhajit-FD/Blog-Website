import Link from "next/link";
import { getPosts } from "@/actions/post.actions";
import PostsTable from "@/components/dashboard/PostsTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function PostsPage() {
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

      <PostsTable posts={posts ?? []} />
    </div>
  );
}

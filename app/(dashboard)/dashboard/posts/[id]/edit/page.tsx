import { getCategories } from "@/actions/category.actions";
import { getPostById } from "@/actions/post.actions";
import { getTeams } from "@/actions/team.actions";
import WritePostForm from "@/components/forms/WritePostForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // We fetch categories and the specific post concurrently for speed
  const [categoriesRes, postRes, teamsRes] = await Promise.all([
    getCategories(),
    getPostById(id),
    getTeams(),
  ]);

  const categories = categoriesRes.success ? categoriesRes.data : [];
  const post = postRes.success ? postRes.data : null;
  const teams = teamsRes.success ? teamsRes.data : [];

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <h2 className="text-2xl font-bold">Post Not Found</h2>
        <p className="text-muted-foreground max-w-md">
          The post you are trying to edit does not exist or has been deleted.
        </p>
        <Link href="/dashboard/posts">
          <Button>Back to Posts</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
      {/* Passing initialData forces the form into Edit Mode! */}
      <WritePostForm categories={categories} teams={teams} initialData={post} />
    </div>
  );
}

import { getCategories } from "@/actions/category.actions";
import { getTeams } from "@/actions/team.actions";
import WritePostForm from "@/components/forms/WritePostForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function WritePostPage() {
  // Fetch categories securely on the server
  const [categoriesRes, teamsRes] = await Promise.all([
    getCategories(),
    getTeams(),
  ]);
  const categories = categoriesRes.success ? categoriesRes.data : [];
  const teams = teamsRes.success ? teamsRes.data : [];

  // Edge Case: If they try to write a post before creating any categories
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <h2 className="text-2xl font-bold">
          Hold on! You need a Category first.
        </h2>
        <p className="text-muted-foreground max-w-md">
          Every blog post must belong to a category. Please create at least one
          category before writing a post.
        </p>
        <Link href="/dashboard/categories">
          <Button>Create a Category</Button>
        </Link>
      </div>
    );
  }

  // Normal Render: Pass the categories into our Split-Screen Form
  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
      <WritePostForm categories={categories} teams={teams} />
    </div>
  );
}

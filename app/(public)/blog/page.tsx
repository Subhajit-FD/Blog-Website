import { getPublicPosts } from "@/actions/post.actions";
import { getUserBookmarks } from "@/actions/bookmark.actions";
import { auth } from "@/auth";
import PostCard from "@/components/blog/PostCard";

export default async function PublicBlogFeed() {
  const session = await auth();

  // Fetch posts and user bookmarks in parallel — no sequential waterfall
  const [postsRes, userBookmarks] = await Promise.all([
    getPublicPosts(),
    getUserBookmarks(),
  ]);

  const posts = postsRes.success ? postsRes.data : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">
          Latest Articles
        </h1>
        <p className="text-lg text-secondary">
          Insights, tutorials, and stories from our expert team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post: any) => (
          <PostCard
            key={post._id}
            post={post}
            variant="grid"
            isBookmarked={userBookmarks.includes(post._id)}
            userId={session?.user?.id}
          />
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-24 text-slate-500 border-2 border-dashed rounded-2xl">
          No articles have been published yet. Check back soon!
        </div>
      )}
    </div>
  );
}

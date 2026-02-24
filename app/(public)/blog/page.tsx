import Image from "next/image";
import Link from "next/link";
import { getPublicPosts } from "@/actions/post.actions";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/models/User";
import BookmarkButton from "@/components/public/BookmarkButton";
import { Badge } from "@/components/ui/badge";

export default async function PublicBlogFeed() {
  const session = await auth();
  let userBookmarks: string[] = [];

  // If the user is logged in, fetch their bookmarks to highlight the buttons
  if (session?.user?.email) {
    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email })
      .select("bookmarks")
      .lean();
    if (user?.bookmarks) {
      userBookmarks = user.bookmarks.map((id: any) => id.toString());
    }
  }

  const response = await getPublicPosts();
  const posts = response.success ? response.data : [];

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
        {posts.map((post: any) => {
          const isBookmarked = userBookmarks.includes(post._id);

          return (
            <div
              key={post._id}
              className="group relative flex flex-col bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {/* Cover Image */}
              <Link
                href={`/blog/${post.slug}`}
                className="relative h-48 w-full overflow-hidden bg-slate-100 block"
              >
                {post.coverImage && (
                  <Image
                    src={post.coverImage}
                    alt={post.coverImageAlt || post.title}
                    fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                {post.category && (
                  <Badge className="absolute top-4 left-4 z-10 bg-white/90 text-slate-900 hover:bg-white">
                    {post.category.title}
                  </Badge>
                )}
              </Link>

              <div className="p-6 flex flex-col flex-1">
                <Link href={`/blog/${post.slug}`} className="flex-1">
                  <h2 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-slate-600 line-clamp-3 text-sm mb-4">
                    {post.description}
                  </p>
                </Link>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden relative flex items-center justify-center text-slate-600 font-bold text-sm">
                      {post.author?.image && !post.teamId ? (
                        <Image
                          src={post.author.image}
                          alt={post.author.name}
                          fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                        />
                      ) : (
                        (post.teamId?.name || post.author?.name)?.charAt(0) ||
                        "U"
                      )}
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-slate-900">
                        {post.teamId?.name || post.author?.name}
                      </p>
                      <p className="text-slate-500 text-xs">
                        {new Date(post.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* The Interactive Bookmark Component */}
                  <BookmarkButton
                    postId={post._id}
                    initialIsBookmarked={isBookmarked}
                    userId={session?.user?.id}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-24 text-slate-500 border-2 border-dashed rounded-2xl">
          No articles have been published yet. Check back soon!
        </div>
      )}
    </div>
  );
}

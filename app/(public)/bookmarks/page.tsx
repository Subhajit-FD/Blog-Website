import { getBookmarkedPosts } from "@/actions/bookmark.actions";
import { getTrendingPosts } from "@/actions/post.actions";
import TrendingSidebar from "@/components/home/TrendingSidebar";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bookmark, Calendar, FileText, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  const [bookmarksRes, trendingRes] = await Promise.all([
    getBookmarkedPosts(),
    getTrendingPosts(),
  ]);

  if (bookmarksRes.error === "You must be logged in to view bookmarks.") {
    // Create a login page redirect or show a message
    // For now, let's just show a message or redirect to home/login
    // redirect("/login");
  }

  const bookmarks = bookmarksRes.success ? bookmarksRes.data : [];
  const trendingPosts = trendingRes.success ? trendingRes.data : [];

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* LEFT SIDE: Bookmarked Posts */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-10">
          <div className="flex flex-col gap-2 border-b pb-4">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Bookmark className="h-8 w-8 text-primary" />
              My Bookmarks
            </h1>
            <p className="text-muted-foreground">
              Posts you have saved for later reading.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {bookmarks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                {bookmarks.map((post: any) => (
                  <Link
                    key={post._id}
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col gap-3 h-full"
                  >
                    <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
                          <FileText className="h-8 w-8" />
                        </div>
                      )}

                      <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm p-1.5 rounded-full text-primary shadow-sm">
                        <Bookmark className="h-4 w-4 fill-current" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 flex-1">
                      {post.category && (
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">
                          {post.category.title}
                        </span>
                      )}
                      <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto pt-2">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {post.author?.name || "Admin"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.createdAt).toLocaleDateString(
                            undefined,
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-4 border-2 border-dashed rounded-lg">
                <div className="p-4 rounded-full bg-muted">
                  <Bookmark className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="max-w-md space-y-2">
                  <h3 className="text-xl font-semibold">No bookmarks yet</h3>
                  <p className="text-muted-foreground">
                    You haven't saved any posts yet. Browse our articles and
                    click the bookmark icon to save them here.
                  </p>
                </div>
                <Button asChild variant="outline">
                  <Link href="/category/all">Browse Articles</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: Trending Posts Sticky Sidebar */}
        <div className="col-span-1 relative">
          <div className="sticky top-24 border-l pl-8">
            <TrendingSidebar trendingPosts={trendingPosts} />
          </div>
        </div>
      </div>
    </div>
  );
}

import { getCategories } from "@/actions/category.actions";
import { getTrendingPosts, getPostsByCategory } from "@/actions/post.actions";
import TrendingSidebar from "@/components/home/TrendingSidebar";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Calendar, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CategoryAllPage() {
  const [categoriesRes, trendingRes] = await Promise.all([
    getCategories(),
    getTrendingPosts(),
  ]);

  const categories = categoriesRes.success ? categoriesRes.data : [];
  const trendingPosts = trendingRes.success ? trendingRes.data : [];

  // Fetch posts for each category
  const categoriesWithPosts = await Promise.all(
    categories.map(async (category: any) => {
      const postsRes = await getPostsByCategory(category._id);
      return {
        ...category,
        posts: postsRes.success ? postsRes.data.slice(0, 3) : [], // Get top 3 posts
      };
    }),
  );

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* LEFT SIDE: All Categories */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-16">
          <div className="flex flex-col gap-2 border-b pb-4">
            <h1 className="text-3xl font-bold tracking-tight">
              All Categories
            </h1>
            <p className="text-muted-foreground">
              Browse all our topics and find what interests you.
            </p>
          </div>

          <div className="flex flex-col gap-16">
            {categoriesWithPosts.length > 0 ? (
              categoriesWithPosts.map((category: any) => (
                <div key={category._id} className="flex flex-col gap-6">
                  <div className="flex items-center justify-between border-b pb-2 border-primary/20">
                    <span className="bg-primary text-primary-foreground px-3 py-1 text-sm font-bold uppercase tracking-wider">
                      {category.title}
                    </span>
                    <Link
                      href={`/category/${category.slug}`}
                      className="text-xs font-semibold text-muted-foreground hover:text-primary flex items-center gap-1"
                    >
                      View All <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>

                  {category.posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {category.posts.map((post: any) => (
                        <Link
                          key={post._id}
                          href={`/blog/${post.slug}`}
                          className="group flex flex-col gap-3"
                        >
                          <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                            {post.coverImage ? (
                              <Image
                                src={post.coverImage}
                                alt={post.title}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
                                <FileText className="h-8 w-8" />
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            <h3 className="font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                              {post.title}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
                    <div className="text-sm text-muted-foreground italic">
                      No posts available in this category yet.
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div>No categories found.</div>
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

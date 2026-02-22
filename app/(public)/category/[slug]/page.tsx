import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getCategoryBySlug } from "@/actions/category.actions";
import { getPostsByCategory } from "@/actions/post.actions";
import { Metadata } from "next";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categoryRes = await getCategoryBySlug(slug);

  if (!categoryRes.success || !categoryRes.data) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: `${categoryRes.data.title} - Blog`,
    description: `Browse all posts in ${categoryRes.data.title}`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  // Fetch category
  const categoryRes = await getCategoryBySlug(slug);

  if (!categoryRes.success || !categoryRes.data) {
    notFound();
  }

  const category = categoryRes.data;

  // Fetch posts for this category
  const postsRes = await getPostsByCategory(category._id);
  const posts = postsRes.success ? postsRes.data : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative w-full h-[20vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
        {category.coverImage ? (
          <Image
            src={category.coverImage}
            alt={category.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-muted" />
        )}
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 container px-4 md:px-8 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold capitalize mb-1 tracking-tight text-shadow-lg">
            {category.title}
          </h1>
          <p className="text-xs md:text-sm text-gray-200 max-w-2xl mx-auto leading-relaxed">
            {category.description || `Browse all posts in ${category.title}`}
          </p>
        </div>
      </section>

      {/* Posts Section */}
      <div className="container py-16 px-4 md:px-8">
        <div className="flex items-center gap-4 mb-10">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
            Browse and read the latest stuff
          </span>
        </div>
        <h2 className="text-3xl font-bold mb-12 font-serif text-foreground">
          Latest Stories
        </h2>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {posts.map((post: any) => (
              <Link
                key={post._id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col gap-4"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-muted">
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground line-clamp-2 text-sm">
                    {post.description || post.shortDescription}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 tracking-wide font-medium">
                    <span>
                      {new Date(post.createdAt).toLocaleDateString(undefined, {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/30 rounded-lg">
            <h3 className="text-xl font-semibold">No posts found</h3>
            <p className="text-muted-foreground mt-2">
              This category doesn't have any posts yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

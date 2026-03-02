import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPostsByTag } from "@/actions/post.actions";
import { Metadata } from "next";
import { formatDate } from "@/lib/utils/date";
import { Tag } from "lucide-react";

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = decodeURIComponent(slug);

  return {
    title: `Posts tagged: "${tag}"`,
    description: `Browse all articles tagged with "${tag}".`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const tag = decodeURIComponent(slug);

  const postsRes = await getPostsByTag(tag);

  if (!postsRes.success) {
    notFound();
  }

  const posts = postsRes.data ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner */}
      <section className="border-b bg-muted/30">
        <div className="container px-4 md:px-8 py-14 flex flex-col items-center text-center gap-3">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold">
            <Tag className="w-4 h-4" />
            Tag
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            {tag}
          </h1>
          <p className="text-muted-foreground max-w-md">
            {posts.length > 0
              ? `${posts.length} article${posts.length !== 1 ? "s" : ""} tagged with &quot;${tag}&quot;`
              : `No articles found for &quot;${tag}&quot;`}
          </p>
        </div>
      </section>

      {/* Posts Grid */}
      <div className="container py-16 px-4 md:px-8">
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {posts.map((post: any) => (
              <Link
                key={post._id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col gap-4"
              >
                <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage}
                      alt={post.coverImageAlt || post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {post.category && (
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">
                      {post.category.title}
                    </span>
                  )}
                  <h2 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground line-clamp-2 text-sm">
                    {post.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 font-medium">
                    {post.author?.name && <span>{post.author.name}</span>}
                    {post.author?.name && <span>·</span>}
                    <span>
                      {formatDate(post.createdAt, {
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
          <div className="text-center py-24 bg-muted/30 rounded-2xl">
            <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold">No posts found</h3>
            <p className="text-muted-foreground mt-2">
              No articles have been tagged with &quot;{tag}&quot; yet.
            </p>
            <Link
              href="/blog"
              className="inline-block mt-6 text-sm text-primary hover:underline underline-offset-4"
            >
              Browse all articles →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

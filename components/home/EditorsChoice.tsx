import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { FileText, MessageCircle } from "lucide-react"; // Import simpler icons if needed

interface EditorsChoiceProps {
  posts: any[];
}

export default function EditorsChoice({ posts }: EditorsChoiceProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="py-12 border-t border-border">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <h2 className="text-3xl font-bold tracking-tight whitespace-nowrap">
          Editor&apos;s Choice ⭐
        </h2>
        <div className="flex items-center justify-between w-full md:w-fit">
          <span className="text-muted-foreground text-sm whitespace-nowrap mr-3 uppercase">
            Curated just for you
          </span>
          <hr className="w-full border-border bg-accent md:hidden" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {posts.map((post) => (
          <Link
            key={post._id}
            href={`/blog/${post.slug}`}
            className="group flex flex-col gap-3"
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
                <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
                  <FileText className="h-8 w-8" />
                </div>
              )}
              {/* Optional: Add video icon overlay if it's a video post, based on user image example */}
            </div>

            <div className="flex flex-col gap-1">
              {post.category && (
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {post.category.title}
                </span>
              )}
              <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h3>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                <span>
                  {new Date(post.createdAt).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                {/* Placeholder for comment count if available */}
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" /> 0
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

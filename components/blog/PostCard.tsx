import Link from "next/link";
import Image from "next/image";
import { FileText, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/date";
import BookmarkButton from "@/components/public/BookmarkButton";

export interface PostCardProps {
  post: any;
  /**
   * grid        — full card used in /blog feed (image + meta + bookmark)
   * compact     — small card used in Editor's Choice grid
   * horizontal  — wide card used in CategoryFeature random posts list
   */
  variant?: "grid" | "compact" | "horizontal";
  /** Whether this post is already bookmarked by the current user */
  isBookmarked?: boolean;
  /** Current user's ID, used by BookmarkButton (grid variant only) */
  userId?: string;
}

export default function PostCard({
  post,
  variant = "grid",
  isBookmarked = false,
  userId,
}: PostCardProps) {
  if (!post) return null;

  /* ------------------------------------------------------------------ */
  /* GRID — full card used in /blog feed                                  */
  /* ------------------------------------------------------------------ */
  if (variant === "grid") {
    return (
      <div className="group relative flex flex-col bg-white dark:bg-zinc-900 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
        {/* Cover Image */}
        <Link
          href={`/blog/${post.slug}`}
          className="relative h-48 w-full overflow-hidden bg-slate-100 block"
          aria-label={post.title}
        >
          {post.coverImage && (
            <Image
              src={post.coverImage}
              alt={post.coverImageAlt || post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {post.title}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 line-clamp-3 text-sm mb-4">
              {post.description}
            </p>
          </Link>

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden relative flex items-center justify-center text-slate-600 font-bold text-sm">
                {post.author?.image && !post.teamId ? (
                  <Image
                    src={post.author.image}
                    alt={post.author?.name || "Anonymous"}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                ) : (
                  (post.teamId?.name || post.author?.name)
                    ?.charAt(0)
                    ?.toUpperCase() || "A"
                )}
              </div>
              <div className="text-sm">
                <p className="font-medium text-slate-900 dark:text-white">
                  {post.teamId?.name || post.author?.name || "Anonymous"}
                </p>
                <p className="text-slate-500 text-xs">
                  {formatDate(post.createdAt, {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <BookmarkButton
              postId={post._id}
              initialIsBookmarked={isBookmarked}
              userId={userId}
            />
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* COMPACT — small card used in Editor's Choice                         */
  /* ------------------------------------------------------------------ */
  if (variant === "compact") {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group flex flex-col gap-3"
        aria-label={post.title}
      >
        <div className="relative aspect-4/3 overflow-hidden bg-muted">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
              <FileText className="h-8 w-8" />
            </div>
          )}
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
            <span>{formatDate(post.createdAt)}</span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {post.comments?.length ?? 0}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  /* ------------------------------------------------------------------ */
  /* HORIZONTAL — wide card used in CategoryFeature random posts list     */
  /* ------------------------------------------------------------------ */
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid grid-cols-1 md:grid-cols-12 gap-6 items-start"
      aria-label={post.title}
    >
      {/* Date Column */}
      <div className="md:col-span-2 flex flex-col items-start border-t-2 pt-2">
        <span className="text-4xl font-serif">
          {new Date(post.createdAt).getDate()}
        </span>
        <span className="text-xs uppercase text-muted-foreground mt-1">
          {formatDate(post.createdAt, { month: "short", year: "numeric" })}
        </span>
      </div>

      {/* Image Column */}
      <div className="md:col-span-4 relative aspect-4/3 w-full overflow-hidden bg-muted">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
            <FileText className="h-8 w-8" />
          </div>
        )}
      </div>

      {/* Content Column */}
      <div className="md:col-span-6 flex flex-col gap-3">
        {post.category && (
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {post.category.title}
          </span>
        )}
        <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-3">
          {post.description}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          {(post.teamId?.name || post.author?.name) && (
            <span className="font-semibold text-foreground capitalize">
              By {post.teamId?.name || post.author?.name || "Anonymous"}
            </span>
          )}
          <span>•</span>
          <span className="flex items-center gap-1">
            💬 {post.likes?.length ?? 0}
          </span>
        </div>
        <div className="mt-2">
          <span className="text-2xl group-hover:translate-x-2 transition-transform inline-block">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

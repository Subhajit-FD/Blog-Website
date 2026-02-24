"use client";

import Link from "next/link";
import Image from "next/image";
import { FileText } from "lucide-react";
import { formatDate } from "@/lib/utils/date";

interface TrendingSidebarProps {
  trendingPosts: any[];
}

export default function TrendingSidebar({
  trendingPosts,
}: TrendingSidebarProps) {
  return (
    <div className="sticky top-24 border-2 p-2">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="text-xl font-bold">Trending Posts 🔥</h3>
        <span className="text-xs text-primary tracking-widest uppercase">
          Popular
        </span>
      </div>
      <div className="border-b py-2 mb-6 flex items-center justify-center gap-2">
        <span>x</span>
        <span>x</span>
        <span>x</span>
      </div>

      <div className="flex flex-col gap-6">
        {trendingPosts.map((post) => (
          <Link
            key={post._id}
            href={`/blog/${post.slug}`}
            className="group flex gap-4 items-start"
          >
            <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-muted">
              {post.coverImage ? (
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
                  <FileText className="h-4 w-4" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="text-sm font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h4>
              <span className="text-xs text-muted-foreground">
                {formatDate(post.createdAt)}
              </span>
              <p className="text-xs text-muted-foreground">
                By {post.teamId?.name || post.author?.name}
              </p>
            </div>
          </Link>
        ))}
        {trendingPosts.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No trending posts yet.
          </div>
        )}
      </div>
    </div>
  );
}

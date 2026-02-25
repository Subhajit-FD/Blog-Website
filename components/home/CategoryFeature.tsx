"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import TrendingSidebar from "./TrendingSidebar";
import PostCard from "@/components/blog/PostCard";
import { formatDate } from "@/lib/utils/date";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface CategoryFeatureProps {
  categoryPost: any;
  trendingPosts: any[];
  randomPosts: any[];
}

const POSTS_PER_PAGE = 3;

export default function CategoryFeature({
  categoryPost,
  trendingPosts,
  randomPosts = [],
}: CategoryFeatureProps) {
  const [currentPage, setCurrentPage] = useState(1);

  if (!categoryPost && (!trendingPosts || trendingPosts.length === 0))
    return null;

  // Pagination Logic
  const totalPages = Math.ceil(randomPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const currentRandomPosts = randomPosts.slice(
    startIndex,
    startIndex + POSTS_PER_PAGE,
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <section className="py-12 border-t border-border">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* LEFT SIDE: Category Highlight */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-16">
          {/* 1. Category Highlight */}
          {categoryPost ? (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-start md:flex-row md:items-center justify-between border-b pb-4 mb-4">
                <h2 className="text-3xl font-bold tracking-tight">
                  {categoryPost.category
                    ? categoryPost.category.title
                    : "Featured"}
                </h2>
                <span className="text-muted-foreground text-sm uppercase">
                  Don&apos;t miss
                </span>
              </div>

              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                {categoryPost.coverImage && (
                  <Image
                    src={categoryPost.coverImage}
                    alt={categoryPost.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                )}
              </div>

              <div className="flex flex-col gap-4">
                {categoryPost.category && (
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {categoryPost.category.title}
                  </span>
                )}
                <h3 className="text-lg md:text-2xl font-bold leading-tight">
                  {categoryPost.title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-3">
                  {categoryPost.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground capitalize">
                    By{" "}
                    {categoryPost.teamId?.name ||
                      categoryPost.author?.name ||
                      "Anonymous"}
                  </span>
                  <span>•</span>
                  <span>{formatDate(categoryPost.createdAt)}</span>
                </div>
                <div className="pt-2">
                  <Link href={`/blog/${categoryPost.slug}`}>
                    <Button
                      variant="outline"
                      className="px-2 h-auto font-bold text-base hover:no-underline group"
                    >
                      Read More
                      <span className="sr-only">
                        {" "}
                        about {categoryPost.title}
                      </span>{" "}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground bg-muted rounded-xl">
              No category posts available.
            </div>
          )}

          {/* 2. Random Posts Section */}
          {randomPosts.length > 0 && (
            <div className="flex flex-col gap-8 border-t pt-12">
              <div className="flex flex-col gap-12">
                {currentRandomPosts.map((post) => (
                  <PostCard key={post._id} post={post} variant="horizontal" />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(currentPage - 1);
                        }}
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }).map((_, index) => (
                      <PaginationItem key={index}>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === index + 1}
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(index + 1);
                          }}
                          className="cursor-pointer"
                        >
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(currentPage + 1);
                        }}
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </div>

        {/* RIGHT SIDE: Trending Posts Sticky Sidebar */}
        <div className="col-span-1">
          <TrendingSidebar trendingPosts={trendingPosts} />
        </div>
      </div>
    </section>
  );
}

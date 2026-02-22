"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback } from "react";

interface NavDropdownProps {
  categories: any[];
  posts: any[];
  onEnter?: () => void;
  onLeave?: () => void;
}

export default function NavDropdown({
  categories,
  posts,
  onEnter,
  onLeave,
}: NavDropdownProps) {
  // Posts to show in the carousel (limit to 8 for example, or all if available)
  const carouselPosts = posts.slice(0, 8);

  // Embla Carousel Hook
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-4xl z-50"
    >
      <div className="bg-background rounded-md shadow-lg border border-border p-4">
        {/* Top Section: Categories & Arrows */}
        <div className="top-navigation-dropdown flex items-center justify-between px-4 py-2 border-b border-border pb-4 mb-4">
          <div className="category-lists">
            <ul className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
              <li>
                <Link
                  href="/category/all"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  All
                </Link>
              </li>
              {categories.slice(0, 5).map((category) => (
                <li key={category._id}>
                  <Link
                    href={`/category/${category.slug}`}
                    className="hover:text-foreground transition-colors capitalize"
                  >
                    {category.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Slider Controls */}
          <div className="icons flex items-center gap-2">
            <button
              onClick={scrollPrev}
              className="p-1 rounded-full hover:bg-muted transition-colors border border-transparent hover:border-border"
              aria-label="Previous Slide"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={scrollNext}
              className="p-1 rounded-full hover:bg-muted transition-colors border border-transparent hover:border-border"
              aria-label="Next Slide"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel Section */}
        <div className="posts px-4 py-2 overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y gap-4">
            {carouselPosts.length > 0 ? (
              carouselPosts.map((post) => (
                <div key={post._id} className="flex-[0_0_25%] min-w-0">
                  <div className="w-full">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="group flex flex-col gap-2"
                    >
                      <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
                        {post.coverImage ? (
                          <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-xs leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4 text-sm w-full">
                No featured posts available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

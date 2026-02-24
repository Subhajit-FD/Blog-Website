"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search as SearchIcon, Loader2, FileText, X } from "lucide-react";
import { useDebounce } from "use-debounce";
import { searchPosts } from "@/actions/post.actions";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Search({ className }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!debouncedQuery) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setLoading(true);
      setShowResults(true);
      const res = await searchPosts(debouncedQuery);
      if (res.success) {
        setResults(res.data);
      } else {
        setResults([]);
      }
      setLoading(false);
    };

    fetchPosts();
  }, [debouncedQuery]);

  const handleSelect = (slug: string) => {
    setShowResults(false);
    setQuery("");
    router.push(`/blog/${slug}`);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full max-w-sm", className)}
    >
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search posts..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.length > 0) setShowResults(true);
          }}
          className="pl-9 pr-8"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showResults && query.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-2 bg-background border border-border rounded-md shadow-lg z-50 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : results.length > 0 ? (
            <ul className="max-h-[300px] overflow-y-auto py-1">
              {results.map((post) => (
                <li key={post._id}>
                  <button
                    onClick={() => handleSelect(post.slug)}
                    className="w-full text-left flex items-start gap-3 px-3 py-2 hover:bg-muted transition-colors"
                  >
                    <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded bg-muted">
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
                          <FileText className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium line-clamp-1">
                        {post.title}
                      </p>
                      {post.category && (
                        <p className="text-xs text-muted-foreground">
                          {post.category.title}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

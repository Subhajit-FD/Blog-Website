"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { useDebounce } from "use-debounce";
import { globalSearch } from "@/actions/search.actions";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

export default function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const [data, setData] = React.useState<{
    posts: any[];
    categories: any[];
    users: any[];
  } | null>(null);
  const [isPending, startTransition] = React.useTransition();

  // Toggle with Cmd+K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Fetch results when query changes
  React.useEffect(() => {
    if (debouncedQuery.length < 2) {
      setData(null);
      return;
    }

    startTransition(async () => {
      const results = await globalSearch(debouncedQuery);
      setData(results);
    });
  }, [debouncedQuery]);

  const handleSelect = (id: string, type: string) => {
    setOpen(false);
    if (type === "post") router.push(`/dashboard/posts/${id}/edit`);
    else if (type === "category")
      router.push(`/category/${id}`); // Adjust route as needed
    else if (type === "user") router.push(`/dashboard/users`); // Or specific user profile
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search...</span>
        <span className="inline-flex lg:hidden">Search</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Type to search..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {isPending ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              "No results found."
            )}
          </CommandEmpty>

          {!isPending && data && (
            <>
              {data.posts.length > 0 && (
                <CommandGroup heading="Posts">
                  {data.posts.map((post) => (
                    <CommandItem
                      key={post._id}
                      value={`post-${post.title}`}
                      onSelect={() => handleSelect(post._id, "post")}
                    >
                      <span>{post.title}</span>
                      <span className="ml-2 text-xs text-muted-foreground truncate">
                        /{post.slug}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {data.categories.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading="Categories">
                    {data.categories.map((cat) => (
                      <CommandItem
                        key={cat._id}
                        value={`cat-${cat.title}`}
                        onSelect={() => handleSelect(cat.slug, "category")}
                      >
                        {cat.title}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}

              {data.users.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup heading="Users">
                    {data.users.map((user) => (
                      <CommandItem
                        key={user._id}
                        value={`user-${user.name}`}
                        onSelect={() => handleSelect(user._id, "user")}
                      >
                        {user.name}{" "}
                        <span className="text-xs text-muted-foreground ml-1">
                          ({user.email})
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

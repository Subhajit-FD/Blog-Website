"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { globalSearch } from "@/actions/search.actions";

export default function SearchBar() {
  return (
    <div className="relative w-full max-w-sm ml-4">
      <Input
        placeholder="Search posts or categories..."
        className="h-9 pl-9 bg-muted/50 border-none focus-visible:ring-primary"
        onChange={async (e) => {
          if (e.target.value.length > 2) {
            const results = await globalSearch(e.target.value);
            // Later: Render these in a floating Command Palette
          }
        }}
      />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
    </div>
  );
}

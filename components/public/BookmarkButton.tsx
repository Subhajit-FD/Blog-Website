"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { toggleBookmark } from "@/actions/bookmark.actions";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";

interface BookmarkButtonProps {
  postId: string;
  initialIsBookmarked: boolean;
  userId?: string; // Optional: If undefined, the user is not logged in
}

export default function BookmarkButton({
  postId,
  initialIsBookmarked,
  userId,
}: BookmarkButtonProps) {
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname(); // We pass this to revalidatePath

  const handleToggle = () => {
    if (!userId) {
      toast.error("Please log in to save articles.");
      return;
    }

    startTransition(async () => {
      const res = await toggleBookmark(postId, pathname);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={isPending}
      className={`rounded-full transition-all ${initialIsBookmarked ? "text-primary hover:text-primary/80 bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
      title={initialIsBookmarked ? "Remove Bookmark" : "Save for later"}
    >
      <Bookmark
        className={`w-5 h-5 ${initialIsBookmarked ? "fill-current" : ""}`}
      />
    </Button>
  );
}

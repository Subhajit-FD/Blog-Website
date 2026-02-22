"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { toggleLike } from "@/actions/engagement.actions";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  postId: string;
  initialLikes: number;
  initialIsLiked: boolean;
  userId?: string;
}

export default function LikeButton({
  postId,
  initialLikes,
  initialIsLiked,
  userId,
}: LikeButtonProps) {
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  // Optimistic State
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikes);

  const handleToggle = () => {
    if (!userId) {
      toast.error("Please log in to like this post.");
      return;
    }

    // 1. Instantly update the UI before the server even responds
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

    // 2. Perform the actual database mutation in the background
    startTransition(async () => {
      const res = await toggleLike(postId, pathname);

      if (res.error) {
        // 3. If the server fails, revert the UI back to reality and alert the user
        setIsLiked(isLiked);
        setLikesCount(likesCount);
        toast.error(res.error);
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
      className={`flex items-center gap-2 transition-colors rounded-full px-4 ${
        isLiked
          ? "text-primary hover:text-primary/80 bg-primary/10"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      }`}
    >
      <Heart
        className={`w-4 h-4 transition-transform ${isLiked ? "fill-current scale-110" : "scale-100"}`}
      />
      <span className="font-medium">{likesCount}</span>
    </Button>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { incrementView } from "@/actions/engagement.actions";

export default function ViewTracker({ postId }: { postId: string }) {
  // useRef prevents the effect from firing twice in React 18 Strict Mode development
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    
    const viewedKey = `viewed_${postId}`;
    
    // Check if they have already viewed this post during this browser session
    if (!sessionStorage.getItem(viewedKey)) {
      incrementView(postId);
      sessionStorage.setItem(viewedKey, "true");
    }
    
    hasFired.current = true;
  }, [postId]);

  return null; // This component renders absolutely nothing to the UI!
}
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import Image from "next/image";
import { Send, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createComment, getPostComments } from "@/actions/comment.actions";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils/date";

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const fetchComments = useCallback(async () => {
    setIsFetching(true);
    const res = await getPostComments(postId);
    if (res.success) {
      setComments(res.data);
    }
    setIsFetching(false);
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("Login Required", {
        description: "Please login to post a comment.",
      });
      return;
    }

    if (!newComment.trim()) return;

    setIsLoading(true);
    const res = await createComment(postId, newComment);

    if (res.success) {
      toast.success("Success", {
        description: "Comment posted successfully!",
      });
      setNewComment("");
      fetchComments(); // Refresh comments
    } else {
      toast.error("Error", {
        description: res.error || "Failed to post comment.",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto mt-16 pt-10 border-t">
      <h3 className="text-2xl font-bold mb-8">Comments ({comments.length})</h3>

      {/* Comment Form */}
      <div className="mb-12 bg-muted/30 p-6 rounded-xl">
        {session ? (
          <form onSubmit={handleSubmit} className="flex gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={session.user?.image || ""}
                alt={session.user?.name || ""}
              />
              <AvatarFallback>{session.user?.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 gap-2 flex flex-col">
              <Textarea
                placeholder="Share your thoughts..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px] bg-background resize-y"
              />
              <div className="flex justify-end mt-2">
                <Button
                  type="submit"
                  disabled={isLoading || !newComment.trim()}
                >
                  {isLoading ? (
                    "Posting..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" /> Post Comment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
            <Lock className="w-8 h-8 text-muted-foreground" />
            <div className="space-y-1">
              <p className="font-semibold">Log in to join the conversation</p>
              <p className="text-sm text-muted-foreground">
                Join our community to leave comments, like posts, and bookmark
                articles.
              </p>
            </div>
            <Button
              onClick={() => signIn()}
              variant="secondary"
              className="mt-2"
            >
              Log In / Sign Up
            </Button>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-8">
        {isFetching ? (
          <div className="text-center text-muted-foreground py-8">
            Loading comments...
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-4 group">
              <Avatar className="h-10 w-10 border">
                <AvatarImage
                  src={comment.author?.image}
                  alt={comment.author?.name}
                />
                <AvatarFallback>
                  {comment.author?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">
                      {comment.author?.name || "Unknown User"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-8 italic">
            No comments yet. Be the first to share your thoughts!
          </div>
        )}
      </div>
    </div>
  );
}

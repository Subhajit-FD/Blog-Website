"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateComment } from "@/actions/comment.actions";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export default function EditCommentAction({ comment }: { comment: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState(comment.content);
  const [isApproved, setIsApproved] = useState(comment.isApproved ?? true);
  const [isPending, startTransition] = useTransition();

  const handleUpdate = () => {
    if (!content.trim()) return toast.error("Comment cannot be empty.");

    startTransition(async () => {
      const res = await updateComment(comment._id, content, isApproved);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        setIsOpen(false);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-primary hover:bg-primary/10"
        >
          <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Comment</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Comment Content</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isPending}
              className="resize-none h-32"
            />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="space-y-0.5">
              <Label>Public Visibility</Label>
              <p className="text-xs text-muted-foreground">
                Turn this off to hide the comment without deleting it.
              </p>
            </div>
            <Switch
              checked={isApproved}
              onCheckedChange={setIsApproved}
              disabled={isPending}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

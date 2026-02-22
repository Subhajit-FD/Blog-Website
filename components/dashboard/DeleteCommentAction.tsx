"use client";

import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { deleteComment } from "@/actions/comment.actions";
import DeleteDialog from "@/components/shared/DeleteDialog";
import { Button } from "@/components/ui/button";

export default function DeleteCommentAction({
  commentId,
}: {
  commentId: string;
}) {
  const handleDelete = async () => {
    const res = await deleteComment(commentId);
    if (res.error) toast.error(res.error);
    else toast.success(res.message);
  };

  return (
    <DeleteDialog
      title="this comment"
      expectedText="delete" // Simple verification text for quick comment deletion
      onConfirm={handleDelete}
      trigger={
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      }
    />
  );
}

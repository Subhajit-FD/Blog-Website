"use client";

import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { deletePost } from "@/actions/post.actions";
import DeleteDialog from "@/components/shared/DeleteDialog";
import { Button } from "@/components/ui/button";

export default function DeletePostAction({ postId, postTitle }: { postId: string, postTitle: string }) {
  
  const handleDelete = async () => {
    const res = await deletePost(postId);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.message);
      // Notice we don't need to manually refetch data! 
      // Our Server Action calls `revalidatePath`, which tells Next.js to auto-refresh the Server Component table.
    }
  };

  return (
    <DeleteDialog 
      title={postTitle}
      expectedText={postTitle}
      onConfirm={handleDelete}
      trigger={
        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
          <Trash2 className="w-4 h-4" />
        </Button>
      }
    />
  );
}
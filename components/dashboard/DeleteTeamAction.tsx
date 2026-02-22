"use client";

import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { deleteTeam } from "@/actions/team.actions";
import DeleteDialog from "@/components/shared/DeleteDialog";
import { Button } from "@/components/ui/button";

export default function DeleteTeamAction({
  teamId,
  teamName,
}: {
  teamId: string;
  teamName: string;
}) {
  const handleDelete = async () => {
    const res = await deleteTeam(teamId);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.message);
    }
  };

  return (
    <DeleteDialog
      title={`Delete ${teamName}?`}
      expectedText={teamName}
      onConfirm={handleDelete}
      trigger={
        <Button
          variant="ghost"
          size="icon"
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      }
    />
  );
}

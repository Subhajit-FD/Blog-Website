"use client";

import { useTransition } from "react";
import {
  deleteNote,
  toggleNoteCompletion,
  addNote,
} from "@/actions/note.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Trash2, CheckCircle, Circle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function MemoBoard({
  notes,
  currentUser,
}: {
  notes: any[];
  currentUser: any;
}) {
  const [isPending, startTransition] = useTransition();

  const handleAddNote = async (formData: FormData) => {
    const result = await addNote(formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Memo posted!");
      // Reset form logic if needed, or rely on key change reset
    }
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteNote(id);
      if (res.error) toast.error(res.error);
      else toast.success("Memo deleted.");
    });
  };

  const handleToggle = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      const res = await toggleNoteCompletion(id, !currentStatus);
      if (res.error) toast.error(res.error);
    });
  };

  return (
    <div className="bg-card border rounded-xl shadow-sm p-4 md:p-6 flex flex-col h-[500px]">
      <div className="flex items-center gap-2 mb-4 text-amber-600 dark:text-amber-500">
        <Clock className="w-5 h-5" />
        <h2 className="text-lg font-bold text-foreground">
          24-Hour Memo Board
        </h2>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Notes posted here will automatically self-destruct after 24 hours. Use
        this for daily handoffs or temporary reminders.
      </p>

      <ScrollArea className="flex-1 pr-4 mb-4">
        <div className="space-y-3">
          {notes.map((note) => {
            const isAuthor = currentUser?.id === note.author?._id?.toString();
            // Assuming permission check happens on server, but UI can hint
            const canDelete = isAuthor || currentUser?.permissions >= 4096; // Simple check, better to pass prop

            return (
              <div
                key={note._id.toString()}
                className={cn(
                  "relative group p-3 border rounded-lg text-sm transition-all",
                  note.isCompleted
                    ? "bg-muted/50 border-muted text-muted-foreground/70"
                    : "bg-amber-50/50 dark:bg-amber-900/10 border-amber-200/50 dark:border-amber-800/50 text-foreground",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={cn(
                      "flex-1 whitespace-pre-wrap",
                      note.isCompleted &&
                        "line-through decoration-muted-foreground/50",
                    )}
                  >
                    {note.content}
                  </p>

                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/30"
                      onClick={() =>
                        handleToggle(note._id.toString(), note.isCompleted)
                      }
                    >
                      {note.isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                      onClick={() => handleDelete(note._id.toString())}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{note.author?.name || "Unknown"}</span>
                  </div>
                  {/* <span>{new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}</span> */}
                </div>
              </div>
            );
          })}
          {notes.length === 0 && (
            <p className="text-center text-sm text-muted-foreground mt-10">
              No active memos.
            </p>
          )}
        </div>
      </ScrollArea>

      <form action={handleAddNote} className="flex gap-2 pt-4 border-t mt-auto">
        <Input
          name="content"
          placeholder="Drop a quick note..."
          autoComplete="off"
          required
        />
        <Button type="submit" variant="secondary" disabled={isPending}>
          Post
        </Button>
      </form>
    </div>
  );
}

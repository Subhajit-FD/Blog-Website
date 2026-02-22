"use client";

import { useState, useTransition } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DeleteDialogProps {
  title: string;
  expectedText: string;
  onConfirm: () => Promise<void>; // Expects an async function to show loading states
  trigger: React.ReactNode; // Allows the parent to pass any button style
}

export default function DeleteDialog({
  title,
  expectedText,
  onConfirm,
  trigger,
}: DeleteDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isPending, startTransition] = useTransition();

  const isMatch = inputText === expectedText;

  const handleConfirm = () => {
    if (!isMatch) return;

    startTransition(async () => {
      await onConfirm();
      setIsOpen(false); // Close modal only after successful deletion
      setInputText(""); // Reset input for next time
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              This action cannot be undone. This will permanently delete{" "}
              <strong>{title}</strong>.
            </p>
            <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm border border-red-200">
              Unexpected bad things will happen if you don't read this!
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Please type <strong>{expectedText}</strong> to confirm.
              </label>
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={expectedText}
                disabled={isPending}
                className="select-none" // Prevents easy copy-pasting for extra safety
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isPending}
            onClick={() => setInputText("")}
          >
            Cancel
          </AlertDialogCancel>
          {/* We use a standard Button here instead of AlertDialogAction to prevent auto-closing before the async function finishes */}
          <Button
            variant="destructive"
            disabled={!isMatch || isPending}
            onClick={handleConfirm}
          >
            {isPending
              ? "Deleting..."
              : "I understand the consequences, delete this"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

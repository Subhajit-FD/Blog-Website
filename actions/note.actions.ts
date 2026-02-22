"use server";

import { connectToDatabase } from "@/lib/db";
import Note from "@/lib/models/Note";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { PERMISSIONS } from "@/lib/config/permissions";

export async function addNote(formData: FormData) {
  const content = formData.get("content") as string;
  if (!content) return { error: "Content is required" };

  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  try {
    await connectToDatabase();
    await Note.create({ content, author: session.user.id });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Failed to add note" };
  }
}

export async function deleteNote(id: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  try {
    await connectToDatabase();
    const note = await Note.findById(id);

    if (!note) return { error: "Note not found" };

    const isAuthor = note.author.toString() === session.user.id;
    const permissions = session.user.permissions ?? 0;
    const canManage =
      (permissions & PERMISSIONS.DELETE_POST) !== 0 || // Managers/Admins
      (permissions & PERMISSIONS.ADMINISTRATOR) !== 0;

    if (!isAuthor && !canManage) {
      return { error: "Permission denied" };
    }

    await Note.findByIdAndDelete(id);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete note" };
  }
}

export async function toggleNoteCompletion(id: string, isCompleted: boolean) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  try {
    await connectToDatabase();
    const note = await Note.findById(id);

    if (!note) return { error: "Note not found" };

    const isAuthor = note.author.toString() === session.user.id;
    const permissions = session.user.permissions ?? 0;
    const canManage =
      (permissions & PERMISSIONS.UPDATE_POST) !== 0 ||
      (permissions & PERMISSIONS.ADMINISTRATOR) !== 0;

    if (!isAuthor && !canManage) {
      return { error: "Permission denied" };
    }

    // Toggle the completed status
    await Note.findByIdAndUpdate(id, { isCompleted });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update note" };
  }
}

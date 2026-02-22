"use server";

import { connectToDatabase } from "@/lib/db";
import Contact from "@/lib/models/Contact";
import { auth } from "@/auth";
import { PERMISSIONS } from "@/lib/config/permissions";
import { revalidatePath } from "next/cache";

// 1. PUBLIC ACTION: Submit a message from the "Contact Us" page
export async function submitContactForm(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  try {
    if (!data.name || !data.email || !data.message) {
      return { error: "Name, email, and message are required." };
    }

    await connectToDatabase();
    await Contact.create(data);

    // Optional: You could also trigger Resend here to email YOURSELF a notification!

    return {
      success: true,
      message: "Message sent successfully! We will get back to you soon.",
    };
  } catch (error) {
    return { error: "Failed to send message." };
  }
}

// 2. PROTECTED ACTION: Fetch messages for the Admin Inbox
export async function getInboxMessages() {
  const session = await auth();

  const permissions = session?.user?.permissions ?? 0;

  // Bitwise check for READ_EMAIL or ADMINISTRATOR
  const canView =
    (permissions & PERMISSIONS.READ_EMAIL) !== 0 ||
    (permissions & PERMISSIONS.ADMINISTRATOR) !== 0;

  if (!canView) return { error: "Permission denied." };

  try {
    await connectToDatabase();
    const messages = await Contact.find().sort({ createdAt: -1 }).lean();

    return {
      success: true,
      data: messages.map((msg) => ({ ...msg, _id: msg._id.toString() })),
    };
  } catch (error) {
    return { error: "Failed to fetch inbox." };
  }
}

// 3. PROTECTED ACTION: Mark as Read
export async function markAsRead(id: string) {
  const session = await auth();
  const permissions = session?.user?.permissions ?? 0;
  const canManage =
    (permissions & PERMISSIONS.READ_EMAIL) !== 0 ||
    (permissions & PERMISSIONS.ADMINISTRATOR) !== 0;

  if (!canManage) return { error: "Permission denied." };

  try {
    await connectToDatabase();
    await Contact.findByIdAndUpdate(id, { isRead: true });
    revalidatePath("/dashboard/emails");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update message." };
  }
}

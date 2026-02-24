"use server";

import { Resend } from "resend";
import { auth } from "@/auth";
import { PERMISSIONS } from "@/lib/config/permissions";
import { revalidatePath } from "next/cache";
import { getSettings } from "./settings.actions";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendStaffEmail(
  to: string,
  subject: string,
  body: string,
) {
  const session = await auth();

  // Bitwise check for SEND_EMAIL
  const permissions = session?.user?.permissions ?? 0;
  const canWrite =
    (permissions & PERMISSIONS.SEND_EMAIL) !== 0 ||
    (permissions & PERMISSIONS.ADMINISTRATOR) !== 0;

  if (!canWrite) return { error: "Permission denied." };

  try {
    const siteData = await getSettings();
    const { data, error } = await resend.emails.send({
      from: `${siteData.data?.siteName} <${process.env.RESEND_EMAIL_DOMAIN}>`,
      to,
      subject,
      html: `<div>${body}</div>`,
    });

    if (error) {
      console.error("Resend Send Error:", error);
      return { error: error.message };
    }

    revalidatePath("/dashboard/emails");
    return { success: true, id: data?.id };
  } catch (error) {
    console.error("Unexpected Error:", error);
    return { error: "Failed to send email." };
  }
}

export async function getEmailHistory() {
  const session = await auth();

  // Bitwise check for READ_EMAIL
  const permissions = session?.user?.permissions ?? 0;
  const canView =
    (permissions & PERMISSIONS.READ_EMAIL) !== 0 ||
    (permissions & PERMISSIONS.ADMINISTRATOR) !== 0;

  if (!canView) return { error: "Permission denied." };

  try {
    // Fetch the latest emails directly from Resend's servers
    const { data, error } = await resend.emails.list();

    if (error) {
      console.error("Resend List Error:", error);
      return { error: "Failed to fetch email history." };
    }

    return {
      success: true,
      // Resend returns the array inside response.data.data -> actually data.data with newer SDK or just data depending on structure
      // Checked V2 SDK types: list() returns { data: ListResponse | null, error: ErrorResponse | null }
      // ListResponse has `data: Email[]`.
      data: data?.data || [],
    };
  } catch (error: any) {
    console.error("Resend fetch error:", error);
    return { error: "Failed to fetch email history." };
  }
}

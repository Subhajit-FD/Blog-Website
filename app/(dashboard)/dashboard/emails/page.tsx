// app/(dashboard)/dashboard/emails/page.tsx
import { auth } from "@/auth";
import { PERMISSIONS } from "@/lib/config/permissions";
import { redirect } from "next/navigation";
import EmailComposer from "@/components/dashboard/EmailComposer";
import EmailHistory from "@/components/dashboard/EmailHistory";
import ContactInbox from "@/components/dashboard/ContactInbox";
import { getInboxMessages } from "@/actions/contact.actions";
import { EmailTabs } from "@/components/dashboard/EmailTabs";

export default async function EmailPage() {
  const session = await auth();

  const permissions = session?.user?.permissions ?? 0;
  const canAccess =
    (permissions & PERMISSIONS.READ_EMAIL) !== 0 ||
    (permissions & PERMISSIONS.ADMINISTRATOR) !== 0;

  if (!canAccess) redirect("/dashboard");

  // Fetch the inbox messages securely on the server
  const inboxRes = await getInboxMessages();
  const incomingMessages = inboxRes.success ? inboxRes.data : [];

  // Calculate unread count for a cool badge on the tab!
  const unreadCount = incomingMessages.filter((m: any) => !m.isRead).length;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 md:space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Communication Center</h1>
        <p className="text-muted-foreground">
          Manage incoming support requests and outbound emails.
        </p>
      </div>

      <EmailTabs
        unreadCount={unreadCount}
        inboxContent={<ContactInbox messages={incomingMessages} />}
        composeContent={<EmailComposer />}
        historyContent={<EmailHistory />}
      />
    </div>
  );
}

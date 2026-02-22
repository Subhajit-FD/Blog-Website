"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { markAsRead } from "@/actions/contact.actions";
import { Button } from "@/components/ui/button";
import { CheckCircle2, MailOpen, Mail } from "lucide-react";

export default function ContactInbox({ messages }: { messages: any[] }) {
  const [isPending, startTransition] = useTransition();

  const handleMarkRead = (id: string) => {
    startTransition(async () => {
      const res = await markAsRead(id);
      if (res.error) toast.error(res.error);
    });
  };

  if (messages.length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed rounded-xl text-muted-foreground bg-card">
        No new messages in your inbox.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <div
          key={msg._id}
          className={`p-6 border rounded-xl shadow-sm transition-all ${
            msg.isRead
              ? "bg-muted/50 opacity-75"
              : "bg-card border-l-4 border-l-primary"
          }`}
        >
          <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4 md:gap-0">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {msg.isRead ? (
                  <MailOpen className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Mail className="w-4 h-4 text-primary" />
                )}
                <h3
                  className={`text-lg ${msg.isRead ? "font-medium text-muted-foreground" : "font-bold text-foreground"}`}
                >
                  {msg.subject || "No Subject"}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                From:{" "}
                <span className="font-semibold text-foreground">
                  {msg.name}
                </span>{" "}
                ({msg.email})
              </p>
            </div>

            <div className="flex flex-row md:flex-col items-center md:items-end gap-2 w-full md:w-auto justify-between md:justify-start">
              <span className="text-xs text-muted-foreground">
                {new Date(msg.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              {!msg.isRead && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkRead(msg._id)}
                  disabled={isPending}
                  className="h-8 text-xs"
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Mark Read
                </Button>
              )}
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg text-foreground text-sm whitespace-pre-wrap border border-border">
            {msg.message}
          </div>
        </div>
      ))}
    </div>
  );
}

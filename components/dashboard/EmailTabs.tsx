"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, History, Inbox } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface EmailTabsProps {
  unreadCount: number;
  inboxContent: React.ReactNode;
  composeContent: React.ReactNode;
  historyContent: React.ReactNode;
}

export function EmailTabs({
  unreadCount,
  inboxContent,
  composeContent,
  historyContent,
}: EmailTabsProps) {
  // We explicitly use default orientation (horizontal) so Content sits BELOW List.
  // We use CSS to stack the List items vertically on mobile.

  return (
    <Tabs defaultValue="inbox" className="w-full">
      <TabsList className="flex flex-col h-auto w-full gap-2 mt-8 mb-8 md:flex-row md:w-auto md:h-auto">
        <TabsTrigger
          value="inbox"
          className="relative px-4 py-2 w-full md:w-auto justify-start md:justify-center"
        >
          <Inbox className="w-4 h-4 mr-2" />
          Inbox
          {unreadCount > 0 && (
            <span className="ml-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </TabsTrigger>

        <TabsTrigger
          value="compose"
          className="px-4 py-2 w-full md:w-auto justify-start md:justify-center"
        >
          <Mail className="w-4 h-4 mr-2" /> Compose Outbound
        </TabsTrigger>
        <TabsTrigger
          value="history"
          className="px-4 py-2 w-full md:w-auto justify-start md:justify-center"
        >
          <History className="w-4 h-4 mr-2" /> Outbound Logs
        </TabsTrigger>
      </TabsList>

      <TabsContent value="inbox">{inboxContent}</TabsContent>

      <TabsContent value="compose">{composeContent}</TabsContent>

      <TabsContent value="history">{historyContent}</TabsContent>
    </Tabs>
  );
}

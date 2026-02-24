"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, History, Inbox } from "lucide-react";

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
  const [activeTab, setActiveTab] = React.useState("inbox");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      {/* MOBILE DROPDOWN SELECTOR */}
      <div className="md:hidden mt-8 mb-4">
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger className="w-full h-12">
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inbox">
              <div className="flex items-center">
                <Inbox className="w-4 h-4 mr-2" /> Inbox
                {unreadCount > 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
            </SelectItem>
            <SelectItem value="compose">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" /> Compose Outbound
              </div>
            </SelectItem>
            <SelectItem value="history">
              <div className="flex items-center">
                <History className="w-4 h-4 mr-2" /> Outbound Logs
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* DESKTOP TABS LIST */}
      <TabsList className="hidden md:flex h-auto w-full gap-2 mt-8 mb-8 md:w-auto">
        <TabsTrigger
          value="inbox"
          className="relative px-4 py-2 w-full md:w-auto justify-center"
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
          className="px-4 py-2 w-full md:w-auto justify-center"
        >
          <Mail className="w-4 h-4 mr-2" /> Compose Outbound
        </TabsTrigger>
        <TabsTrigger
          value="history"
          className="px-4 py-2 w-full md:w-auto justify-center"
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

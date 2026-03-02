"use client";

import { useState, useTransition, useMemo } from "react";
import { toast } from "sonner";
import { markAsRead } from "@/actions/contact.actions";
import { useDebouncedValue } from "@/lib/helpers/performance";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import DataPagination from "@/components/dashboard/DataPagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  MailOpen,
  Mail,
  Search,
  Filter,
  Tag,
} from "lucide-react";
import { CONTACT_CATEGORIES } from "@/lib/constants/contact";

const PAGE_SIZE = 10;

// Badge color per category
const CATEGORY_COLORS: Record<string, string> = {
  "General Inquiry":
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  "Career / Job Application":
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  "Sponsorship & Advertising":
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  "Content Feedback":
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  "Bug Report": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  "Partnership & Collaboration":
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  "Press & Media":
    "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  Other: "bg-muted text-muted-foreground",
};

export default function ContactInbox({ messages }: { messages: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const handleMarkRead = (id: string) => {
    startTransition(async () => {
      const res = await markAsRead(id);
      if (res.error) toast.error(res.error);
    });
  };

  // Filter logic — uses debounced search so filtering doesn't fire on every keystroke
  const filtered = useMemo(() => {
    return messages.filter((msg) => {
      const q = debouncedSearch.toLowerCase();
      const matchSearch =
        !q ||
        msg.name?.toLowerCase().includes(q) ||
        msg.email?.toLowerCase().includes(q) ||
        msg.subject?.toLowerCase().includes(q) ||
        msg.message?.toLowerCase().includes(q);

      const msgCategory = msg.category || msg.subject || "General Inquiry";
      const matchCategory =
        categoryFilter === "all" || msgCategory === categoryFilter;

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "unread" && !msg.isRead) ||
        (statusFilter === "read" && msg.isRead);

      return matchSearch && matchCategory && matchStatus;
    });
  }, [messages, search, categoryFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // Reset page on filter change
  const applyFilter = (setter: (v: string) => void, val: string) => {
    setter(val);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-4 bg-card border rounded-xl">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name, email, or message..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 h-9"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
          <Select
            value={categoryFilter}
            onValueChange={(v) => applyFilter(setCategoryFilter, v)}
          >
            <SelectTrigger className="h-9 w-[190px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CONTACT_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <Select
            value={statusFilter}
            onValueChange={(v) => applyFilter(setStatusFilter, v)}
          >
            <SelectTrigger className="h-9 w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="p-12 text-center border-2 border-dashed rounded-xl text-muted-foreground bg-card">
          {search || categoryFilter !== "all" || statusFilter !== "all"
            ? "No messages match your filters."
            : "No messages in your inbox yet."}
        </div>
      )}

      {/* Message Cards */}
      {paginated.map((msg) => {
        const category = msg.category || msg.subject || "General Inquiry";
        const colorClass =
          CATEGORY_COLORS[category] || CATEGORY_COLORS["Other"];
        return (
          <div
            key={msg._id}
            className={`p-6 border rounded-xl shadow-sm transition-all ${
              msg.isRead
                ? "bg-muted/50 opacity-75"
                : "bg-card border-l-4 border-l-primary"
            }`}
          >
            <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4 md:gap-0">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {msg.isRead ? (
                    <MailOpen className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <Mail className="w-4 h-4 text-primary shrink-0" />
                  )}
                  <h3
                    className={`text-lg truncate ${
                      msg.isRead
                        ? "font-medium text-muted-foreground"
                        : "font-bold text-foreground"
                    }`}
                  >
                    {msg.subject || "No Subject"}
                  </h3>
                  <Badge
                    variant="outline"
                    className={`text-xs border-none shrink-0 ${colorClass}`}
                  >
                    {category}
                  </Badge>
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
        );
      })}

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="bg-card border rounded-xl overflow-hidden">
          <DataPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}

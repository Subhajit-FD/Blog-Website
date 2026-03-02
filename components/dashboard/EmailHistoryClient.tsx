"use client";

import { useState, useMemo } from "react";
import { useDebouncedValue } from "@/lib/helpers/performance";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Filter } from "lucide-react";

const PAGE_SIZE = 15;

const STATUS_OPTIONS = ["delivered", "sent", "bounced", "complained"] as const;

function getStatusBadge(status: string | null | undefined) {
  const s = (status || "unknown").toLowerCase();
  switch (s) {
    case "delivered":
      return (
        <Badge className="bg-green-500/15 text-green-700 dark:text-green-400 hover:bg-green-500/25 border-none">
          Delivered
        </Badge>
      );
    case "bounced":
      return <Badge variant="destructive">Bounced</Badge>;
    case "complained":
      return <Badge variant="destructive">Spam Complaint</Badge>;
    case "sent":
      return (
        <Badge
          variant="secondary"
          className="bg-blue-500/15 text-blue-700 dark:text-blue-400"
        >
          In Transit
        </Badge>
      );
    default:
      return <Badge variant="outline">{status || "Unknown"}</Badge>;
  }
}

interface EmailHistoryClientProps {
  emails: any[];
  error?: string;
}

export default function EmailHistoryClient({
  emails,
  error,
}: EmailHistoryClientProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  if (error) {
    return (
      <div className="p-6 text-center text-destructive border rounded-xl bg-destructive/10">
        {error}
      </div>
    );
  }

  // Filter — debounced search prevents filtering on every keystroke
  const filtered = useMemo(() => {
    return emails.filter((email) => {
      const q = debouncedSearch.toLowerCase();
      const toStr = (email.to || []).join(", ").toLowerCase();
      const subject = (email.subject || "").toLowerCase();
      const matchSearch = !q || toStr.includes(q) || subject.includes(q);

      const emailStatus = (email.status || "").toLowerCase();
      const matchStatus =
        statusFilter === "all" || emailStatus === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [emails, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

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
            placeholder="Search recipient or subject..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 h-9"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <Select
            value={statusFilter}
            onValueChange={(v) => applyFilter(setStatusFilter, v)}
          >
            <SelectTrigger className="h-9 w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "sent"
                    ? "In Transit"
                    : s === "complained"
                      ? "Spam Complaint"
                      : s.charAt(0).toUpperCase() + s.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>To</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Sent At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((email: any) => (
              <TableRow key={email.id} className="hover:bg-muted/50">
                <TableCell className="font-medium text-foreground">
                  {(email.to || []).join(", ")}
                </TableCell>
                <TableCell
                  className="text-muted-foreground truncate max-w-[300px]"
                  title={email.subject}
                >
                  {email.subject}
                </TableCell>
                <TableCell>{getStatusBadge(email.status)}</TableCell>
                <TableCell className="text-right text-muted-foreground whitespace-nowrap">
                  {new Date(email.created_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-muted-foreground"
                >
                  {search || statusFilter !== "all"
                    ? "No emails match your filters."
                    : "No emails sent yet. Switch to the Compose tab to send your first message!"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <DataPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}

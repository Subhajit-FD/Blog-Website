import { getEmailHistory } from "@/actions/email.actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function EmailHistory() {
  const response = await getEmailHistory();
  const emails = response.success ? response.data : [];

  // Helper to color-code Resend statuses
  const getStatusBadge = (status: string | null | undefined) => {
    const safeStatus = (status || "unknown").toLowerCase();
    switch (safeStatus) {
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
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (response.error) {
    return (
      <div className="p-6 text-center text-destructive border rounded-xl bg-destructive/10">
        {response.error}
      </div>
    );
  }

  return (
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
          {emails.map((email: any) => (
            <TableRow key={email.id} className="hover:bg-muted/50">
              <TableCell className="font-medium text-foreground">
                {email.to.join(", ")}
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

          {emails.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="h-32 text-center text-muted-foreground"
              >
                No emails sent yet. Switch to the Compose tab to send your first
                message!
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

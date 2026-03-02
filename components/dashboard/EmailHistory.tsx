import { getEmailHistory } from "@/actions/email.actions";
import EmailHistoryClient from "@/components/dashboard/EmailHistoryClient";

export default async function EmailHistory() {
  const response = await getEmailHistory();

  return (
    <EmailHistoryClient
      emails={response.success ? response.data : []}
      error={response.error}
    />
  );
}

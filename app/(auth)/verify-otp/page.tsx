import OtpForm from "@/components/forms/OtpForm";

export default function VerifyOtpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/50">
      <div className="bg-card p-8 rounded-xl shadow-lg border border-border flex justify-center">
        <OtpForm />
      </div>
    </div>
  );
}

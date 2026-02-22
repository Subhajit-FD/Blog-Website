import LoginForm from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/50">
      <div className="bg-card p-8 rounded-xl shadow-lg w-full max-w-md border border-border">
        <LoginForm />
      </div>
    </div>
  );
}

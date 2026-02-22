import RegisterForm from "@/components/forms/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/50">
      <div className="bg-card p-8 rounded-xl shadow-lg w-full max-w-md border border-border">
        <RegisterForm />
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  emailSchema,
  resetPasswordSchema,
  EmailInput,
  ResetPasswordInput,
} from "@/lib/validations/auth";
import { generateAndSendOTP } from "@/actions/otp.actions";
import { resetPasswordWithOtp } from "@/actions/auth.actions";
import { toast } from "sonner";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<"EMAIL" | "OTP" | "NEW_PASSWORD">("EMAIL");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 1. Email Form
  const emailForm = useForm<EmailInput>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  // 2. New Password Form
  const passwordForm = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onEmailSubmit = (values: EmailInput) => {
    startTransition(async () => {
      const res = await generateAndSendOTP(values.email, "PASSWORD_RESET");
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.info(res.message || "OTP sent if the account exists.");
        setEmail(values.email);
        setStep("OTP");
      }
    });
  };

  const onOtpSubmit = () => {
    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit code.");
      return;
    }
    // Just move to the next step. Verification happens atomically upon final submission.
    setStep("NEW_PASSWORD");
  };

  const onPasswordSubmit = (values: ResetPasswordInput) => {
    startTransition(async () => {
      const res = await resetPasswordWithOtp(email, otp, values);
      if (res.error) {
        toast.error(res.error);
        if (res.error === "Invalid or expired OTP code.") {
          setStep("OTP"); // kick back if OTP failed here
        }
      } else {
        toast.success(res.message);
        router.push("/login");
      }
    });
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Reset Password</h1>
          <p className="text-muted-foreground mt-2">
            {step === "EMAIL" && "Enter your email to receive a secure code."}
            {step === "OTP" && `We sent a 6-digit code to ${email}`}
            {step === "NEW_PASSWORD" && "Choose a new strong password."}
          </p>
        </div>

        {/* STEP 1: EMAIL */}
        {step === "EMAIL" && (
          <Form {...emailForm}>
            <form
              onSubmit={emailForm.handleSubmit(onEmailSubmit)}
              className="space-y-4"
            >
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Sending code..." : "Send Reset Code"}
              </Button>
            </form>
          </Form>
        )}

        {/* STEP 2: OTP */}
        {step === "OTP" && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                disabled={isPending}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button
              onClick={onOtpSubmit}
              className="w-full"
              disabled={isPending || otp.length !== 6}
            >
              Verify Code
            </Button>
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setStep("EMAIL")}
                className="text-muted-foreground hover:text-primary transition-colors hover:underline"
              >
                Use a different email
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: NEW PASSWORD */}
        {step === "NEW_PASSWORD" && (
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
              className="space-y-4"
            >
              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="******"
                          disabled={isPending}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="******"
                          disabled={isPending}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          </Form>
        )}

        <div className="text-center text-sm mt-4">
          <Link
            href="/login"
            className="text-muted-foreground hover:text-primary transition-colors hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

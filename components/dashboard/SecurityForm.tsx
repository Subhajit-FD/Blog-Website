"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { signOut } from "next-auth/react";

import {
  passwordResetSchema,
  PasswordResetInput,
} from "@/lib/validations/user";
import { generateAndSendOTP } from "@/actions/otp.actions";
import { resetPasswordWithOtp } from "@/actions/user.actions";

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
import { Key, ShieldCheck, MailWarning } from "lucide-react";

export default function SecurityForm({ email }: { email: string }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [isPending, startTransition] = useTransition();

  const form = useForm<PasswordResetInput>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      otp: "",
      newPassword: "",
    },
  });

  // STEP 1: Request the OTP
  const handleRequestOTP = () => {
    startTransition(async () => {
      // 👈 We explicitly trigger the PASSWORD_RESET scope
      const res = await generateAndSendOTP(email, "PASSWORD_RESET");

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        setStep(2); // Reveal the rest of the form
      }
    });
  };

  // STEP 2: Verify OTP and Update Password
  const onSubmit = (values: PasswordResetInput) => {
    startTransition(async () => {
      const res = await resetPasswordWithOtp(
        email,
        values.otp,
        values.newPassword,
      );

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message);
        // Security Best Practice: Force logout after password change
        setTimeout(() => {
          signOut({ callbackUrl: "/login" });
        }, 2000);
      }
    });
  };

  return (
    <div className="max-w-xl">
      {step === 1 ? (
        <div className="space-y-4 border rounded-xl p-6 bg-muted/40">
          <div className="flex items-center gap-3 text-amber-600 mb-2">
            <MailWarning className="w-5 h-5" />
            <h4 className="font-semibold text-sm">Verification Required</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            To change your password, we must verify your identity. We will send
            a secure 6-digit code to <strong>{email}</strong>.
          </p>
          <Button
            onClick={handleRequestOTP}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            <Key className="w-4 h-4 mr-2" />
            {isPending ? "Sending Code..." : "Send Verification Code"}
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 border rounded-xl p-6 bg-card shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4 text-primary">
              <ShieldCheck className="w-5 h-5" />
              <h4 className="font-bold">Enter Code & New Password</h4>
            </div>

            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>6-Digit Verification Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123456"
                      maxLength={6}
                      className="text-lg tracking-[0.2em] font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Updating Password..." : "Update Password"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}

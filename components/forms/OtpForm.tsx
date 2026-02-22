"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { generateAndSendOTP, verifyOTP } from "@/actions/otp.actions";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function OtpForm() {
  const [code, setCode] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // We need update() to refresh the Auth.js session token locally after success
  const { data: session, update } = useSession();

  const [timer, setTimer] = useState(120); // 2 minutes in seconds

  // Auto-send the OTP when the page first loads
  useEffect(() => {
    // We get the email from the active NextAuth session
    if (session?.user?.email) {
      generateAndSendOTP(session.user.email, "ADMIN_LOGIN").then((res) => {
        if (res.error) toast.error(res.error);
        if (res.success) toast.success(res.message);
      });
    }
  }, [session?.user?.email]);

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleResend = () => {
    if (!session?.user?.email) return toast.error("Session missing.");

    setTimer(120); // Reset timer
    toast.info("Requesting new code...");

    generateAndSendOTP(session.user.email, "ADMIN_LOGIN").then((res) => {
      if (res.error) toast.error(res.error);
      if (res.success) toast.success(res.message);
    });
  };

  const onSubmit = () => {
    if (code.length !== 6) return toast.error("Enter full 6-digit code.");
    if (!session?.user?.email) return toast.error("Session lost.");

    startTransition(async () => {
      // Pass the email, code, and strict action type
      const response = await verifyOTP(
        session!.user!.email!,
        code,
        "ADMIN_LOGIN",
      );

      if (response.error) {
        toast.error(response.error);
      } else if (response.success) {
        toast.success("Verification successful!");
        await update({ otpVerified: true });
        router.push("/dashboard");
      }
    });
  };

  return (
    <div className="w-full max-w-sm space-y-6 text-center">
      <div>
        <h1 className="text-3xl font-bold">Security Verification</h1>
        <p className="text-muted-foreground mt-2">
          We sent a 6-digit security code to your email.
        </p>
      </div>

      <div className="flex justify-center py-4">
        <InputOTP
          maxLength={6}
          value={code}
          onChange={setCode}
          disabled={isPending}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <Button
        onClick={onSubmit}
        className="w-full"
        disabled={isPending || code.length !== 6}
      >
        {isPending ? "Verifying..." : "Verify Code"}
      </Button>

      <div className="text-center">
        <Button
          variant="ghost"
          className="text-muted-foreground w-full"
          onClick={handleResend}
          disabled={timer > 0 || isPending}
        >
          {timer > 0 ? `Resend code in ${formatTime(timer)}` : "Resend Code"}
        </Button>
      </div>
    </div>
  );
}

"use server";

import { connectToDatabase } from "@/lib/db";
import Otp from "@/lib/models/Otp";
import User from "@/lib/models/User";
import OtpSession from "@/lib/models/OtpSession";
import { sendOtpEmail } from "@/lib/helpers/email";
import { auth } from "@/auth";

export type OtpActionType =
  | "ADMIN_LOGIN"
  | "PASSWORD_RESET"
  | "UPDATE_EMAIL"
  | "DASHBOARD_ACCESS";

// 1. GENERATE AND SEND OTP
// We now pass email and actionType explicitly
export async function generateAndSendOTP(
  email: string,
  actionType: OtpActionType,
) {
  try {
    await connectToDatabase();

    // Verify the user actually exists before sending an OTP
    const userExists = await User.findOne({ email }).lean();
    if (!userExists) {
      // For security, we return success even if the email doesn't exist
      // This prevents "Email Enumeration" attacks where hackers guess emails
      return {
        success: true,
        message: "If an account exists, an OTP has been sent.",
      };
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete existing unused OTPs *for this specific action*
    await Otp.deleteMany({ email, actionType });

    await Otp.create({ email, otp: otpCode, actionType });

    // Customize the email subject based on the action
    const subjectMap: Record<OtpActionType, string> = {
      ADMIN_LOGIN: "Your Admin Dashboard Security Code",
      PASSWORD_RESET: "Password Reset Verification Code",
      UPDATE_EMAIL: "Verify Your New Email Address",
      DASHBOARD_ACCESS: "Your Dashboard Access Code",
    };

    // Note: You might want to update sendOtpEmail to accept a subject parameter!
    const emailResult = await sendOtpEmail(
      email,
      otpCode,
      subjectMap[actionType],
    );

    if (emailResult.error) return { error: emailResult.error };
    return { success: true, message: "OTP sent to your email." };
  } catch (error) {
    return { error: "Failed to generate OTP." };
  }
}

// 2. VERIFY THE OTP
export async function verifyOTP(
  email: string,
  code: string,
  actionType: OtpActionType,
) {
  try {
    await connectToDatabase();

    // Strict lookup: Must match email, code, AND actionType
    const validOtp = await Otp.findOne({ email, otp: code, actionType });

    if (!validOtp) {
      return { error: "Invalid or expired OTP code." };
    }

    // If it was for an Admin Login, we update their session status in the DB
    if (actionType === "ADMIN_LOGIN" || actionType === "DASHBOARD_ACCESS") {
      // Create a TTL session for this user
      // First, find the user to get the ID
      const user = await User.findOne({ email });
      if (user) {
        await OtpSession.create({ userId: user._id });
      }
      // We can still set the boolean for legacy/UI, but access is now controlled by OtpSession
      await User.findOneAndUpdate({ email }, { otpVerified: true });
    }

    // Delete the OTP immediately so it can never be reused
    await Otp.deleteOne({ _id: validOtp._id });

    return { success: true };
  } catch (error) {
    return { error: "Verification failed." };
  }
}

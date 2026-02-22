"use server";

import { flattenError } from "zod";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/models/User";
import { hashPassword } from "@/lib/helpers/password";
import {
  registerSchema,
  RegisterInput,
  resetPasswordSchema,
} from "@/lib/validations/auth";
import { verifyOTP } from "@/actions/otp.actions";

export async function registerUser(data: RegisterInput) {
  try {
    // 1. Double-check validation on the server (Security best practice)
    const validatedData = registerSchema.safeParse(data);

    if (!validatedData.success) {
      return {
        error: "Invalid data provided.",
        details: flattenError(validatedData.error).fieldErrors,
      };
    }

    const { name, email, password } = validatedData.data;

    // 2. Connect to the Database
    await connectToDatabase();

    // 3. Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { error: "A user with this email already exists." };
    }

    // 4. Hash the password using your helper
    const hashedPassword = await hashPassword(password);

    // 5. Create the new user
    // Note: 'roles' defaults to ["User"] and 'otpVerified' defaults to false per our Mongoose schema
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // 6. Return a success state (DO NOT return the full user object with the password)
    return {
      success: true,
      message: "Registration successful! You can now log in.",
    };
  } catch (error) {
    console.error("Registration Error:", error);
    return { error: "Something went wrong during registration." };
  }
}

export async function resetPasswordWithOtp(
  email: string,
  otp: string,
  data: any,
) {
  try {
    const validatedData = resetPasswordSchema.safeParse(data);
    if (!validatedData.success) {
      return {
        error: "Invalid password data.",
        details: flattenError(validatedData.error).fieldErrors,
      };
    }

    const { password } = validatedData.data;

    // Verify OTP first
    const verification = await verifyOTP(email, otp, "PASSWORD_RESET");
    if (verification.error) {
      return { error: verification.error };
    }

    await connectToDatabase();

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
    );

    if (!updatedUser) {
      return { error: "User not found." };
    }

    return {
      success: true,
      message: "Password has been successfully recovered.",
    };
  } catch (error) {
    console.error("Password Reset Error:", error);
    return { error: "Failed to reset password. Please try again." };
  }
}

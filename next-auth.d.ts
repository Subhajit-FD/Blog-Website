
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      permissions: number; 
      otpVerified: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    permissions: number; 
    otpVerified: boolean;
  }
}
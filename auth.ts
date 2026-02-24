// auth.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/models/User";
import { verifyPassword } from "@/lib/helpers/password";
import { loginSchema } from "@/lib/validations/auth";
import { authConfig } from "./auth.config";

import Google from "next-auth/providers/google";
import OtpSession from "@/lib/models/OtpSession";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials);
        if (!parsedCredentials.success) throw new Error("Invalid input");

        const { email, password } = parsedCredentials.data;
        await connectToDatabase();

        const user = await User.findOne({ email }).select("+password").lean();
        if (!user || !user.password) throw new Error("Invalid credentials");

        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) throw new Error("Invalid credentials");

        // ... inside authorize ...
        const otpSession = await OtpSession.findOne({ userId: user._id });

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          permissions: user.permissions ?? 0,
          otpVerified: !!otpSession, // Check existence of session doc
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // Exactly 24 hours in seconds
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          await connectToDatabase();
          const existingUser = await User.findOne({ email: user.email });

          if (existingUser) {
            // Update googleId if missing
            if (!existingUser.googleId) {
              existingUser.googleId = account.providerAccountId;
              await User.updateOne(
                { _id: existingUser._id },
                { googleId: account.providerAccountId },
              );
            }
            // Ensure permissions are attached to the user object for the session
            // Default to 0 if null/undefined
            user.permissions = existingUser.permissions ?? 0;

            const otpSession = await OtpSession.findOne({
              userId: existingUser._id,
            });
            user.otpVerified = !!otpSession;
            // We return true to allow sign in
            return true;
          } else {
            // Create new user
            const newUser = await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              googleId: account.providerAccountId,
              permissions: 0, // Default USER role without dashboard access
              otpVerified: false,
            });
            user.permissions = newUser.permissions;
            user.otpVerified = newUser.otpVerified;
            return true;
          }
        } catch (error) {
          console.error("Error signing in with Google:", error);
          return false;
        }
      }
      return true; // Allow other providers (credentials)
    },
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        // 1. Credentials Login: user object already has correct shape from authorize()
        if (account?.provider === "credentials") {
          token.id = user.id;
          token.permissions = user.permissions;
          token.otpVerified = user.otpVerified;
        }
        // 2. Google Login: user object is just the profile. We need to get DB data.
        else if (account?.provider === "google") {
          await connectToDatabase();
          const dbUser = await User.findOne({ email: user.email });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.permissions = dbUser.permissions;
            // Check OTP session
            const otpSession = await OtpSession.findOne({ userId: dbUser._id });
            token.otpVerified = !!otpSession;
          }
        }
      }

      // Allows updating the session dynamically
      if (trigger === "update" && session) {
        token.otpVerified = session.otpVerified;
        // token.permissions = session.permissions;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.permissions = token.permissions as number;
        session.user.otpVerified = token.otpVerified as boolean;
      }
      return session;
    },
  },
});

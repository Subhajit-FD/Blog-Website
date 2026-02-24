// auth.config.ts
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [], // Keep empty here, populated in auth.ts
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      // Extract permissions (default to 0 if not found)
      const userPerms = (auth?.user?.permissions as number) || 0;
      const isOtpVerified = auth?.user?.otpVerified as boolean;

      // Permission Constants
      // 1 << 0 = 1 (VIEW_DASHBOARD)
      const PERM_VIEW_DASHBOARD = 1;
      // 1 << 30 = 1073741824 (ADMINISTRATOR)
      const PERM_ADMINISTRATOR = 1073741824;

      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnOtpPage = nextUrl.pathname.startsWith("/verify-otp");

      // 🛡️ 1. DASHBOARD PROTECTION
      if (isOnDashboard) {
        if (!isLoggedIn) return false;

        // Check if user has VIEW_DASHBOARD permission OR is an ADMINISTRATOR
        const hasDashboardAccess = (userPerms & PERM_VIEW_DASHBOARD) !== 0;
        const isAdmin = (userPerms & PERM_ADMINISTRATOR) !== 0;

        if (!hasDashboardAccess && !isAdmin) {
          return Response.redirect(new URL("/", nextUrl));
        }

        // 🔐 2. ADMIN & STAFF 2-STEP OTP ENFORCEMENT
        // If they have access but haven't verified OTP yet
        if ((hasDashboardAccess || isAdmin) && !isOtpVerified) {
          return Response.redirect(new URL("/verify-otp", nextUrl));
        }

        return true;
      }

      // 🛡️ 3. OTP PAGE PROTECTION
      if (isOnOtpPage) {
        if (!isLoggedIn) return false;

        const isAdmin = (userPerms & PERM_ADMINISTRATOR) !== 0;
        // Check for Administrator OR Dashboard Access
        const hasDashboardAccess = (userPerms & PERM_VIEW_DASHBOARD) !== 0;

        // Managers and Admins access this page
        if (!isAdmin && !hasDashboardAccess) {
          return Response.redirect(new URL("/", nextUrl));
        }

        if (isOtpVerified) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }

        return true;
      }

      return true;
    },
    // Update these to match auth.ts (or remove if handled entirely in auth.ts)
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.permissions = user.permissions;
        token.otpVerified = user.otpVerified;
      }

      if (trigger === "update" && session) {
        token.otpVerified = session.otpVerified;
        token.permissions = session.permissions; // Allow updating perms too
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
} satisfies NextAuthConfig;

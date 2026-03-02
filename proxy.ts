// proxy.ts — renamed from middleware.ts (Next.js 16 convention)
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 1. Initialize Auth.js
const { auth } = NextAuth(authConfig);

// 2. Initialize Upstash Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 3. Rate Limiter — generous limit per sliding window
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "10 s"),
  analytics: process.env.NODE_ENV === "production",
});

// Routes that warrant rate limiting (write/auth actions only)
function isRateLimitedRoute(req: NextRequest): boolean {
  const { pathname, method } = req.nextUrl as any;
  const httpMethod = method || (req as any).method || "GET";

  // Always rate-limit API routes and auth pages (any method)
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")
  ) {
    return true;
  }

  // For dashboard & public pages: only rate-limit non-GET requests
  // (form submissions, mutations) — never block simple page navigation
  if (httpMethod !== "GET" && httpMethod !== "HEAD") {
    return true;
  }

  return false;
}

// 4. Wrap the Auth middleware with Rate Limiting
export default auth(async (req) => {
  // Skip rate limiting in development — avoids false positives on localhost
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }

  if (!isRateLimitedRoute(req)) {
    return NextResponse.next();
  }

  // Extract the user's IP address
  const ip =
    (req as any).ip || req.headers.get("x-forwarded-for") || "127.0.0.1";

  const { success, limit, reset, remaining } = await ratelimit.limit(
    `ratelimit_${ip}`,
  );

  if (!success) {
    console.warn(
      `🛑 Rate limit exceeded for IP: ${ip} on ${req.nextUrl.pathname}`,
    );

    return new NextResponse(
      JSON.stringify({
        error: "Too Many Requests.",
        message: "You are being rate limited. Please slow down.",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      },
    );
  }
});

// 5. Next.js Matcher Configuration
export const config = {
  // We match every route EXCEPT static files, images, and the favicon.
  // We don't want to waste Redis calls on loading a .png file!
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

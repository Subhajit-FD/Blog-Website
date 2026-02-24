// proxy.ts — renamed from middleware.ts (Next.js 16 convention)
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

// 1. Initialize Auth.js
const { auth } = NextAuth(authConfig);

// 2. Initialize Upstash Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 3. Configure the Rate Limiter (Sliding Window Algorithm)
// Raised to 60 req / 10s to avoid false-positives on legit dashboard navigation.
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(60, "10 s"),
  // Only enable analytics in production — localhost Upstash connections are unreliable
  analytics: process.env.NODE_ENV === "production",
});

// 4. Wrap the Auth middleware with Rate Limiting
export default auth(async (req) => {
  const { pathname } = req.nextUrl;

  // Optimize: Only rate limit sensitive routes (API, Auth, Dashboard writes)
  // Public informational pages should be as fast as possible.
  const isSensitiveRoute =
    pathname.startsWith("/api") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/dashboard");

  if (!isSensitiveRoute) {
    return NextResponse.next();
  }

  // Skip rate limiting entirely in development — avoids false positives on localhost
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }

  // Extract the user's IP address
  const ip =
    (req as any).ip || req.headers.get("x-forwarded-for") || "127.0.0.1";

  // Check the IP against our Redis store
  const { success, limit, reset, remaining } = await ratelimit.limit(
    `ratelimit_${ip}`,
  );

  // If they exceed the limit, block the request instantly at the Edge
  if (!success) {
    console.warn(`🛑 Rate limit exceeded for IP: ${ip} on ${pathname}`);

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

  // If they pass, Auth.js takes over and evaluates the route permissions normally
});

// 5. Next.js Matcher Configuration
export const config = {
  // We match every route EXCEPT static files, images, and the favicon.
  // We don't want to waste Redis calls on loading a .png file!
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

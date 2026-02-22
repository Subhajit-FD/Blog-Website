import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

// Fallback is only for local dev. Production requires a strong AUTH_SECRET in .env
const JWT_SECRET = process.env.AUTH_SECRET || "super-secret-development-key";

/**
 * Generates a signed JWT token with a specific payload and expiration.
 */
export function generateToken(
  payload: object,
  expiresIn: string = "1d",
): string {
  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Verifies a token and returns the decoded payload. Returns null if invalid/expired.
 */
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null; // Token is invalid or has expired
  }
}

/*
 - Used on: server auth routes and middleware
 - Features: JWT helpers, cookie constants, token verification
*/
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
export const AUTH_COOKIE_NAME = "sportify_auth_token";
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

if (!JWT_SECRET) {
  throw new Error("Please define JWT_SECRET in .env.local");
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: "organizer" | "player" | "sponsor";
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

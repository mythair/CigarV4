import { createHash, randomBytes } from "node:crypto";

const AUTH_SECRET = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "cigar-local-development-secret";

export function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function hashPassword(password: string): string {
  return sha256Hex(`${AUTH_SECRET}:password:${password}`);
}

export function hashIp(ip: string): string {
  return sha256Hex(`${AUTH_SECRET}:ip:${ip}`);
}

export function hashSessionToken(token: string): string {
  return sha256Hex(`${AUTH_SECRET}:session:${token}`);
}

export function createSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? request.headers.get("cf-connecting-ip") ?? "unknown";
}

export function validateUsername(username: string): string | null {
  const value = username.trim();
  if (value.length < 4) return "Username must be at least 4 letters long.";
  if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Username can only contain letters, numbers, and underscores.";
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 6) return "Password must be at least 6 characters long.";
  return null;
}

export function normalizeEmail(email?: string): string | undefined {
  const value = email?.trim().toLowerCase();
  if (!value) return undefined;
  return value;
}

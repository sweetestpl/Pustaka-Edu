import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_COOKIE = "pustakaedu_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours

const SECRET = process.env.SESSION_SECRET || "pustakaedu-dev-secret-change-me";

export type Role = "ADMIN" | "SISWA";

export interface SessionUser {
  id: string; // For siswa: NIS. For admin: username.
  name: string;
  role: Role;
  class_name?: string;
  email?: string;
}

interface SessionPayload {
  user: SessionUser;
  exp: number;
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(input: string): string {
  const padded = input
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(input.length + ((4 - (input.length % 4)) % 4), "=");
  return Buffer.from(padded, "base64").toString("utf-8");
}

function sign(value: string): string {
  return base64UrlEncode(
    crypto.createHmac("sha256", SECRET).update(value).digest("base64")
  );
}

export function createSessionToken(user: SessionUser): string {
  const payload: SessionPayload = {
    user,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const sig = sign(encodedPayload);
  return `${encodedPayload}.${sig}`;
}

export function verifySessionToken(token: string | undefined | null): SessionUser | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encodedPayload, sig] = parts;
  const expectedSig = sign(encodedPayload);
  if (sig !== expectedSig) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload;
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload.user;
  } catch {
    return null;
  }
}

export async function setSessionCookie(user: SessionUser): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

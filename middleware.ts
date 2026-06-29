import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "pustakaedu_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;

const SECRET = process.env.SESSION_SECRET || "pustakaedu-development-secret-change-in-prod";

function base64UrlDecode(input: string): string {
  const padded = input
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(input.length + ((4 - (input.length % 4)) % 4), "=");
  // atob is available in Edge runtime
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const atobFn: (s: string) => string = (globalThis as any).atob;
  return atobFn(padded);
}

async function hmacSha256(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  const bytes = new Uint8Array(sig);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const btoaFn: (s: string) => string = (globalThis as any).btoa;
  return btoaFn(bin)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function verifySession(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [encodedPayload, sig] = parts;
    const expected = await hmacSha256(SECRET, encodedPayload);
    if (sig !== expected) return null;
    const json = base64UrlDecode(encodedPayload);
    const payload = JSON.parse(json) as { user: { role: string }; exp: number };
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload.user;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Routes that don't require auth
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/books") ||
    pathname.startsWith("/api/members") ||
    pathname.startsWith("/api/loans") ||
    pathname.startsWith("/api/stats") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Admin / Siswa areas require auth
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const user = token ? await verifySession(token) : null;

  if (!user) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/siswa/dashboard", req.url));
  }
  if (pathname.startsWith("/siswa") && user.role !== "SISWA") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

// keep an unused reference so the constant is exported for tools that lint
void SESSION_TTL_MS;

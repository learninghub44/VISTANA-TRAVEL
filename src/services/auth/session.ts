import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { Profile } from "@/services/db/types";

const SESSION_COOKIE = "vistana_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_SECRET environment variable is missing or too short. Set a long random string (32+ chars) before starting the app."
    );
  }
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  sub: string; // profile id
  role: "admin" | "customer";
  email: string;
  iat?: number; // issued-at (seconds) — populated on verify
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ role: payload.role, email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    // Pin the algorithm so a token can never be accepted under a weaker/other alg.
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    if (!payload.sub || !payload.email) return null;
    if (payload.role !== "admin" && payload.role !== "customer") return null;
    return {
      iat: payload.iat,
      sub: payload.sub as string,
      role: payload.role as "admin" | "customer",
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await createSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Session re-validated against the database on every call. A signed JWT alone
 * stays "valid" for 7 days even if the account was deleted, demoted from
 * admin, or had its password reset — this closes that window. Returns the
 * live profile so callers use the DB's role, never the token's claim.
 */
export async function getVerifiedSession(): Promise<{ session: SessionPayload; profile: Profile } | null> {
  const session = await getSession();
  if (!session) return null;

  const { db } = await import("@/services/db");
  const profile = await db.getProfileById(session.sub);
  if (!profile) return null;
  if (profile.role !== session.role) return null; // role changed since login → force re-login

  if (profile.password_changed_at && session.iat) {
    const changedAt = Math.floor(new Date(profile.password_changed_at).getTime() / 1000);
    if (session.iat < changedAt) return null; // password changed after this session started
  }
  return { session, profile };
}

export { SESSION_COOKIE };

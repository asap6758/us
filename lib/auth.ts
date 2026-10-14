import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { Who } from "./config";

const SESSION_COOKIE = "us_session";
const TZ_COOKIE = "us_tz";
const ONE_YEAR = 60 * 60 * 24 * 365;

function secret(): string {
  const base = process.env.SESSION_SECRET || process.env.APP_PASSCODE || "dev";
  return createHmac("sha256", "us-session-v1").update(base).digest("hex");
}

export function sign(who: Who): string {
  const mac = createHmac("sha256", secret()).update(who).digest("hex");
  return `${who}.${mac}`;
}

export function verify(token: string | undefined): Who | null {
  if (!token) return null;
  const [who, mac] = token.split(".");
  if ((who !== "a" && who !== "b") || !mac) return null;
  const expected = createHmac("sha256", secret()).update(who).digest("hex");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return who;
}

export function passcodeMatches(input: string): boolean {
  const expected = process.env.APP_PASSCODE || "";
  if (!expected) return false;
  const a = Buffer.from(input.trim());
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function currentUser(): Promise<Who | null> {
  const jar = await cookies();
  return verify(jar.get(SESSION_COOKIE)?.value);
}

export async function currentTz(): Promise<string> {
  const jar = await cookies();
  const tz = jar.get(TZ_COOKIE)?.value;
  if (tz && isValidTz(tz)) return tz;
  return "UTC";
}

export function isValidTz(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export async function setSession(who: Who, tz: string) {
  const jar = await cookies();
  const opts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR,
  };
  jar.set(SESSION_COOKIE, sign(who), opts);
  if (isValidTz(tz)) jar.set(TZ_COOKIE, tz, { ...opts, httpOnly: false });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export { SESSION_COOKIE, TZ_COOKIE };

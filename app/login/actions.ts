"use server";

import { redirect } from "next/navigation";
import { clearSession, passcodeMatches, setSession } from "@/lib/auth";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const passcode = String(formData.get("passcode") ?? "");
  const who = String(formData.get("who") ?? "");
  const tz = String(formData.get("tz") ?? "UTC");

  if (who !== "a" && who !== "b") return { error: "Pick who you are." };
  if (!passcodeMatches(passcode)) return { error: "That's not it. Try again." };

  await setSession(who, tz);
  redirect("/");
}

export async function logout() {
  await clearSession();
  redirect("/login");
}

"use client";

import { useActionState, useEffect, useState } from "react";
import { login, type LoginState } from "@/app/login/actions";
import type { Who } from "@/lib/config";

export function LoginForm({ names }: { names: Record<Who, string> }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const [tz, setTz] = useState("UTC");

  useEffect(() => {
    try {
      setTz(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
    } catch {}
  }, []);

  return (
    <form action={action}>
      <input type="hidden" name="tz" value={tz} />
      <div className="field">
        <label>I am</label>
        <div className="who">
          <input type="radio" name="who" id="who-a" value="a" required />
          <label htmlFor="who-a">{names.a}</label>
          <input type="radio" name="who" id="who-b" value="b" required />
          <label htmlFor="who-b">{names.b}</label>
        </div>
      </div>
      <div className="field">
        <label htmlFor="passcode">Our passcode</label>
        <input id="passcode" name="passcode" type="password" autoComplete="off" required autoFocus />
      </div>
      {state.error && <p className="error">{state.error}</p>}
      <button className="send" type="submit" disabled={pending}>
        {pending ? "One sec…" : "Come in"}
      </button>
    </form>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Keeps the server's idea of "today" aligned with the phone's timezone, e.g. when travelling.
export function TzSync() {
  const router = useRouter();
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (!tz) return;
      const current = document.cookie.match(/(?:^|; )us_tz=([^;]*)/)?.[1];
      if (current !== tz) {
        document.cookie = `us_tz=${encodeURIComponent(tz)}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
        router.refresh();
      }
    } catch {}
  }, [router]);
  return null;
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Quietly re-fetches the page when you come back to it, so the other person's entry shows up.
export function Refresher({ every = 60_000 }: { every?: number }) {
  const router = useRouter();
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const id = setInterval(refresh, every);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [router, every]);
  return null;
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RemoveButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function remove() {
    if (!confirm("Take this back? You can post something else today.")) return;
    setBusy(true);
    await fetch(`/api/entries?id=${id}`, { method: "DELETE" });
    router.refresh();
    setBusy(false);
  }
  return (
    <div className="card-foot">
      <button type="button" className="linkish" onClick={remove} disabled={busy}>
        {busy ? "Removing…" : "Take back"}
      </button>
    </div>
  );
}

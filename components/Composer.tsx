"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const MAX_EDGE = 1800;

async function compress(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.round(img.naturalWidth * scale);
    const height = Math.round(img.naturalHeight * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
    for (const q of [0.86, 0.78, 0.68, 0.55]) {
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", q));
      if (blob && blob.size <= 3.5 * 1024 * 1024) return { blob, width, height };
    }
    throw new Error("Couldn't shrink that photo enough.");
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function Composer({ partner }: { partner: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<{ blob: Blob; width: number; height: number; preview: string } | null>(null);
  const [busy, setBusy] = useState<"" | "reading" | "sending">("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = el.scrollHeight + "px";
  }, [text, photo]);

  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo.preview); }, [photo]);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setBusy("reading");
    try {
      const { blob, width, height } = await compress(file);
      if (photo) URL.revokeObjectURL(photo.preview);
      setPhoto({ blob, width, height, preview: URL.createObjectURL(blob) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't read that photo.");
    } finally {
      setBusy("");
    }
  }

  async function send() {
    if (busy) return;
    setError("");
    setBusy("sending");
    try {
      const fd = new FormData();
      fd.set("text", text.trim());
      if (photo) {
        fd.set("photo", photo.blob, "photo.jpg");
        fd.set("width", String(photo.width));
        fd.set("height", String(photo.height));
      }
      const res = await fetch("/api/entries", { method: "POST", body: fd });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong.");
      }
      setText("");
      setPhoto(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy("");
    }
  }

  const canSend = !busy && (text.trim().length > 0 || !!photo);

  return (
    <div className="composer glass">
      {photo && (
        <div className="preview">
          <img src={photo.preview} width={photo.width} height={photo.height} alt="" />
          <button type="button" className="remove" onClick={() => setPhoto(null)} aria-label="Remove photo">
            ×
          </button>
        </div>
      )}
      <textarea
        ref={textRef}
        className={photo ? "small" : ""}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canSend) send();
        }}
        placeholder={photo ? "Add a few words (optional)" : `A little something for ${partner}…`}
        maxLength={2000}
        rows={1}
      />
      {error && <p className="error">{error}</p>}
      <div className="composer-bar">
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={pick} />
        <button
          type="button"
          className="icon-btn"
          onClick={() => fileRef.current?.click()}
          aria-label="Add a photo"
          disabled={busy !== ""}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="3" />
            <circle cx="9" cy="10" r="1.6" />
            <path d="M21 16l-5-5-8 8" />
          </svg>
        </button>
        <button type="button" className="send" onClick={send} disabled={!canSend}>
          {busy === "sending" ? "Sending…" : busy === "reading" ? "Reading photo…" : "Send"}
        </button>
      </div>
    </div>
  );
}

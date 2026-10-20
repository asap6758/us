import type { Entry } from "@/lib/types";
import { Photo } from "./Photo";

export function EntryCard({ entry, compact = false, who }: { entry: Entry; compact?: boolean; who: string }) {
  const cls = `card glass ${entry.kind === "photo" ? "photo" : "note"}${compact ? " compact" : ""}`;
  if (entry.kind === "photo" && entry.imageUrl) {
    return (
      <article className={cls}>
        <Photo src={entry.imageUrl} width={entry.width} height={entry.height} alt={entry.text || `Photo from ${who}`} />
        {entry.text && <p className="caption">{entry.text}</p>}
      </article>
    );
  }
  return (
    <article className={cls}>
      <p className="note-text">{entry.text}</p>
    </article>
  );
}

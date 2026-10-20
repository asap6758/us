import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentTz, currentUser } from "@/lib/auth";
import { names, other } from "@/lib/config";
import { fmtDay, fmtMonth, isValidMonth, monthName, shiftMonth, todayIn } from "@/lib/dates";
import { buildRecap } from "@/lib/recap";
import { store } from "@/lib/store";
import { Shell } from "@/components/Shell";
import { EntryCard } from "@/components/EntryCard";
import { Photo } from "@/components/Photo";

export const dynamic = "force-dynamic";

export default async function RecapPage({ params }: { params: Promise<{ month: string }> }) {
  const me = await currentUser();
  if (!me) redirect("/login");
  const { month } = await params;
  if (!isValidMonth(month)) notFound();
  const n = names();
  const them = other(me);
  const tz = await currentTz();
  const thisMonth = todayIn(tz).slice(0, 7);
  const entries = await store().getMonth(month);
  const r = buildRecap(month, entries, tz);
  const inProgress = month === thisMonth;
  const [mn, yr] = fmtMonth(month).split(" ");

  return (
    <Shell active="recap" me={me} names={n}>
      <header className="hero recap-head">
        <p className="eyebrow">{inProgress ? "So far this month" : "Monthly recap"}</p>
        <h1 className="date">
          {mn} <em>{yr}</em>
        </h1>
      </header>

      {entries.length === 0 ? (
        <p className="quiet">Nothing happened here. Not every month needs to.</p>
      ) : (
        <>
          <div className="stats">
            <div className="stat glass">
              <b>
                {r.daysWithSomething}
                <small>/{inProgress ? r.daysElapsed : r.daysInMonth}</small>
              </b>
              <span>days with something</span>
            </div>
            <div className="stat glass">
              <b>{r.daysBoth}</b>
              <span>days you both showed up</span>
            </div>
            <div className="stat glass">
              <b>{r.longestStreak}</b>
              <span>longest streak, days</span>
            </div>
            <div className="stat glass you">
              <b>{r.byAuthor[me].total}</b>
              <span>from you</span>
            </div>
            <div className="stat glass them">
              <b>{r.byAuthor[them].total}</b>
              <span>from {n[them]}</span>
            </div>
            <div className="stat glass">
              <b>
                {r.photos}
                <small> + {r.notes}</small>
              </b>
              <span>photos + notes</span>
            </div>
          </div>

          {r.photoEntries.length > 0 && (
            <>
              <h2 className="section-title">
                Every photo <span>{r.photoEntries.length}</span>
              </h2>
              <div className="grid">
                {r.photoEntries.map((e) => (
                  <div className="tile" key={e.id} title={`${fmtDay(e.day)} · ${e.author === me ? "you" : n[e.author]}`}>
                    <Photo src={e.imageUrl!} width={null} height={null} alt={e.text || `Photo from ${n[e.author]}`} />
                    <i className={e.author === me ? "" : "them"} />
                  </div>
                ))}
              </div>
            </>
          )}

          {r.noteEntries.length > 0 && (
            <>
              <h2 className="section-title">
                Every note <span>{r.noteEntries.length} · {r.words} words</span>
              </h2>
              <div className="notes">
                {r.noteEntries.map((e) => (
                  <div key={e.id}>
                    <div className="author-tag">
                      <span className={`dot${e.author === me ? "" : " them"}`} />
                      {e.author === me ? "You" : n[e.author]} · {fmtDay(e.day)}
                    </div>
                    <EntryCard entry={e} compact who={e.author === me ? "you" : n[e.author]} />
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <nav className="recap-foot">
        <Link href={`/recap/${shiftMonth(month, -1)}`}>← {monthName(shiftMonth(month, -1))}</Link>
        <Link href={`/archive?m=${month}`}>Open in archive</Link>
        {month < thisMonth ? <Link href={`/recap/${shiftMonth(month, 1)}`}>{monthName(shiftMonth(month, 1))} →</Link> : <span />}
      </nav>
    </Shell>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { currentTz, currentUser } from "@/lib/auth";
import { names, other } from "@/lib/config";
import { daysBetween, fmtDay, fmtMonth, fmtTime, shiftMonth, todayIn } from "@/lib/dates";
import { store } from "@/lib/store";
import { Shell } from "@/components/Shell";
import { Composer } from "@/components/Composer";
import { EntryCard } from "@/components/EntryCard";
import { RemoveButton } from "@/components/RemoveButton";
import { Refresher } from "@/components/Refresher";

export const dynamic = "force-dynamic";

export default async function Today() {
  const me = await currentUser();
  if (!me) redirect("/login");
  const them = other(me);
  const n = names();
  const tz = await currentTz();
  const today = todayIn(tz);
  const db = store();

  const [entries, firstDay, months] = await Promise.all([db.getDay(today), db.getFirstDay(), db.getMonths()]);
  const mine = entries.find((e) => e.author === me);
  const theirs = entries.find((e) => e.author === them);
  const dayNumber = firstDay ? daysBetween(firstDay, today) + 1 : 1;

  const prevMonth = shiftMonth(today.slice(0, 7), -1);
  const showRecap = Number(today.slice(8)) <= 7 && months.some((m) => m.month === prevMonth);

  const [weekday, rest] = fmtDay(today, { weekday: true }).split(", ");

  return (
    <Shell active="today" me={me} names={n}>
      <Refresher />
      <header className="hero">
        <p className="eyebrow">
          Day {dayNumber} · {weekday}
        </p>
        <h1 className="date">{rest}</h1>
      </header>

      {showRecap && (
        <Link href={`/recap/${prevMonth}`} className="notice glass">
          <span>
            <strong>{fmtMonth(prevMonth, { year: false })} is in the books.</strong>
            <span className="muted">Your recap is ready.</span>
          </span>
          <span className="arrow">→</span>
        </Link>
      )}

      <section className="slot">
        <div className="slot-head">
          <span className="dot" /> You
          {mine && <span className="time">{fmtTime(mine.createdAt, tz)}</span>}
        </div>
        {mine ? (
          <>
            <EntryCard entry={mine} who="you" />
            <RemoveButton id={mine.id} />
          </>
        ) : (
          <Composer partner={n[them]} />
        )}
      </section>

      <section className="slot">
        <div className="slot-head">
          <span className="dot them" /> {n[them]}
          {theirs && <span className="time">{fmtTime(theirs.createdAt, tz)}</span>}
        </div>
        {theirs ? (
          <EntryCard entry={theirs} who={n[them]} />
        ) : (
          <p className="empty">Nothing from {n[them]} yet.</p>
        )}
      </section>

      {mine && theirs && <p className="both">Both in. See you tomorrow.</p>}
    </Shell>
  );
}

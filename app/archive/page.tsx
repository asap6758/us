import Link from "next/link";
import { redirect } from "next/navigation";
import { currentTz, currentUser } from "@/lib/auth";
import { names } from "@/lib/config";
import { fmtMonth, isValidMonth, monthName, shiftMonth, shortMonth, todayIn } from "@/lib/dates";
import { store } from "@/lib/store";
import { Shell } from "@/components/Shell";
import { EntryCard } from "@/components/EntryCard";
import type { Entry } from "@/lib/types";

export const dynamic = "force-dynamic";

const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function Archive({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const me = await currentUser();
  if (!me) redirect("/login");
  const n = names();
  const tz = await currentTz();
  const thisMonth = todayIn(tz).slice(0, 7);
  const { m } = await searchParams;
  const month = m && isValidMonth(m) ? m : thisMonth;
  const db = store();

  const [entries, months] = await Promise.all([db.getMonth(month), db.getMonths()]);
  const earliest = months.length ? months[months.length - 1].month : thisMonth;

  const days = new Map<string, Entry[]>();
  for (const e of entries) {
    if (!days.has(e.day)) days.set(e.day, []);
    days.get(e.day)!.push(e);
  }

  const years = new Map<string, { month: string; count: number }[]>();
  for (const x of months) {
    const y = x.month.slice(0, 4);
    if (!years.has(y)) years.set(y, []);
    years.get(y)!.push(x);
  }
  const [mn, yr] = fmtMonth(month).split(" ");
  const count = entries.length;

  return (
    <Shell active="archive" me={me} names={n}>
      <div className="month-nav">
        <Link href={`/archive?m=${shiftMonth(month, -1)}`} className="arrow-btn" aria-label="Previous month" aria-disabled={month <= earliest && month <= thisMonth ? "true" : undefined}>
          ←
        </Link>
        <h1>
          {mn} <span>{yr}</span>
        </h1>
        <Link href={`/archive?m=${shiftMonth(month, 1)}`} className="arrow-btn" aria-label="Next month" aria-disabled={month >= thisMonth ? "true" : undefined}>
          →
        </Link>
      </div>
      <div className="month-meta">
        <span>
          {count === 0 ? "Nothing here yet" : `${count} ${count === 1 ? "thing" : "things"} · ${days.size} ${days.size === 1 ? "day" : "days"}`}
        </span>
        {count > 0 && (
          <Link href={`/recap/${month}`} className="pill glass">
            {monthName(month)} recap →
          </Link>
        )}
      </div>

      {[...days.entries()].map(([day, list]) => {
        const d = new Date(day + "T00:00:00Z");
        return (
          <section className="day" key={day}>
            <div className="day-label">
              <span className="wd">{WD[d.getUTCDay()]}</span>
              <span className="n">{d.getUTCDate()}</span>
            </div>
            <div className="day-entries">
              {list.map((e) => (
                <div key={e.id}>
                  <div className="author-tag">
                    <span className={`dot${e.author === me ? "" : " them"}`} />
                    {e.author === me ? "You" : n[e.author]}
                  </div>
                  <EntryCard entry={e} compact who={e.author === me ? "you" : n[e.author]} />
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {months.length > 0 && (
        <nav className="index glass">
          <h2>Every month</h2>
          {[...years.entries()].map(([y, list]) => (
            <div className="year" key={y}>
              <b>{y}</b>
              <div className="months">
                {list
                  .slice()
                  .reverse()
                  .map((x) => (
                    <Link key={x.month} href={`/archive?m=${x.month}`} aria-current={x.month === month ? "page" : undefined}>
                      {shortMonth(x.month)} <span>{x.count}</span>
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </nav>
      )}
    </Shell>
  );
}

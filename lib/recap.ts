import type { Who } from "./config";
import { addDays, daysInMonth, todayIn } from "./dates";
import type { Entry } from "./types";

export interface Recap {
  month: string;
  daysInMonth: number;
  daysElapsed: number; // days of the month that have happened so far (<= daysInMonth)
  daysWithSomething: number;
  daysBoth: number;
  byAuthor: Record<Who, { total: number; photos: number; notes: number }>;
  photos: number;
  notes: number;
  longestStreak: number; // consecutive days with at least one entry
  longestBothStreak: number; // consecutive days where both posted
  photoEntries: Entry[];
  noteEntries: Entry[];
  words: number;
}

export function buildRecap(month: string, entries: Entry[], tz: string): Recap {
  const total = daysInMonth(month);
  const today = todayIn(tz);
  const thisMonth = today.slice(0, 7);
  const daysElapsed = thisMonth === month ? Number(today.slice(8)) : thisMonth < month ? 0 : total;

  const byDay = new Map<string, Set<Who>>();
  for (const e of entries) {
    if (!byDay.has(e.day)) byDay.set(e.day, new Set());
    byDay.get(e.day)!.add(e.author);
  }

  const byAuthor: Recap["byAuthor"] = {
    a: { total: 0, photos: 0, notes: 0 },
    b: { total: 0, photos: 0, notes: 0 },
  };
  let words = 0;
  for (const e of entries) {
    byAuthor[e.author].total++;
    if (e.kind === "photo") byAuthor[e.author].photos++;
    else byAuthor[e.author].notes++;
    if (e.text) words += e.text.trim().split(/\s+/).filter(Boolean).length;
  }

  let longestStreak = 0;
  let longestBothStreak = 0;
  let run = 0;
  let bothRun = 0;
  let day = `${month}-01`;
  for (let i = 0; i < total; i++) {
    const who = byDay.get(day);
    run = who ? run + 1 : 0;
    bothRun = who && who.size === 2 ? bothRun + 1 : 0;
    longestStreak = Math.max(longestStreak, run);
    longestBothStreak = Math.max(longestBothStreak, bothRun);
    day = addDays(day, 1);
  }

  const chrono = [...entries].sort((x, y) => x.day.localeCompare(y.day) || x.createdAt.localeCompare(y.createdAt));

  return {
    month,
    daysInMonth: total,
    daysElapsed,
    daysWithSomething: byDay.size,
    daysBoth: [...byDay.values()].filter((s) => s.size === 2).length,
    byAuthor,
    photos: byAuthor.a.photos + byAuthor.b.photos,
    notes: byAuthor.a.notes + byAuthor.b.notes,
    longestStreak,
    longestBothStreak,
    photoEntries: chrono.filter((e) => e.kind === "photo"),
    noteEntries: chrono.filter((e) => e.kind === "text"),
    words,
  };
}

// All "days" in the app are YYYY-MM-DD strings in the viewer's own timezone.

export function todayIn(tz: string, now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function monthOf(day: string): string {
  return day.slice(0, 7);
}

export function isValidDay(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + "T00:00:00Z");
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export function isValidMonth(s: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(s);
}

export function daysInMonth(ym: string): number {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function shiftMonth(ym: string, delta: number): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}

export function addDays(day: string, delta: number): string {
  const d = new Date(day + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00Z").getTime();
  const db = new Date(b + "T00:00:00Z").getTime();
  return Math.round((db - da) / 86400000);
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function fmtDay(day: string, opts: { weekday?: boolean; year?: boolean } = {}): string {
  const d = new Date(day + "T00:00:00Z");
  const parts: string[] = [];
  if (opts.weekday) parts.push(WEEKDAYS[d.getUTCDay()] + ",");
  parts.push(`${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`);
  if (opts.year) parts.push(String(d.getUTCFullYear()));
  return parts.join(" ");
}

export function fmtMonth(ym: string, opts: { year?: boolean } = { year: true }): string {
  const [y, m] = ym.split("-").map(Number);
  return opts.year ? `${MONTHS[m - 1]} ${y}` : MONTHS[m - 1];
}

export function monthName(ym: string): string {
  return MONTHS[Number(ym.split("-")[1]) - 1];
}

export function shortMonth(ym: string): string {
  return monthName(ym).slice(0, 3);
}

export function fmtTime(iso: string, tz: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso)).toLowerCase();
}

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

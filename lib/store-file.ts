// Local development store: a JSON file plus an uploads folder under .data/.
// Used automatically when DATABASE_URL is not set. Not for production.
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { ConflictError, type Entry, type NewEntry, type Store } from "./types";

const ROOT = path.join(process.cwd(), ".data");
const FILE = path.join(ROOT, "entries.json");
export const UPLOADS = path.join(ROOT, "uploads");

async function load(): Promise<Entry[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Entry[];
  } catch {
    return [];
  }
}

async function save(entries: Entry[]) {
  await fs.mkdir(ROOT, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(entries, null, 2));
}

const byDayDesc = (a: Entry, b: Entry) =>
  a.day === b.day ? a.createdAt.localeCompare(b.createdAt) : b.day.localeCompare(a.day);

export const fileStore: Store = {
  async getDay(day) {
    return (await load()).filter((e) => e.day === day).sort(byDayDesc);
  },
  async getMonth(ym) {
    return (await load()).filter((e) => e.day.startsWith(ym)).sort(byDayDesc);
  },
  async getMonths() {
    const counts = new Map<string, number>();
    for (const e of await load()) counts.set(e.day.slice(0, 7), (counts.get(e.day.slice(0, 7)) ?? 0) + 1);
    return [...counts].map(([month, count]) => ({ month, count })).sort((a, b) => b.month.localeCompare(a.month));
  },
  async getFirstDay() {
    const all = await load();
    return all.length ? all.map((e) => e.day).sort()[0] : null;
  },
  async count() {
    return (await load()).length;
  },
  async create(e) {
    const all = await load();
    if (all.some((x) => x.author === e.author && x.day === e.day)) throw new ConflictError();
    const entry: Entry = { id: randomUUID(), ...e, createdAt: new Date().toISOString() };
    all.push(entry);
    await save(all);
    return entry;
  },
  async delete(id, author) {
    const all = await load();
    const idx = all.findIndex((x) => x.id === id && x.author === author);
    if (idx === -1) return null;
    const [removed] = all.splice(idx, 1);
    await save(all);
    return removed;
  },
  async savePhoto(data, contentType) {
    const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
    const name = `${randomUUID()}.${ext}`;
    await fs.mkdir(UPLOADS, { recursive: true });
    await fs.writeFile(path.join(UPLOADS, name), data);
    return `/u/${name}`;
  },
};

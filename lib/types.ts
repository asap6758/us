import type { Who } from "./config";

export type Kind = "text" | "photo";

export interface Entry {
  id: string;
  author: Who;
  day: string; // YYYY-MM-DD in the author's timezone
  kind: Kind;
  text: string | null; // the note, or the caption of a photo
  imageUrl: string | null;
  width: number | null;
  height: number | null;
  createdAt: string; // ISO
}

export interface NewEntry {
  author: Who;
  day: string;
  kind: Kind;
  text: string | null;
  imageUrl: string | null;
  width: number | null;
  height: number | null;
}

export class ConflictError extends Error {
  constructor() {
    super("Already posted today");
    this.name = "ConflictError";
  }
}

export interface Store {
  getDay(day: string): Promise<Entry[]>;
  getMonth(ym: string): Promise<Entry[]>;
  /** Months that contain at least one entry, newest first. */
  getMonths(): Promise<{ month: string; count: number }[]>;
  getFirstDay(): Promise<string | null>;
  count(): Promise<number>;
  create(e: NewEntry): Promise<Entry>;
  /** Deletes an entry only if it belongs to `author`. Returns the deleted entry or null. */
  delete(id: string, author: Who): Promise<Entry | null>;
  savePhoto(data: Buffer, contentType: string): Promise<string>;
}

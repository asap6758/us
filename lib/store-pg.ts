import { Pool } from "pg";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";
import type { Who } from "./config";
import { ConflictError, type Entry, type NewEntry, type Store } from "./types";

let pool: Pool | null = null;
let ready: Promise<void> | null = null;

function getPool(): Pool {
  if (!pool) {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
    const local = /localhost|127\.0\.0\.1/.test(url);
    pool = new Pool({
      connectionString: url,
      max: 3,
      ssl: local ? undefined : { rejectUnauthorized: false },
    });
  }
  return pool;
}

async function ensureSchema() {
  if (!ready) {
    ready = getPool()
      .query(
        `CREATE TABLE IF NOT EXISTS entries (
          id uuid PRIMARY KEY,
          author text NOT NULL CHECK (author IN ('a','b')),
          day date NOT NULL,
          kind text NOT NULL CHECK (kind IN ('text','photo')),
          text text,
          image_url text,
          width integer,
          height integer,
          created_at timestamptz NOT NULL DEFAULT now(),
          UNIQUE (author, day)
        );
        CREATE INDEX IF NOT EXISTS entries_day_idx ON entries (day DESC);`,
      )
      .then(() => undefined)
      .catch((e) => {
        ready = null;
        throw e;
      });
  }
  return ready;
}

type Row = {
  id: string;
  author: Who;
  day: string;
  kind: "text" | "photo";
  text: string | null;
  image_url: string | null;
  width: number | null;
  height: number | null;
  created_at: Date;
};

const SELECT = `SELECT id, author, to_char(day, 'YYYY-MM-DD') AS day, kind, text, image_url, width, height, created_at FROM entries`;

function toEntry(r: Row): Entry {
  return {
    id: r.id,
    author: r.author,
    day: r.day,
    kind: r.kind,
    text: r.text,
    imageUrl: r.image_url,
    width: r.width,
    height: r.height,
    createdAt: new Date(r.created_at).toISOString(),
  };
}

export const pgStore: Store = {
  async getDay(day) {
    await ensureSchema();
    const { rows } = await getPool().query<Row>(`${SELECT} WHERE day = $1 ORDER BY created_at`, [day]);
    return rows.map(toEntry);
  },

  async getMonth(ym) {
    await ensureSchema();
    const { rows } = await getPool().query<Row>(
      `${SELECT} WHERE to_char(day, 'YYYY-MM') = $1 ORDER BY day DESC, created_at`,
      [ym],
    );
    return rows.map(toEntry);
  },

  async getMonths() {
    await ensureSchema();
    const { rows } = await getPool().query<{ month: string; count: string }>(
      `SELECT to_char(day, 'YYYY-MM') AS month, count(*)::text AS count
       FROM entries GROUP BY 1 ORDER BY 1 DESC`,
    );
    return rows.map((r) => ({ month: r.month, count: Number(r.count) }));
  },

  async getFirstDay() {
    await ensureSchema();
    const { rows } = await getPool().query<{ day: string | null }>(
      `SELECT to_char(min(day), 'YYYY-MM-DD') AS day FROM entries`,
    );
    return rows[0]?.day ?? null;
  },

  async count() {
    await ensureSchema();
    const { rows } = await getPool().query<{ n: string }>(`SELECT count(*)::text AS n FROM entries`);
    return Number(rows[0]?.n ?? 0);
  },

  async create(e) {
    await ensureSchema();
    const id = randomUUID();
    try {
      const { rows } = await getPool().query<Row>(
        `INSERT INTO entries (id, author, day, kind, text, image_url, width, height)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, author, to_char(day, 'YYYY-MM-DD') AS day, kind, text, image_url, width, height, created_at`,
        [id, e.author, e.day, e.kind, e.text, e.imageUrl, e.width, e.height],
      );
      return toEntry(rows[0]);
    } catch (err) {
      if ((err as { code?: string }).code === "23505") throw new ConflictError();
      throw err;
    }
  },

  async delete(id, author) {
    await ensureSchema();
    const { rows } = await getPool().query<Row>(
      `DELETE FROM entries WHERE id = $1 AND author = $2
       RETURNING id, author, to_char(day, 'YYYY-MM-DD') AS day, kind, text, image_url, width, height, created_at`,
      [id, author],
    );
    return rows[0] ? toEntry(rows[0]) : null;
  },

  async savePhoto(data, contentType) {
    const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
    const blob = await put(`photos/${randomUUID()}.${ext}`, data, {
      access: "public",
      contentType,
      addRandomSuffix: false,
    });
    return blob.url;
  },
};

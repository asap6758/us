import type { Store } from "./types";
import { pgStore } from "./store-pg";
import { fileStore } from "./store-file";

export function store(): Store {
  if (process.env.DATABASE_URL || process.env.POSTGRES_URL) return pgStore;
  if (process.env.NODE_ENV === "production" && process.env.VERCEL) {
    console.warn("[us] No DATABASE_URL set. Add a Neon database in the Vercel Storage tab.");
  }
  return fileStore;
}

export * from "./types";

import type { Store } from "./types";

export function store(): Store {
  if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return (require("./store-pg") as typeof import("./store-pg")).pgStore;
  }
  if (process.env.NODE_ENV === "production" && process.env.VERCEL) {
    console.warn("[us] No DATABASE_URL set. Add a Neon database in the Vercel Storage tab.");
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return (require("./store-file") as typeof import("./store-file")).fileStore;
}

export * from "./types";

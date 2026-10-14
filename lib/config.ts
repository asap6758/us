export type Who = "a" | "b";

export function names(): Record<Who, string> {
  const raw = process.env.NAMES || "Person 1,Person 2";
  const [a, b] = raw.split(",").map((s) => s.trim());
  return { a: a || "Person 1", b: b || "Person 2" };
}

export function other(who: Who): Who {
  return who === "a" ? "b" : "a";
}

export const APP_NAME = "us.";

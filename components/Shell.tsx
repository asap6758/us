import Link from "next/link";
import type { Who } from "@/lib/config";
import { logout } from "@/app/login/actions";
import { TzSync } from "./TzSync";
import { Heart } from "./Heart";

export function Shell({
  active,
  children,
  me,
  names,
}: {
  active: "today" | "archive" | "recap";
  children: React.ReactNode;
  me: Who;
  names: Record<Who, string>;
}) {
  return (
    <main className="shell">
      <TzSync />
      <header className="top">
        <Link href="/" className="wordmark" aria-label="Today">
          us <Heart className="" />
        </Link>
        <nav className="nav">
          <Link href="/" aria-current={active === "today" ? "page" : undefined}>
            Today
          </Link>
          <Link href="/archive" aria-current={active !== "today" ? "page" : undefined}>
            Archive
          </Link>
        </nav>
      </header>
      {children}
      <footer className="foot">
        <span>Signed in as {names[me]}</span>
        <form action={logout}>
          <button type="submit">Switch</button>
        </form>
      </footer>
    </main>
  );
}

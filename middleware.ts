import { NextResponse, type NextRequest } from "next/server";
import { verify, SESSION_COOKIE } from "@/lib/auth";

export const config = {
  runtime: "nodejs",
  matcher: ["/((?!_next|login|manifest.webmanifest|icon|apple-icon|favicon.ico).*)"],
};

export function middleware(req: NextRequest) {
  const who = verify(req.cookies.get(SESSION_COOKIE)?.value);
  if (who) return NextResponse.next();
  if (req.nextUrl.pathname.startsWith("/api") || req.nextUrl.pathname.startsWith("/u/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

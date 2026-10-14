// Serves photos from the local dev store (.data/uploads). In production photos live on Vercel Blob.
import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { UPLOADS } from "@/lib/store-file";

export async function GET(_req: Request, ctx: { params: Promise<{ name: string }> }) {
  if (!(await currentUser())) return new NextResponse("Unauthorized", { status: 401 });
  const { name } = await ctx.params;
  if (!/^[0-9a-f-]{36}\.(jpg|png|webp)$/.test(name)) return new NextResponse("Not found", { status: 404 });
  try {
    const data = await fs.readFile(path.join(UPLOADS, name));
    const type = name.endsWith("png") ? "image/png" : name.endsWith("webp") ? "image/webp" : "image/jpeg";
    return new NextResponse(new Uint8Array(data), {
      headers: { "Content-Type": type, "Cache-Control": "private, max-age=31536000, immutable" },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}

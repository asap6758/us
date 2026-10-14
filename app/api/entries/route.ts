import { NextResponse } from "next/server";
import { currentTz, currentUser } from "@/lib/auth";
import { todayIn } from "@/lib/dates";
import { store, ConflictError } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TEXT = 2000;
const MAX_PHOTO = 4 * 1024 * 1024; // Vercel function body limit is 4.5 MB; photos are compressed client-side.

export async function POST(req: Request) {
  const who = await currentUser();
  if (!who) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tz = await currentTz();
  const day = todayIn(tz);
  const form = await req.formData();
  const text = String(form.get("text") ?? "").trim().slice(0, MAX_TEXT) || null;
  const photo = form.get("photo");
  const db = store();

  // Fail fast rather than uploading a photo for a day that's already taken.
  const existing = await db.getDay(day);
  if (existing.some((e) => e.author === who)) {
    return NextResponse.json({ error: "You already added something today." }, { status: 409 });
  }

  try {
    if (photo instanceof File && photo.size > 0) {
      if (!/^image\/(jpeg|png|webp)$/.test(photo.type)) {
        return NextResponse.json({ error: "Photos need to be JPEG, PNG or WebP." }, { status: 400 });
      }
      if (photo.size > MAX_PHOTO) {
        return NextResponse.json({ error: "That photo is too large." }, { status: 413 });
      }
      const width = Number(form.get("width")) || null;
      const height = Number(form.get("height")) || null;
      const url = await db.savePhoto(Buffer.from(await photo.arrayBuffer()), photo.type);
      const entry = await db.create({ author: who, day, kind: "photo", text, imageUrl: url, width, height });
      return NextResponse.json({ entry }, { status: 201 });
    }

    if (!text) return NextResponse.json({ error: "Write something or add a photo." }, { status: 400 });
    const entry = await db.create({ author: who, day, kind: "text", text, imageUrl: null, width: null, height: null });
    return NextResponse.json({ entry }, { status: 201 });
  } catch (err) {
    if (err instanceof ConflictError) {
      return NextResponse.json({ error: "You already added something today." }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const who = await currentUser();
  if (!who) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!/^[0-9a-f-]{36}$/.test(id)) return NextResponse.json({ error: "Bad id" }, { status: 400 });

  const tz = await currentTz();
  const today = todayIn(tz);
  const db = store();
  const mine = (await db.getDay(today)).find((e) => e.id === id && e.author === who);
  // History is permanent: you can only take back what you posted today.
  if (!mine) return NextResponse.json({ error: "Only today's entry can be removed." }, { status: 403 });

  await db.delete(id, who);
  return NextResponse.json({ ok: true });
}

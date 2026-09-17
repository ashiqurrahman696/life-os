import { NextResponse } from "next/server";
import { dbFind, dbInsert, nowIso } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import type { Note } from "@/lib/types";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const notes = await dbFind<Note>("notes", { userId: user.id });
  notes.sort((a, b) => Number(b.pinned) - Number(a.pinned));
  return NextResponse.json({ notes });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (!body.title?.trim() && !body.content?.trim()) return NextResponse.json({ error: "Title or content required" }, { status: 400 });
  const now = nowIso();
  const note = await dbInsert<Note>("notes", {
    userId: user.id,
    title: body.title?.trim() || "Untitled",
    content: body.content ?? "",
    tags: Array.isArray(body.tags) ? body.tags : [],
    pinned: Boolean(body.pinned),
    createdAt: now,
    updatedAt: now,
  });
  return NextResponse.json({ note }, { status: 201 });
}

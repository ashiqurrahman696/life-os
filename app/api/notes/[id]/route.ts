import { NextResponse } from "next/server";
import { dbUpdate, dbDelete, nowIso } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import type { Note } from "@/lib/types";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const patch = await req.json();
  const allowed = ["title", "content", "tags", "pinned"] as const;
  const clean: Record<string, unknown> = { updatedAt: nowIso() };
  for (const k of allowed) if (k in patch) clean[k] = patch[k];
  const note = await dbUpdate<Note>("notes", id, user.id, clean);
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ note });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const ok = await dbDelete("notes", id, user.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

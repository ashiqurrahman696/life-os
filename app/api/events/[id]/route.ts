import { NextResponse } from "next/server";
import { dbUpdate, dbDelete, nowIso } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import type { CalEvent } from "@/lib/types";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const patch = await req.json();
  const allowed = ["title", "description", "start", "end", "allDay", "color"] as const;
  const clean: Record<string, unknown> = { updatedAt: nowIso() };
  for (const k of allowed) if (k in patch) clean[k] = patch[k];
  const event = await dbUpdate<CalEvent>("events", id, user.id, clean);
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ event });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const ok = await dbDelete("events", id, user.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

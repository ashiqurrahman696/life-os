import { NextResponse } from "next/server";
import { dbUpdate, dbDelete, nowIso } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import type { Goal } from "@/lib/types";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const patch = await req.json();
  const allowed = ["title", "description", "category", "targetDate", "progress", "milestones", "status"] as const;
  const clean: Record<string, unknown> = { updatedAt: nowIso() };
  for (const k of allowed) if (k in patch) clean[k] = patch[k];
  if (typeof clean.progress === "number") clean.progress = Math.min(100, Math.max(0, clean.progress));
  const goal = await dbUpdate<Goal>("goals", id, user.id, clean);
  if (!goal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ goal });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const ok = await dbDelete("goals", id, user.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

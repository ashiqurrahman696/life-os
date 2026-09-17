import { NextResponse } from "next/server";
import { dbUpdate, dbDelete, nowIso } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import type { Task } from "@/lib/types";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const patch = await req.json();
  const allowed = ["title", "description", "status", "priority", "dueDate", "tags"] as const;
  const clean: Record<string, unknown> = { updatedAt: nowIso() };
  for (const k of allowed) if (k in patch) clean[k] = patch[k];
  const task = await dbUpdate<Task>("tasks", id, user.id, clean);
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ task });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const ok = await dbDelete("tasks", id, user.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { dbFind, dbInsert, nowIso } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import type { Goal } from "@/lib/types";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const goals = await dbFind<Goal>("goals", { userId: user.id });
  return NextResponse.json({ goals });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (!body.title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });
  const now = nowIso();
  const goal = await dbInsert<Goal>("goals", {
    userId: user.id,
    title: body.title.trim(),
    description: body.description ?? "",
    category: body.category ?? "Personal",
    targetDate: body.targetDate ?? "",
    progress: Math.min(100, Math.max(0, Number(body.progress ?? 0))),
    milestones: Array.isArray(body.milestones) ? body.milestones : [],
    status: body.status ?? "active",
    createdAt: now,
    updatedAt: now,
  });
  return NextResponse.json({ goal }, { status: 201 });
}

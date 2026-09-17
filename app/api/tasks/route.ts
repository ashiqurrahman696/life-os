import { NextResponse } from "next/server";
import { dbFind, dbInsert, nowIso } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import type { Task } from "@/lib/types";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tasks = await dbFind<Task>("tasks", { userId: user.id });
  return NextResponse.json({ tasks });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (!body.title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });
  const now = nowIso();
  const task = await dbInsert<Task>("tasks", {
    userId: user.id,
    title: body.title.trim(),
    description: body.description ?? "",
    status: body.status ?? "todo",
    priority: body.priority ?? "medium",
    dueDate: body.dueDate ?? "",
    tags: Array.isArray(body.tags) ? body.tags : [],
    createdAt: now,
    updatedAt: now,
  });
  return NextResponse.json({ task }, { status: 201 });
}

import { NextResponse } from "next/server";
import { dbFind, dbInsert, nowIso } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import type { CalEvent } from "@/lib/types";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const events = await dbFind<CalEvent>("events", { userId: user.id }, { start: 1 });
  return NextResponse.json({ events });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (!body.title?.trim() || !body.start) return NextResponse.json({ error: "Title and start required" }, { status: 400 });
  const now = nowIso();
  const event = await dbInsert<CalEvent>("events", {
    userId: user.id,
    title: body.title.trim(),
    description: body.description ?? "",
    start: body.start,
    end: body.end ?? body.start,
    allDay: Boolean(body.allDay),
    color: body.color ?? "#6366f1",
    createdAt: now,
    updatedAt: now,
  });
  return NextResponse.json({ event }, { status: 201 });
}

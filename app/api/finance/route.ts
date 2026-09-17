import { NextResponse } from "next/server";
import { dbFind, dbInsert, nowIso } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import type { Transaction } from "@/lib/types";

const CATEGORIES = ["Food", "Transport", "Housing", "Health", "Shopping", "Entertainment", "Salary", "Freelance", "Other"];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await dbFind<Transaction>("transactions", { userId: user.id }, { date: -1 });
  const income = items.filter((t) => t.kind === "income").reduce((s, t) => s + Number(t.amount || 0), 0);
  const expense = items.filter((t) => t.kind === "expense").reduce((s, t) => s + Number(t.amount || 0), 0);
  const byCategory: Record<string, number> = {};
  for (const t of items.filter((t) => t.kind === "expense")) {
    byCategory[t.category || "Other"] = (byCategory[t.category || "Other"] || 0) + Number(t.amount || 0);
  }
  return NextResponse.json({ items, summary: { income, expense, balance: income - expense, byCategory, categories: CATEGORIES } });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const amount = Number(body.amount);
  if (!amount || amount <= 0) return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
  const now = nowIso();
  const item = await dbInsert<Transaction>("transactions", {
    userId: user.id,
    kind: body.kind === "income" ? "income" : "expense",
    amount,
    category: body.category || "Other",
    date: body.date || now.slice(0, 10),
    note: body.note ?? "",
    createdAt: now,
    updatedAt: now,
  });
  return NextResponse.json({ item }, { status: 201 });
}

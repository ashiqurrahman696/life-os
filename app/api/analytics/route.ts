import { NextResponse } from "next/server";
import { dbFind } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import type { Task, CalEvent, Goal, Note, Reminder, Project, HomeTask, Trip, Transaction, ShoppingItem, FamilyDuty, StudyEntry, KnowledgeEntry, VehicleService, Appointment, ImportantDate, EmergencyContact, Movement } from "@/lib/types";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const f = { userId: user.id };
  const [tasks, events, goals, notes, reminders, projects, homeTasks, trips, transactions, shopping, family, study, knowledge, vehicleServices, appointments, importantDates, emergencyContacts, movements] = await Promise.all([
    dbFind<Task>("tasks", f),
    dbFind<CalEvent>("events", f),
    dbFind<Goal>("goals", f),
    dbFind<Note>("notes", f),
    dbFind<Reminder>("reminders", f),
    dbFind<Project>("projects", f),
    dbFind<HomeTask>("homeTasks", f),
    dbFind<Trip>("trips", f),
    dbFind<Transaction>("transactions", f),
    dbFind<ShoppingItem>("shopping", f),
    dbFind<FamilyDuty>("family", f),
    dbFind<StudyEntry>("study", f),
    dbFind<KnowledgeEntry>("knowledge", f),
    dbFind<VehicleService>("vehicleServices", f),
    dbFind<Appointment>("appointments", f),
    dbFind<ImportantDate>("importantDates", f),
    dbFind<EmergencyContact>("emergencyContacts", f),
    dbFind<Movement>("movements", f),
  ]);

  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const income = transactions.filter((t) => t.kind === "income").reduce((s, t) => s + Number(t.amount || 0), 0);
  const expense = transactions.filter((t) => t.kind === "expense").reduce((s, t) => s + Number(t.amount || 0), 0);

  // Productivity: completed vs created in last 14 days (by updatedAt/createdAt date)
  const days: { date: string; created: number; done: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({
      date: key.slice(5),
      created: tasks.filter((t) => String(t.createdAt ?? "").slice(0, 10) === key).length,
      done: tasks.filter((t) => t.status === "done" && String(t.updatedAt ?? "").slice(0, 10) === key).length,
    });
  }

  const spendByCategory: Record<string, number> = {};
  for (const t of transactions.filter((t) => t.kind === "expense")) {
    spendByCategory[t.category || "Other"] = (spendByCategory[t.category || "Other"] || 0) + Number(t.amount || 0);
  }

  return NextResponse.json({
    productivity: days,
    completionRate: tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0,
    counts: {
      tasks: tasks.length, doneTasks, events: events.length, notes: notes.length,
      goals: goals.length, reminders: reminders.filter((r) => !r.done).length,
      projects: projects.filter((p) => p.status === "active").length,
      homeOpen: homeTasks.filter((h) => !h.done).length,
      trips: trips.length, shopping: shopping.filter((s) => !s.bought).length,
      familyOpen: family.filter((x) => !x.done).length,
      studyOpen: study.filter((s) => s.status !== "done").length,
      studyDone: study.filter((s) => s.status === "done").length,
      knowledge: knowledge.length,
      vehicleOpen: vehicleServices.filter((s) => !s.done).length,
      appointments: appointments.filter((a) => a.status === "scheduled").length,
      importantDates: importantDates.length,
      emergencyContacts: emergencyContacts.length,
      movementsOut: movements.filter((m) => m.status === "out").length,
      movementsPlanned: movements.filter((m) => m.status === "planned").length,
    },
    finance: { income, expense, balance: income - expense, spendByCategory },
    goals: goals.map((g) => ({ title: g.title, progress: g.progress })),
  });
}

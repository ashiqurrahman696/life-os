import { NextResponse } from "next/server";
import { dbFind } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import type {
  Task, CalEvent, Goal, Note, Reminder, Project, HomeTask, Trip,
  Transaction, ShoppingItem, FamilyDuty, VaultEntry, DocumentEntry,
  StudyEntry, KnowledgeEntry, VehicleService, Appointment, ImportantDate,
  EmergencyContact, Movement,
} from "@/lib/types";

export interface AttentionItem {
  label: string;
  detail: string;
  href: string;
  tone: "red" | "amber" | "indigo";
}

function daysUntil(dateStr: string, repeatYearly: boolean): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const base = new Date(`${dateStr}T00:00:00`);
  if (!repeatYearly) return Math.round((base.getTime() - today.getTime()) / 864e5);
  let next = new Date(today.getFullYear(), base.getMonth(), base.getDate());
  if (next.getTime() < today.getTime()) next = new Date(today.getFullYear() + 1, base.getMonth(), base.getDate());
  return Math.round((next.getTime() - today.getTime()) / 864e5);
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const f = { userId: user.id };
  const [
    tasks, events, goals, notes, reminders, projects, homeTasks, trips,
    transactions, shopping, family, vault, documents, study, knowledge,
    vehicleServices, appointments, importantDates, emergencyContacts, movements,
  ] = await Promise.all([
    dbFind<Task>("tasks", f),
    dbFind<CalEvent>("events", f, { start: 1 }),
    dbFind<Goal>("goals", f),
    dbFind<Note>("notes", f),
    dbFind<Reminder>("reminders", f),
    dbFind<Project>("projects", f),
    dbFind<HomeTask>("homeTasks", f),
    dbFind<Trip>("trips", f),
    dbFind<Transaction>("transactions", f),
    dbFind<ShoppingItem>("shopping", f),
    dbFind<FamilyDuty>("family", f),
    dbFind<VaultEntry>("vault", f),
    dbFind<DocumentEntry>("documents", f),
    dbFind<StudyEntry>("study", f),
    dbFind<KnowledgeEntry>("knowledge", f),
    dbFind<VehicleService>("vehicleServices", f, { dueDate: 1 }),
    dbFind<Appointment>("appointments", f, { start: 1 }),
    dbFind<ImportantDate>("importantDates", f),
    dbFind<EmergencyContact>("emergencyContacts", f),
    dbFind<Movement>("movements", f, { departAt: 1 }),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const now16 = new Date().toISOString().slice(0, 16);
  const todaysEvents = events.filter((e) => String(e.start ?? "").slice(0, 10) === today);
  const openTasks = tasks.filter((t) => t.status !== "done");
  const overdueTasks = openTasks.filter((t) => t.dueDate && t.dueDate < today);
  const avgProgress = goals.length ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length) : 0;

  // ---- Cross-module signals ----
  const overdueReminders = reminders.filter((r) => !r.done && r.remindAt < now16);
  const openReminders = reminders.filter((r) => !r.done);
  const scheduledAppts = appointments.filter((a) => a.status === "scheduled");
  const todaysAppointments = scheduledAppts.filter((a) => a.start.slice(0, 10) === today);
  const missedAppts = scheduledAppts.filter((a) => a.start < now16 && a.start.slice(0, 10) !== today);
  const outNow = movements.filter((m) => m.status === "out");
  const plannedMoves = movements.filter((m) => m.status === "planned");
  const openServices = vehicleServices.filter((s) => !s.done);
  const overdueServices = openServices.filter((s) => s.dueDate && s.dueDate < today);
  const datedWithCountdown = importantDates.map((d) => ({ ...d, days: daysUntil(d.date, d.repeatYearly) }));
  const datesThisWeek = datedWithCountdown.filter((d) => d.days >= 0 && d.days <= 7);
  const datesNext2w = datedWithCountdown.filter((d) => d.days >= 0 && d.days <= 14);
  const expiredDocs = documents.filter((d) => d.expiryDate && d.expiryDate < today);
  const income = transactions.filter((t) => t.kind === "income").reduce((s, t) => s + Number(t.amount || 0), 0);
  const expense = transactions.filter((t) => t.kind === "expense").reduce((s, t) => s + Number(t.amount || 0), 0);
  const activeProjects = projects.filter((p) => p.status === "active");
  const openHome = homeTasks.filter((h) => !h.done);
  const openTrips = trips.filter((t) => t.status !== "done");
  const toBuy = shopping.filter((s) => !s.bought);
  const openFamily = family.filter((x) => !x.done);
  const openStudy = study.filter((s) => s.status !== "done");

  const attention: AttentionItem[] = [];
  if (overdueReminders.length) attention.push({ label: `${overdueReminders.length} overdue reminder${overdueReminders.length === 1 ? "" : "s"}`, detail: overdueReminders[0].title, href: "/dashboard/reminders", tone: "red" });
  if (missedAppts.length) attention.push({ label: `${missedAppts.length} missed appointment${missedAppts.length === 1 ? "" : "s"}`, detail: missedAppts[0].title, href: "/dashboard/appointments", tone: "red" });
  if (overdueTasks.length) attention.push({ label: `${overdueTasks.length} overdue task${overdueTasks.length === 1 ? "" : "s"}`, detail: overdueTasks[0].title, href: "/dashboard/tasks", tone: "red" });
  if (overdueServices.length) attention.push({ label: `${overdueServices.length} overdue vehicle service${overdueServices.length === 1 ? "" : "s"}`, detail: overdueServices[0].title, href: "/dashboard/vehicle", tone: "amber" });
  if (expiredDocs.length) attention.push({ label: `${expiredDocs.length} expired document${expiredDocs.length === 1 ? "" : "s"}`, detail: expiredDocs[0].title, href: "/dashboard/documents", tone: "amber" });
  if (datesThisWeek.length) attention.push({ label: `${datesThisWeek.length} important date${datesThisWeek.length === 1 ? "" : "s"} this week`, detail: datesThisWeek[0].title, href: "/dashboard/dates", tone: "indigo" });
  if (outNow.length) attention.push({ label: `${outNow.length} currently out`, detail: `${outNow[0].who} → ${outNow[0].destination}`, href: "/dashboard/movements", tone: "indigo" });

  return NextResponse.json({
    stats: {
      openTasks: openTasks.length,
      doneTasks: tasks.length - openTasks.length,
      eventsToday: todaysEvents.length,
      totalEvents: events.length,
      notes: notes.length,
      goals: goals.length,
      avgProgress,
    },
    todaysEvents: todaysEvents.slice(0, 6),
    todaysAppointments: todaysAppointments.slice(0, 6).map((a) => ({
      _id: a._id, title: a.title, start: a.start, end: a.end ?? "",
      withWhom: a.withWhom ?? "", location: a.location ?? "", type: a.type,
    })),
    upcomingTasks: openTasks.slice(0, 6),
    goals: goals.slice(0, 4),
    attention: attention.slice(0, 6),
    finance: { income, expense, balance: income - expense },
    moduleCounts: {
      reminders: openReminders.length,
      projects: activeProjects.length,
      home: openHome.length,
      trips: openTrips.length,
      shopping: toBuy.length,
      family: openFamily.length,
      vault: vault.length,
      documents: expiredDocs.length || documents.length,
      study: openStudy.length,
      knowledge: knowledge.length,
      vehicle: openServices.length,
      appointments: scheduledAppts.length,
      dates: datesNext2w.length,
      emergency: emergencyContacts.length,
      movements: outNow.length + plannedMoves.length,
    } as Record<string, number>,
  });
}

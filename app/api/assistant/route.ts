import { NextResponse } from "next/server";
import { dbFind } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { runAssistant } from "@/lib/ai";
import type { Task, CalEvent, Goal, Note, StudyEntry, KnowledgeEntry, VehicleService, Appointment, ImportantDate, Movement, Reminder, Project, HomeTask, Trip, Transaction, ShoppingItem, FamilyDuty, DocumentEntry, EmergencyContact } from "@/lib/types";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { messages } = await req.json();
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }

  const [tasks, events, goals, notes, study, knowledge, vehicleServices, appointments, importantDates, movements, reminders, projects, homeTasks, trips, transactions, shopping, family, documents, emergencyContacts] = await Promise.all([
    dbFind<Task>("tasks", { userId: user.id }),
    dbFind<CalEvent>("events", { userId: user.id }, { start: 1 }),
    dbFind<Goal>("goals", { userId: user.id }),
    dbFind<Note>("notes", { userId: user.id }),
    dbFind<StudyEntry>("study", { userId: user.id }),
    dbFind<KnowledgeEntry>("knowledge", { userId: user.id }),
    dbFind<VehicleService>("vehicleServices", { userId: user.id }),
    dbFind<Appointment>("appointments", { userId: user.id }),
    dbFind<ImportantDate>("importantDates", { userId: user.id }),
    dbFind<Movement>("movements", { userId: user.id }),
    dbFind<Reminder>("reminders", { userId: user.id }),
    dbFind<Project>("projects", { userId: user.id }),
    dbFind<HomeTask>("homeTasks", { userId: user.id }),
    dbFind<Trip>("trips", { userId: user.id }),
    dbFind<Transaction>("transactions", { userId: user.id }),
    dbFind<ShoppingItem>("shopping", { userId: user.id }),
    dbFind<FamilyDuty>("family", { userId: user.id }),
    dbFind<DocumentEntry>("documents", { userId: user.id }),
    dbFind<EmergencyContact>("emergencyContacts", { userId: user.id }),
  ]);

  const openTasks = tasks.filter((t) => t.status !== "done").slice(0, 15);
  const tasksSummary = openTasks.map((t) => `- [${t.status}/${t.priority}] ${t.title}${t.dueDate ? ` (due ${t.dueDate})` : ""}`).join("\n");
  const eventsSummary = events.slice(0, 15).map((e) => `- ${e.title}: ${e.start} → ${e.end}`).join("\n");
  const goalsSummary = goals.slice(0, 10).map((g) => `- ${g.title} (${g.progress}%, ${g.status})`).join("\n");
  const notesSummary = notes.slice(0, 8).map((n) => `- ${n.title}: ${n.content.slice(0, 120)}`).join("\n");
  const studySummary = study.filter((s) => s.status !== "done").slice(0, 10).map((s) => `- [${s.status}] ${s.subject}: ${s.title}${s.dueDate ? ` (due ${s.dueDate})` : ""}`).join("\n");
  const knowledgeSummary = knowledge.slice(0, 8).map((k) => `- ${k.title} [${k.category}]: ${k.content.slice(0, 120)}`).join("\n");
  const vehicleSummary = vehicleServices.filter((s) => !s.done).slice(0, 10).map((s) => `- ${s.vehicleName}: ${s.title}${s.dueDate ? ` (due ${s.dueDate})` : ""}`).join("\n");
  const appointmentSummary = appointments.filter((a) => a.status === "scheduled").slice(0, 10).map((a) => `- ${a.title}: ${a.start}${a.withWhom ? ` with ${a.withWhom}` : ""}${a.location ? ` @ ${a.location}` : ""}`).join("\n");
  const dateSummary = importantDates.slice(0, 10).map((d) => `- ${d.title}: ${d.date}${d.person ? ` (${d.person})` : ""}${d.repeatYearly ? " [yearly]" : ""}`).join("\n");
  const movementSummary = movements.filter((m) => m.status === "planned" || m.status === "out").slice(0, 10).map((m) => `- ${m.who} → ${m.destination}: ${m.departAt} [${m.status}]`).join("\n");
  const reminderSummary = reminders.filter((r) => !r.done).slice(0, 10).map((r) => `- ${r.title}: ${r.remindAt}${r.repeat !== "none" ? ` (repeats ${r.repeat})` : ""}`).join("\n");
  const projectSummary = projects.filter((p) => p.status === "active").slice(0, 8).map((p) => `- ${p.name} [${p.status}]${p.deadline ? ` (due ${p.deadline})` : ""}`).join("\n");
  const homeSummary = homeTasks.filter((h) => !h.done).slice(0, 8).map((h) => `- ${h.title} (${h.area}, ${h.frequency})${h.dueDate ? ` due ${h.dueDate}` : ""}`).join("\n");
  const tripSummary = trips.slice(0, 8).map((t) => `- ${t.name} → ${t.destination}: ${t.startDate}–${t.endDate} [${t.status}]`).join("\n");
  const income = transactions.filter((t) => t.kind === "income").reduce((s, t) => s + Number(t.amount || 0), 0);
  const expense = transactions.filter((t) => t.kind === "expense").reduce((s, t) => s + Number(t.amount || 0), 0);
  const recentTx = transactions.slice(0, 8).map((t) => `- [${t.kind}] $${t.amount} ${t.category} (${t.date})`).join("\n");
  const financeSummary = `Income $${income}, expenses $${expense}, balance $${income - expense}.\n${recentTx}`;
  const shoppingSummary = shopping.filter((s) => !s.bought).slice(0, 10).map((s) => `- ${s.name}${s.qty ? ` x${s.qty}` : ""}`).join("\n");
  const familySummary = family.filter((x) => !x.done).slice(0, 10).map((x) => `- ${x.title}${x.member ? ` (${x.member})` : ""}${x.dueDate ? ` due ${x.dueDate}` : ""} [${x.priority}]`).join("\n");
  const today = new Date().toISOString().slice(0, 10);
  const documentSummary = documents.slice(0, 10).map((d) => `- ${d.title} [${d.category}]${d.expiryDate ? ` expires ${d.expiryDate}${d.expiryDate < today ? " (EXPIRED)" : ""}` : ""}`).join("\n");
  const emergencySummary = emergencyContacts.slice(0, 8).map((c) => `- ${c.name} (${c.relation}): ${c.phone} [${c.priority}]`).join("\n");

  try {
    const { text, demo } = await runAssistant(messages, { tasksSummary, eventsSummary, goalsSummary, notesSummary, studySummary, knowledgeSummary, vehicleSummary, appointmentSummary, dateSummary, movementSummary, reminderSummary, projectSummary, homeSummary, tripSummary, financeSummary, shoppingSummary, familySummary, documentSummary, emergencySummary });
    return NextResponse.json({ reply: text, demo });
  } catch (e) {
    console.error("assistant error", e);
    return NextResponse.json({ error: "AI request failed. Check OPENAI_API_KEY." }, { status: 500 });
  }
}

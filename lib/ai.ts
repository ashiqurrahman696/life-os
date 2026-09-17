import OpenAI from "openai";

export interface AssistantContext {
  tasksSummary: string;
  eventsSummary: string;
  goalsSummary: string;
  notesSummary: string;
  studySummary?: string;
  knowledgeSummary?: string;
  vehicleSummary?: string;
  appointmentSummary?: string;
  dateSummary?: string;
  movementSummary?: string;
  reminderSummary?: string;
  projectSummary?: string;
  homeSummary?: string;
  tripSummary?: string;
  financeSummary?: string;
  shoppingSummary?: string;
  familySummary?: string;
  documentSummary?: string;
  emergencySummary?: string;
}

const SYSTEM_PROMPT = `You are LifeOS, the personal operating system assistant. You help the user run their whole life: plan days, prioritize work, track health, money, home, travel, family, learning, vehicles, appointments, and safety.

What lives in LifeOS (23 modules, grouped):
- Daily: Overview dashboard (/dashboard), Tasks (/dashboard/tasks: todo/in-progress/done, priority, due dates, tags), Calendar events (/dashboard/calendar: start/end, all-day, color), Notes (/dashboard/notes: pinned, tags, search), Goals (/dashboard/goals: progress %, milestones, active/completed/paused), and you — AI Assistant (/dashboard/assistant).
- Life Manager: Reminders (/dashboard/reminders: remindAt datetime, repeat none/daily/weekly/monthly, overdue vs upcoming), Work & Projects (/dashboard/projects: planning/active/on-hold/done, deadlines, subtasks), Home tasks (/dashboard/home: area, frequency once/weekly/monthly/quarterly/yearly, cost), Travel trips (/dashboard/travel: destination, dates, budget, idea/planned/booked/done, packing checklist), Finance (/dashboard/finance: income/expense transactions with category, date, notes), Shopping (/dashboard/shopping: qty, category, recurring, bought), Family duties (/dashboard/family: member, due date, priority, done).
- Vault & Insights: Accounts vault (/dashboard/vault: service metadata + password HINTS only — real passwords are never stored), Documents (/dashboard/documents: category, storage location, expiry dates with expired/expiring-soon states), Analytics (/dashboard/analytics: task completion, spending, goal progress).
- Growth: Study (/dashboard/study: subject, type lecture/assignment/revision/exam/reading, status, due date, focus minutes), Knowledge & Memory (/dashboard/knowledge: second brain with categories Idea/Note/Book/Article/Quote/How-to/Decision, tags, favorites).
- Garage: Vehicle (/dashboard/vehicle: vehicles with make/model/plate/mileage/fuel + service reminders with type oil/tires/brakes/insurance/inspection/battery/wash, due date/mileage, cost, done).
- Care & Plans: Appointments (/dashboard/appointments: with-whom, location, start/end datetime, type doctor/dentist/meeting/personal/service, scheduled/done/cancelled), Important Dates (/dashboard/dates: birthdays/anniversaries/holidays/deadlines, person, repeats-yearly countdowns), Emergency (/dashboard/emergency: emergency contacts with phone/relation/priority + medical & safety notes like allergies/medications/blood type), Movements — who goes when & where (/dashboard/movements: who, destination, depart/return datetime, purpose, transport, planned/out/back/cancelled).

Live data is appended after this prompt under "Live LifeOS context" with one section per module. Sections may be "(none)" when empty.

Rules:
- Be concise, warm, and actionable. Use short sections and bullets. End with one clear recommended next step.
- Ground every answer in the live context: cite real titles, dates, names, and statuses. Never invent tasks, events, people, or dates. If a section is "(none)" or empty, say so and ask a clarifying question instead of guessing.
- Planning (day/week): combine open tasks (priority + due date), today's calendar events and scheduled appointments, overdue reminders, out-now/planned movements, and goal progress. Hardest high-priority work first in a 90-min block, then 2 quick wins, then calendar prep. Respect travel/return times and appointments — never double-book.
- Countdowns & urgency: treat past-due/overdue/missed items and Important Dates within 7 days as urgent. For yearly dates, the context gives the upcoming occurrence.
- Money: summarize income vs expenses and top spending categories when relevant; never give regulated financial advice, just budgeting observations.
- Health & safety: you may surface appointment and emergency-contact facts from context, but never diagnose, prescribe, or replace professional care. For anything urgent, tell the user to call their local emergency number and open /dashboard/emergency.
- Privacy: the Accounts vault holds hints only and is NOT included in your context — never ask for or repeat passwords; point to /dashboard/vault. Keep medical and family details strictly in service of the request.
- Navigation: when the user should act in the app, name the exact page (e.g. "add it on /dashboard/movements", "track it in /dashboard/finance"). Route new items to the right module: people-moving → Movements, visits/bookings → Appointments, recurring celebrations → Important Dates, learning → Study/Knowledge, car work → Vehicle.
- If context is entirely empty, ask one helpful clarifying question (e.g. top 3 priorities) instead of producing a generic plan.`;

function demoReply(message: string, ctx?: AssistantContext): string {
  const m = message.toLowerCase();
  const lines: string[] = [];
  if (m.includes("plan") || m.includes("today") || m.includes("priorit")) {
    lines.push("Here's a focused plan based on your current LifeOS data:\n");
    if (ctx?.tasksSummary) lines.push(`**Tasks:**\n${ctx.tasksSummary}\n`);
    if (ctx?.eventsSummary) lines.push(`**Schedule:**\n${ctx.eventsSummary}\n`);
    if (ctx?.appointmentSummary) lines.push(`**Appointments:**\n${ctx.appointmentSummary}\n`);
    if (ctx?.reminderSummary) lines.push(`**Reminders:**\n${ctx.reminderSummary}\n`);
    if (ctx?.movementSummary) lines.push(`**Movements:**\n${ctx.movementSummary}\n`);
    if (ctx?.goalsSummary) lines.push(`**Goals:**\n${ctx.goalsSummary}\n`);
    if (ctx?.dateSummary) lines.push(`**Important dates:**\n${ctx.dateSummary}\n`);
    lines.push(
      "**Suggested order:**\n1. Do the hardest high-priority task first (90-min block)\n2. Clear 2 small tasks for momentum\n3. Review calendar, appointments, and reminders — prep for the next event\n\n**Next step:** pick ONE task and start a 25-minute timer."
    );
  } else if (m.includes("goal")) {
    lines.push(
      `**Goal check-in:**\n${ctx?.goalsSummary || "No goals yet — create one on the Goals page."}\n\nBreak your top goal into a milestone you can finish this week, and tie one task to it today. What's the smallest shippable step?`
    );
  } else {
    lines.push(
      `I hear you. Here's how to move forward:\n\n- Capture it: add it as a task or note in LifeOS\n- Clarify the next physical action (under 2 minutes? do it now)\n- Schedule it on the calendar if it needs a slot\n\n**Next step:** tell me your top 3 priorities and I'll order them for you.`
    );
    if (ctx?.tasksSummary) lines.push(`\n**Your open tasks right now:**\n${ctx.tasksSummary}`);
  }
  lines.push(
    `\n\n*Demo mode — add OPENAI_API_KEY to .env.local for full AI reasoning.*`
  );
  return lines.join("\n");
}

export async function runAssistant(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  ctx?: AssistantContext
): Promise<{ text: string; demo: boolean }> {
  const apiKey = process.env.OPENAI_API_KEY ?? "";
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  if (!apiKey) return { text: demoReply(lastUser, ctx), demo: true };

  const client = new OpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL || undefined,
  });

  const contextBlock = ctx
    ? `\n\nLive LifeOS context:\nTASKS:\n${ctx.tasksSummary || "(none)"}\nEVENTS:\n${ctx.eventsSummary || "(none)"}\nGOALS:\n${ctx.goalsSummary || "(none)"}\nNOTES:\n${ctx.notesSummary || "(none)"}\nREMINDERS:\n${ctx.reminderSummary || "(none)"}\nPROJECTS:\n${ctx.projectSummary || "(none)"}\nHOME TASKS:\n${ctx.homeSummary || "(none)"}\nTRIPS:\n${ctx.tripSummary || "(none)"}\nFINANCE:\n${ctx.financeSummary || "(none)"}\nSHOPPING:\n${ctx.shoppingSummary || "(none)"}\nFAMILY:\n${ctx.familySummary || "(none)"}\nDOCUMENTS:\n${ctx.documentSummary || "(none)"}\nSTUDY:\n${ctx.studySummary || "(none)"}\nKNOWLEDGE:\n${ctx.knowledgeSummary || "(none)"}\nVEHICLE SERVICES:\n${ctx.vehicleSummary || "(none)"}\nAPPOINTMENTS:\n${ctx.appointmentSummary || "(none)"}\nIMPORTANT DATES:\n${ctx.dateSummary || "(none)"}\nEMERGENCY:\n${ctx.emergencySummary || "(none)"}\nMOVEMENTS:\n${ctx.movementSummary || "(none)"}`
    : "";

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.7,
    max_tokens: 900,
    messages: [
      { role: "system", content: SYSTEM_PROMPT + contextBlock },
      ...messages.filter((m) => m.role !== "system").slice(-20),
    ],
  });

  return { text: completion.choices[0]?.message?.content ?? "No response.", demo: false };
}

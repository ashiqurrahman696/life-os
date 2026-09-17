"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { IconType } from "react-icons";
import {
  FiAlertTriangle,
  FiBarChart2,
  FiBell,
  FiBookOpen,
  FiBriefcase,
  FiCalendar,
  FiCheckSquare,
  FiClock,
  FiCpu,
  FiDatabase,
  FiDollarSign,
  FiFileText,
  FiFolder,
  FiGift,
  FiHeart,
  FiHome,
  FiKey,
  FiMap,
  FiPlus,
  FiRefreshCw,
  FiShoppingCart,
  FiTarget,
  FiTool,
  FiUsers,
} from "react-icons/fi";
import { Card, Badge, Empty } from "@/components/ui";

interface DashboardData {
  stats: { openTasks: number; doneTasks: number; eventsToday: number; totalEvents: number; notes: number; goals: number; avgProgress: number };
  todaysEvents: { _id: string; title: string; start: string; end: string; color?: string }[];
  todaysAppointments: { _id: string; title: string; start: string; end: string; withWhom: string; location: string; type: string }[];
  upcomingTasks: { _id: string; title: string; priority: string; status: string; dueDate?: string }[];
  goals: { _id: string; title: string; progress: number; status: string }[];
  attention: { label: string; detail: string; href: string; tone: "red" | "amber" | "indigo" }[];
  finance: { income: number; expense: number; balance: number };
  moduleCounts: Record<string, number>;
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Up late";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function todayLabel(): string {
  return new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800 ${className}`} />;
}

function SectionHead({ title, href, linkLabel }: { title: string; href: string; linkLabel: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-semibold tracking-tight">{title}</h2>
      <Link href={href} className="text-xs font-medium text-zinc-500 transition hover:text-zinc-900 dark:hover:text-zinc-200">
        {linkLabel} →
      </Link>
    </div>
  );
}

const PRIORITY_TONE: Record<string, "zinc" | "amber" | "red"> = { high: "red", medium: "amber", low: "zinc" };

export default function DashboardHome() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const r = await fetch("/api/dashboard");
      const json = await r.json();
      if (!r.ok || !json || !Array.isArray(json.todaysEvents) || !Array.isArray(json.upcomingTasks) || !Array.isArray(json.goals)) {
        throw new Error(json?.error ?? `Dashboard request failed (${r.status})`);
      }
      setData(json as DashboardData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleTask(id: string, done: boolean) {
    setData((d) =>
      d ? { ...d, upcomingTasks: d.upcomingTasks.map((t) => (t._id === id ? { ...t, status: done ? "done" : "todo" } : t)) } : d
    );
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: done ? "done" : "todo" }),
    });
    load();
  }

  const stats = data?.stats;
  const todaysEvents = useMemo(() => data?.todaysEvents ?? [], [data]);
  const todaysAppointments = useMemo(() => data?.todaysAppointments ?? [], [data]);
  const upcomingTasks = useMemo(() => (data?.upcomingTasks ?? []).filter((t) => t.status !== "done"), [data]);
  const goals = useMemo(() => data?.goals ?? [], [data]);
  const attention = useMemo(() => data?.attention ?? [], [data]);
  const finance = data?.finance;
  const moduleCounts = useMemo(() => data?.moduleCounts ?? {}, [data]);
  const loading = !data && !error;
  const todayTotal = todaysEvents.length + todaysAppointments.length;
  const todaySchedule = useMemo(
    () =>
      [
        ...todaysEvents.map((e) => ({ kind: "event" as const, id: e._id, title: e.title, start: e.start, end: e.end, meta: "", color: e.color ?? "#6366f1" })),
        ...todaysAppointments.map((a) => ({
          kind: "appt" as const, id: a._id, title: a.title, start: a.start, end: a.end,
          meta: [a.withWhom ? `with ${a.withWhom}` : "", a.location ?? ""].filter(Boolean).join(" · "),
          color: "#8b5cf6",
        })),
      ].sort((x, y) => x.start.localeCompare(y.start)),
    [todaysEvents, todaysAppointments]
  );

  const statCards: { label: string; value: number | string | undefined; sub?: string; href: string; icon: IconType; tile: string }[] = [
    { label: "Open tasks", value: stats?.openTasks, sub: stats != null ? `${stats.doneTasks} completed` : undefined, href: "/dashboard/tasks", icon: FiCheckSquare, tile: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300" },
    { label: "Events today", value: stats?.eventsToday, sub: stats != null ? `${stats.totalEvents} total scheduled` : undefined, href: "/dashboard/calendar", icon: FiCalendar, tile: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300" },
    { label: "Notes captured", value: stats?.notes, sub: "Searchable & pinned", href: "/dashboard/notes", icon: FiFileText, tile: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300" },
    { label: "Goal progress", value: stats != null ? `${stats.avgProgress}%` : undefined, sub: stats != null ? `${stats.goals} active goals` : undefined, href: "/dashboard/goals", icon: FiTarget, tile: "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-950 dark:text-fuchsia-300" },
  ];

  const quickActions = [
    { label: "New task", href: "/dashboard/tasks" },
    { label: "New event", href: "/dashboard/calendar" },
    { label: "New note", href: "/dashboard/notes" },
    { label: "New goal", href: "/dashboard/goals" },
    { label: "New reminder", href: "/dashboard/reminders" },
    { label: "Log movement", href: "/dashboard/movements" },
  ];

  const modules: { label: string; href: string; icon: IconType; desc: string; countKey?: string }[] = [
    { label: "Reminders", href: "/dashboard/reminders", icon: FiBell, desc: "Never miss a thing", countKey: "reminders" },
    { label: "Work & Projects", href: "/dashboard/projects", icon: FiBriefcase, desc: "Ship your work", countKey: "projects" },
    { label: "Home", href: "/dashboard/home", icon: FiHome, desc: "Upkeep & repairs", countKey: "home" },
    { label: "Travel", href: "/dashboard/travel", icon: FiMap, desc: "Trips & packing", countKey: "trips" },
    { label: "Finance", href: "/dashboard/finance", icon: FiDollarSign, desc: "Money in & out", countKey: "finance" },
    { label: "Shopping", href: "/dashboard/shopping", icon: FiShoppingCart, desc: "Lists & recurring", countKey: "shopping" },
    { label: "Family", href: "/dashboard/family", icon: FiHeart, desc: "Care & duties", countKey: "family" },
    { label: "Accounts", href: "/dashboard/vault", icon: FiKey, desc: "Hints, not passwords", countKey: "vault" },
    { label: "Documents", href: "/dashboard/documents", icon: FiFolder, desc: "Know where all lives", countKey: "documents" },
    { label: "Analytics", href: "/dashboard/analytics", icon: FiBarChart2, desc: "Life in numbers" },
    { label: "Study", href: "/dashboard/study", icon: FiBookOpen, desc: "Sessions & exams", countKey: "study" },
    { label: "Knowledge", href: "/dashboard/knowledge", icon: FiDatabase, desc: "Second brain", countKey: "knowledge" },
    { label: "Vehicle", href: "/dashboard/vehicle", icon: FiTool, desc: "Garage & services", countKey: "vehicle" },
    { label: "Appointments", href: "/dashboard/appointments", icon: FiClock, desc: "Visits & bookings", countKey: "appointments" },
    { label: "Important Dates", href: "/dashboard/dates", icon: FiGift, desc: "Birthdays & countdowns", countKey: "dates" },
    { label: "Emergency", href: "/dashboard/emergency", icon: FiAlertTriangle, desc: "Contacts & medical", countKey: "emergency" },
    { label: "Who When Where", href: "/dashboard/movements", icon: FiUsers, desc: "Movements", countKey: "movements" },
    { label: "AI Assistant", href: "/dashboard/assistant", icon: FiCpu, desc: "Plan with live data" },
  ];

  function moduleBadge(key?: string): { text: string; tone: "zinc" | "green" | "red" } | null {
    if (!key || loading) return null;
    if (key === "finance") {
      if (finance == null) return null;
      const b = finance.balance;
      return { text: `${b < 0 ? "−$" : "$"}${Math.abs(Math.round(b)).toLocaleString()}`, tone: b < 0 ? "red" : "green" };
    }
    const n = moduleCounts[key] ?? 0;
    if (n <= 0) return null;
    return { text: String(n), tone: "zinc" };
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">{todayLabel()}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">{greeting()}. Here&apos;s your day.</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 active:scale-[0.98] disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            <FiRefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
          <Link
            href="/dashboard/assistant"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-700 active:scale-[0.98] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <FiCpu className="h-3.5 w-3.5" />
            Ask AI
          </Link>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {/* AI banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 p-5 text-white md:p-6">
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-14 right-24 h-36 w-36 rounded-full bg-black/10" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-lg">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70">✦ AI Daily Brief</p>
            <p className="mt-1 text-lg font-semibold leading-snug">
              {loading
                ? "Reading your tasks, events and goals…"
                : todayTotal === 0 && upcomingTasks.length === 0 && attention.length === 0
                  ? "A clear day. Tell me what matters most and I'll shape it into a plan."
                  : `${upcomingTasks.length} open task${upcomingTasks.length === 1 ? "" : "s"} · ${todayTotal} thing${todayTotal === 1 ? "" : "s"} today${attention.length ? ` · ${attention.length} need${attention.length === 1 ? "s" : ""} attention` : ""} · ${stats?.avgProgress ?? 0}% avg goal progress.`}
            </p>
            <p className="mt-1 text-sm text-white/75">Your assistant reads live LifeOS data — tasks, schedule, reminders, movements and more — to prioritize for you.</p>
          </div>
          <Link
            href="/dashboard/assistant"
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow transition hover:bg-indigo-50"
          >
            Plan my day →
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loading
          ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)
          : statCards.map((c) => (
              <Link key={c.label} href={c.href}>
                <Card className="group transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${c.tile}`}><c.icon className="h-4 w-4" /></span>
                    <span className="text-xs text-zinc-400 transition group-hover:translate-x-0.5">→</span>
                  </div>
                  <div className="mt-3 text-2xl font-bold tracking-tight">{c.value ?? "–"}</div>
                  <div className="text-sm font-medium">{c.label}</div>
                  {c.sub && <div className="text-xs text-zinc-500">{c.sub}</div>}
                </Card>
              </Link>
            ))}
      </div>

      {/* Needs attention — overdue & urgent across all of LifeOS */}
      {!loading && attention.length > 0 && (
        <Card className="!p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold tracking-tight">Needs attention</h2>
            <Badge tone="red">{attention.length}</Badge>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {attention.map((a) => (
              <Link
                key={`${a.href}-${a.label}`}
                href={a.href}
                className="flex items-center gap-3 rounded-xl border border-zinc-200 px-3 py-2.5 text-sm transition hover:-translate-y-0.5 hover:shadow-sm dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${a.tone === "red" ? "bg-red-500" : a.tone === "amber" ? "bg-amber-500" : "bg-indigo-500"}`} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{a.label}</span>
                  <span className="block truncate text-xs text-zinc-500">{a.detail}</span>
                </span>
                <span className="shrink-0 text-xs text-zinc-400">→</span>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Agenda + Focus */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <SectionHead title="Today's agenda" href="/dashboard/calendar" linkLabel="Calendar" />
          <div className="mt-4">
            {loading ? (
              <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : todaySchedule.length === 0 ? (
              <Empty message="Nothing scheduled today. Enjoy the open space — or add an event." />
            ) : (
              <ol className="relative space-y-1 border-l-2 border-zinc-100 pl-4 dark:border-zinc-800">
                {todaySchedule.map((s) => (
                  <li key={`${s.kind}-${s.id}`} className="relative rounded-xl px-2 py-2 transition hover:bg-zinc-50 dark:hover:bg-zinc-900">
                    <span
                      className="absolute -left-[21px] top-3 h-3 w-3 rounded-full border-2 border-white dark:border-zinc-950"
                      style={{ background: s.color }}
                    />
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {s.kind === "appt" && <span className="mr-1.5 rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-violet-700 dark:bg-violet-950 dark:text-violet-300">appt</span>}
                        {s.title}
                      </span>
                      <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                        {s.start.slice(11, 16) || "—"}{s.end ? ` → ${s.end.slice(11, 16) || "—"}` : ""}
                      </span>
                    </div>
                    {s.meta && <div className="mt-0.5 truncate text-xs text-zinc-500">{s.meta}</div>}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <SectionHead title="Focus tasks" href="/dashboard/tasks" linkLabel="All tasks" />
          <div className="mt-4 space-y-2">
            {loading ? (
              [0, 1, 2].map((i) => <Skeleton key={i} className="h-12" />)
            ) : upcomingTasks.length === 0 ? (
              <Empty message="All clear. Add a task to keep momentum." />
            ) : (
              upcomingTasks.slice(0, 5).map((t) => (
                <div
                  key={t._id}
                  className="flex items-center gap-3 rounded-xl border border-transparent px-2 py-2 transition hover:border-zinc-200 hover:bg-zinc-50 dark:hover:border-zinc-800 dark:hover:bg-zinc-900"
                >
                  <button
                    onClick={() => toggleTask(t._id, true)}
                    title="Mark done"
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-300 transition hover:border-green-500 hover:bg-green-500 hover:text-white dark:border-zinc-600"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{t.title}</div>
                    {t.dueDate && <div className="text-xs text-zinc-500">due {t.dueDate}</div>}
                  </div>
                  <Badge tone={PRIORITY_TONE[t.priority] ?? "zinc"}>{t.priority}</Badge>
                </div>
              ))
            )}
          </div>
          {!loading && upcomingTasks.length > 0 && (
            <Link
              href="/dashboard/tasks"
              className="mt-3 block rounded-xl bg-zinc-100 px-3 py-2 text-center text-xs font-medium text-zinc-600 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              + Add / manage tasks
            </Link>
          )}
        </Card>
      </div>

      {/* Goals + quick actions */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <SectionHead title="Goal momentum" href="/dashboard/goals" linkLabel="All goals" />
          <div className="mt-4 space-y-4">
            {loading ? (
              [0, 1].map((i) => <Skeleton key={i} className="h-14" />)
            ) : goals.length === 0 ? (
              <Empty message="No goals yet. Set one to start building momentum." />
            ) : (
              goals.map((g, i) => (
                <div key={g._id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate font-medium">{g.title}</span>
                    <span className="ml-2 shrink-0 text-xs font-semibold text-zinc-500">{g.progress}%</span>
                  </div>
                  <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className={`h-2.5 rounded-full bg-gradient-to-r transition-all ${
                        i % 3 === 0 ? "from-indigo-500 to-violet-500" : i % 3 === 1 ? "from-emerald-500 to-teal-500" : "from-amber-500 to-orange-500"
                      }`}
                      style={{ width: `${g.progress}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="font-semibold tracking-tight">Quick capture</h2>
          <p className="mt-1 text-xs text-zinc-500">Get it out of your head in one tap.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {quickActions.map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 text-sm font-medium transition hover:-translate-y-0.5 hover:shadow-sm dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                  <FiPlus className="h-3.5 w-3.5" />
                </span>
                {a.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 rounded-xl bg-zinc-50 p-3 text-xs leading-relaxed text-zinc-500 dark:bg-zinc-900">
            Tip: end your day with <Link href="/dashboard/assistant" className="font-semibold text-zinc-800 dark:text-zinc-100">“Review my day”</Link> — the assistant summarizes progress across everything.
          </div>
        </Card>
      </div>

      {/* More LifeOS modules */}
      <div>
        <h2 className="mb-2 font-semibold tracking-tight">More from LifeOS</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {modules.map((m) => {
            const badge = moduleBadge(m.countKey);
            return (
              <Link key={m.href} href={m.href}>
                <Card className="!p-3 transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <m.icon className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
                    {badge && <Badge tone={badge.tone}>{badge.text}</Badge>}
                  </div>
                  <div className="mt-1 text-sm font-semibold">{m.label}</div>
                  <div className="text-xs text-zinc-500">{m.desc}</div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

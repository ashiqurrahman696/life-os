"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { IconType } from "react-icons";
import {
  FiAlertTriangle,
  FiBell,
  FiBriefcase,
  FiCalendar,
  FiCheckSquare,
  FiClock,
  FiFileText,
  FiGift,
  FiHeart,
  FiHome,
  FiMap,
  FiShoppingCart,
  FiTarget,
  FiUsers,
} from "react-icons/fi";
import { Card, PageHeader, Empty } from "@/components/ui";

interface Analytics {
  productivity: { date: string; created: number; done: number }[];
  completionRate: number;
  counts: Record<string, number>;
  finance: { income: number; expense: number; balance: number; spendByCategory: Record<string, number> };
  goals: { title: string; progress: number }[];
}

const COUNT_CARDS: { key: string; label: string; href: string; icon: IconType }[] = [
  { key: "tasks", label: "Tasks", href: "/dashboard/tasks", icon: FiCheckSquare },
  { key: "events", label: "Events", href: "/dashboard/calendar", icon: FiCalendar },
  { key: "notes", label: "Notes", href: "/dashboard/notes", icon: FiFileText },
  { key: "goals", label: "Goals", href: "/dashboard/goals", icon: FiTarget },
  { key: "reminders", label: "Active reminders", href: "/dashboard/reminders", icon: FiBell },
  { key: "projects", label: "Active projects", href: "/dashboard/projects", icon: FiBriefcase },
  { key: "homeOpen", label: "Home tasks open", href: "/dashboard/home", icon: FiHome },
  { key: "trips", label: "Trips", href: "/dashboard/travel", icon: FiMap },
  { key: "shopping", label: "To buy", href: "/dashboard/shopping", icon: FiShoppingCart },
  { key: "familyOpen", label: "Family open", href: "/dashboard/family", icon: FiHeart },
  { key: "appointments", label: "Appointments", href: "/dashboard/appointments", icon: FiClock },
  { key: "importantDates", label: "Important dates", href: "/dashboard/dates", icon: FiGift },
  { key: "emergencyContacts", label: "Emergency contacts", href: "/dashboard/emergency", icon: FiAlertTriangle },
  { key: "movementsOut", label: "Out now", href: "/dashboard/movements", icon: FiUsers },
];

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error ?? `Failed (${r.status})`);
        setData(j);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  const maxProd = Math.max(1, ...(data?.productivity.map((d) => Math.max(d.created, d.done)) ?? [1]));
  const maxSpend = Math.max(1, ...Object.values(data?.finance.spendByCategory ?? { _: 1 }));

  return (
    <div>
      <PageHeader title="Personal Analytics" subtitle="Your life in numbers — last 14 days" />
      {error && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
      {!data && !error ? <p className="text-sm text-zinc-500"> crunching numbers…</p> : data && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Card className="!p-4">
              <div className="text-2xl font-bold">{data.completionRate}%</div>
              <div className="text-sm text-zinc-500">Task completion</div>
              <div className="mt-2 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${data.completionRate}%` }} />
              </div>
            </Card>
            <Card className="!p-4"><div className="text-2xl font-bold text-green-600">+${data.finance.income.toLocaleString()}</div><div className="text-sm text-zinc-500">Income</div></Card>
            <Card className="!p-4"><div className="text-2xl font-bold text-red-600">−${data.finance.expense.toLocaleString()}</div><div className="text-sm text-zinc-500">Expenses</div></Card>
            <Card className="!p-4"><div className="text-2xl font-bold">${data.finance.balance.toLocaleString()}</div><div className="text-sm text-zinc-500">Balance</div></Card>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Card>
              <h2 className="font-semibold">Task activity · 14 days</h2>
              <p className="text-xs text-zinc-500">created vs completed per day</p>
              <div className="mt-4 flex h-36 items-end gap-1.5">
                {data.productivity.map((d) => (
                  <div key={d.date} className="flex flex-1 flex-col items-center gap-1" title={`${d.date}: +${d.created} created, ✓${d.done} done`}>
                    <div className="flex w-full flex-1 items-end justify-center gap-0.5">
                      <div className="w-2.5 rounded-t bg-indigo-300 dark:bg-indigo-800" style={{ height: `${(d.created / maxProd) * 100}%`, minHeight: d.created ? 4 : 0 }} />
                      <div className="w-2.5 rounded-t bg-indigo-600" style={{ height: `${(d.done / maxProd) * 100}%`, minHeight: d.done ? 4 : 0 }} />
                    </div>
                    <span className="text-[9px] text-zinc-400">{d.date.slice(3)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-4 text-xs text-zinc-500">
                <span><span className="mr-1 inline-block h-2 w-2 rounded bg-indigo-300" /> created</span>
                <span><span className="mr-1 inline-block h-2 w-2 rounded bg-indigo-600" /> completed</span>
              </div>
            </Card>

            <Card>
              <h2 className="font-semibold">Spending by category</h2>
              <p className="text-xs text-zinc-500">all-time expenses</p>
              <div className="mt-3 space-y-2">
                {Object.keys(data.finance.spendByCategory).length === 0 ? <Empty message="No expenses tracked yet." /> :
                  Object.entries(data.finance.spendByCategory).sort((a, b) => b[1] - a[1]).slice(0, 7).map(([c, v]) => (
                    <div key={c}>
                      <div className="flex justify-between text-sm"><span className="font-medium">{c}</span><span className="text-zinc-500">${v.toLocaleString()}</span></div>
                      <div className="mt-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${(v / maxSpend) * 100}%` }} />
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          </div>

          <Card className="mt-4">
            <h2 className="font-semibold">Goal progress</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {data.goals.length === 0 ? <Empty message="No goals to analyze yet." /> :
                data.goals.map((g) => (
                  <div key={g.title}>
                    <div className="flex justify-between text-sm"><span className="truncate font-medium">{g.title}</span><span className="text-zinc-500">{g.progress}%</span></div>
                    <div className="mt-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" style={{ width: `${g.progress}%` }} />
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          <h2 className="mb-2 mt-6 font-semibold">Everything at a glance</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {COUNT_CARDS.map((c) => (
              <Link key={c.key} href={c.href}>
                <Card className="!p-3 text-center transition hover:-translate-y-0.5 hover:shadow-md">
                  <c.icon className="mx-auto h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                  <div className="mt-1 text-xl font-bold">{data.counts[c.key] ?? 0}</div>
                  <div className="text-xs text-zinc-500">{c.label}</div>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

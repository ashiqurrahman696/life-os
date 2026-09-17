"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, PageHeader, Btn, Input, Textarea, Empty } from "@/components/ui";
import type { CalEvent } from "@/lib/types";

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function daysInMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); }
function isoDay(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }

export default function CalendarPage() {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [cursor, setCursor] = useState(() => new Date());
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("09:00");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      setEvents(data.events ?? []);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const start = `${date}T${time}:00`;
    await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, start, end: start }) });
    setTitle("");
    load();
  }

  async function remove(id: string) {
    setEvents((p) => p.filter((x) => x._id !== id));
    await fetch(`/api/events/${id}`, { method: "DELETE" });
  }

  const cells = useMemo(() => {
    const first = startOfMonth(cursor);
    const lead = (first.getDay() + 6) % 7; // Monday-first
    const total = daysInMonth(cursor);
    const arr: (Date | null)[] = [...Array(lead).fill(null)];
    for (let d = 1; d <= total; d++) arr.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    return arr;
  }, [cursor]);

  const byDay = useMemo(() => {
    const m = new Map<string, CalEvent[]>();
    for (const e of events) {
      const k = String(e.start ?? "").slice(0, 10);
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(e);
    }
    return m;
  }, [events]);

  const monthLabel = cursor.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div>
      <PageHeader title="Calendar" subtitle={monthLabel} action={
        <div className="flex gap-2">
          <Btn variant="ghost" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>← Prev</Btn>
          <Btn variant="ghost" onClick={() => setCursor(new Date())}>Today</Btn>
          <Btn variant="ghost" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>Next →</Btn>
        </div>
      } />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-zinc-500">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => <div key={d} className="py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (!d) return <div key={i} />;
              const k = isoDay(d);
              const dayEvents = byDay.get(k) ?? [];
              const isToday = k === new Date().toISOString().slice(0, 10);
              return (
                <div key={i} onClick={() => setDate(k)}
                  className={`min-h-20 cursor-pointer rounded-xl border p-1 text-xs transition ${k === date ? "border-zinc-900 dark:border-white" : "border-zinc-100 dark:border-zinc-800"} ${isToday ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "hover:bg-zinc-50 dark:hover:bg-zinc-900"}`}>
                  <div className="font-semibold">{d.getDate()}</div>
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 3).map((e) => (
                      <div key={e._id} className="truncate rounded px-1 py-0.5" style={{ background: `${e.color}22`, borderLeft: `3px solid ${e.color}` }}>{e.title}</div>
                    ))}
                    {dayEvents.length > 3 && <div className="opacity-60">+{dayEvents.length - 3} more</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className="text-sm font-semibold">New event · {date}</h2>
            <form onSubmit={create} className="mt-3 space-y-2">
              <Input placeholder="Event title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <div className="flex gap-2">
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
              <Btn type="submit">Add event</Btn>
            </form>
          </Card>
          <Card>
            <h2 className="text-sm font-semibold">Agenda</h2>
            <div className="mt-3 space-y-2">
              {loading ? <p className="text-sm text-zinc-500">Loading…</p> :
                events.length === 0 ? <Empty message="No events yet. Schedule your first one." /> :
                events.slice(0, 10).map((e) => (
                  <div key={e._id} className="flex items-center gap-2 rounded-xl bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-900">
                    <span className="h-6 w-1.5 rounded-full" style={{ background: e.color }} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{e.title}</div>
                      <div className="text-xs text-zinc-500">{String(e.start ?? "").slice(0, 10)} · {String(e.start ?? "").slice(11, 16)}</div>
                    </div>
                    <button onClick={() => remove(e._id)} className="text-zinc-400 hover:text-red-600">✕</button>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

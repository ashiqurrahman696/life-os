"use client";
import { useEffect, useState } from "react";
import { Card, PageHeader, Btn, Input, Select, Badge, Empty } from "@/components/ui";
import type { Reminder } from "@/lib/types";

async function api(path: string, method = "GET", body?: unknown) {
  const res = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return res.json();
}

export default function RemindersPage() {
  const [items, setItems] = useState<Reminder[]>([]);
  const [title, setTitle] = useState("");
  const [remindAt, setRemindAt] = useState("");
  const [repeat, setRepeat] = useState<Reminder["repeat"]>("none");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const d = await api("/api/reminders");
      setItems(Array.isArray(d.items) ? d.items : []);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !remindAt) return;
    await api("/api/reminders", "POST", { title, remindAt, repeat, done: false });
    setTitle(""); setRemindAt(""); setRepeat("none");
    load();
  }

  async function toggle(r: Reminder) {
    setItems((p) => p.map((x) => (x._id === r._id ? { ...x, done: !x.done } : x)));
    await api(`/api/reminders/${r._id}`, "PATCH", { done: !r.done });
  }

  async function remove(id: string) {
    setItems((p) => p.filter((x) => x._id !== id));
    await api(`/api/reminders/${id}`, "DELETE");
  }

  const now = new Date().toISOString().slice(0, 16);
  const overdue = items.filter((r) => !r.done && r.remindAt < now);
  const upcoming = items.filter((r) => !r.done && r.remindAt >= now);
  const done = items.filter((r) => r.done);

  function row(r: Reminder, late: boolean) {
    return (
      <Card key={r._id} className="!p-3">
        <div className="flex items-center gap-3">
          <button onClick={() => toggle(r)} className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${r.done ? "border-green-500 bg-green-500 text-white" : "border-zinc-300 dark:border-zinc-600"}`}>
            {r.done ? "✓" : ""}
          </button>
          <div className="min-w-0 flex-1">
            <div className={`truncate text-sm font-medium ${r.done ? "text-zinc-400 line-through" : ""}`}>{r.title}</div>
            <div className="mt-0.5 flex flex-wrap gap-2 text-xs text-zinc-500">
              <span className={late ? "font-semibold text-red-600" : ""}>⏰ {r.remindAt.replace("T", " ")}</span>
              {r.repeat !== "none" && <Badge tone="indigo">↻ {r.repeat}</Badge>}
            </div>
          </div>
          <button onClick={() => remove(r._id)} className="rounded-lg px-2 py-1 text-sm text-zinc-400 hover:text-red-600">✕</button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader title="Reminders" subtitle={overdue.length ? `${overdue.length} overdue — catch up!` : "Never miss a thing."} />
      <Card>
        <form onSubmit={create} className="flex flex-col gap-2 md:flex-row">
          <Input placeholder="Remind me to…" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input type="datetime-local" value={remindAt} onChange={(e) => setRemindAt(e.target.value)} className="md:w-56" />
          <Select value={repeat} onChange={(e) => setRepeat(e.target.value as Reminder["repeat"])}>
            <option value="none">No repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </Select>
          <Btn type="submit">Add</Btn>
        </form>
      </Card>
      <div className="mt-4 space-y-2">
        {loading ? <p className="text-sm text-zinc-500">Loading…</p> : (
          <>
            {overdue.length > 0 && (<><p className="text-xs font-semibold uppercase tracking-widest text-red-500">Overdue</p>{overdue.map((r) => row(r, true))}</>)}
            <p className="pt-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">Upcoming</p>
            {upcoming.length === 0 && overdue.length === 0 ? <Empty message="No active reminders." /> : upcoming.map((r) => row(r, false))}
            {done.length > 0 && (<><p className="pt-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">Done</p>{done.map((r) => row(r, false))}</>)}
          </>
        )}
      </div>
    </div>
  );
}

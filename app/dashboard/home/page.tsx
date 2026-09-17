"use client";
import { useEffect, useState } from "react";
import { Card, PageHeader, Btn, Input, Select, Badge, Empty } from "@/components/ui";
import type { HomeTask } from "@/lib/types";

async function api(path: string, method = "GET", body?: unknown) {
  const res = await fetch(path, { method, headers: { "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) });
  return res.json();
}

const AREAS = ["Kitchen", "Bathroom", "Bedroom", "Living Room", "Garden", "Garage", "Plumbing", "Electrical", "Appliances", "General"];

export default function HomePage() {
  const [items, setItems] = useState<HomeTask[]>([]);
  const [title, setTitle] = useState("");
  const [area, setArea] = useState("General");
  const [frequency, setFrequency] = useState<HomeTask["frequency"]>("once");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const d = await api("/api/home");
      setItems(Array.isArray(d.items) ? d.items : []);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await api("/api/home", "POST", { title, area, frequency, dueDate, done: false });
    setTitle(""); setDueDate("");
    load();
  }

  async function toggle(t: HomeTask) {
    setItems((p) => p.map((x) => (x._id === t._id ? { ...x, done: !x.done } : x)));
    await api(`/api/home/${t._id}`, "PATCH", { done: !t.done });
  }

  async function remove(id: string) {
    setItems((p) => p.filter((x) => x._id !== id));
    await api(`/api/home/${id}`, "DELETE");
  }

  const open = items.filter((t) => !t.done);
  const done = items.filter((t) => t.done);

  return (
    <div>
      <PageHeader title="Home Maintenance" subtitle={`${open.length} open · track chores, repairs and upkeep`} />
      <Card>
        <form onSubmit={create} className="flex flex-col gap-2 md:flex-row">
          <Input placeholder="e.g. Fix leaking tap, service AC…" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Select value={area} onChange={(e) => setArea(e.target.value)}>
            {AREAS.map((a) => <option key={a}>{a}</option>)}
          </Select>
          <Select value={frequency} onChange={(e) => setFrequency(e.target.value as HomeTask["frequency"])}>
            <option value="once">Once</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </Select>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="md:w-44" />
          <Btn type="submit">Add</Btn>
        </form>
      </Card>
      <div className="mt-4 space-y-2">
        {loading ? <p className="text-sm text-zinc-500">Loading…</p> :
          items.length === 0 ? <Empty message="Home sweet home — nothing to fix. Add upkeep tasks here." /> : (
          <>
            {open.map((t) => (
              <Card key={t._id} className="!p-3">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggle(t)} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-600" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{t.title}</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-500">
                      <Badge tone="indigo">{t.area}</Badge>
                      <Badge tone="zinc">{t.frequency}</Badge>
                      {t.dueDate && <span>due {t.dueDate}</span>}
                    </div>
                  </div>
                  <button onClick={() => remove(t._id)} className="text-zinc-400 hover:text-red-600">✕</button>
                </div>
              </Card>
            ))}
            {done.length > 0 && (<><p className="pt-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">Completed</p>{done.map((t) => (
              <Card key={t._id} className="!p-3 opacity-60">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggle(t)} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-green-500 bg-green-500 text-white text-xs">✓</button>
                  <div className="flex-1 truncate text-sm line-through">{t.title}</div>
                  <button onClick={() => remove(t._id)} className="text-zinc-400 hover:text-red-600">✕</button>
                </div>
              </Card>
            ))}</>)}
          </>
        )}
      </div>
    </div>
  );
}

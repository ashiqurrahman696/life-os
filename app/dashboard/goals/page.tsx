"use client";
import { useEffect, useState } from "react";
import { Card, PageHeader, Btn, Input, Textarea, Select, Badge, Empty } from "@/components/ui";
import type { Goal } from "@/lib/types";

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Personal");
  const [targetDate, setTargetDate] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/goals");
      const data = await res.json();
      setGoals(data.goals ?? []);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await fetch("/api/goals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, category, targetDate }) });
    setTitle(""); setTargetDate("");
    load();
  }

  async function patch(id: string, p: Partial<Goal>) {
    setGoals((prev) => prev.map((g) => (g._id === id ? { ...g, ...p } : g)));
    await fetch(`/api/goals/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) });
  }

  async function remove(id: string) {
    setGoals((p) => p.filter((g) => g._id !== id));
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
  }

  async function toggleMilestone(g: Goal, idx: number) {
    const milestones = g.milestones.map((m, i) => (i === idx ? { ...m, done: !m.done } : m));
    const done = milestones.filter((m) => m.done).length;
    const progress = milestones.length ? Math.round((done / milestones.length) * 100) : g.progress;
    patch(g._id, { milestones, progress });
  }

  async function addMilestone(g: Goal, text: string) {
    if (!text.trim()) return;
    patch(g._id, { milestones: [...g.milestones, { title: text.trim(), done: false }] });
  }

  return (
    <div>
      <PageHeader title="Goals" subtitle="Big outcomes, broken into milestones." />
      <Card>
        <form onSubmit={create} className="flex flex-col gap-2 md:flex-row">
          <Input placeholder="New goal… e.g. Run a 10k" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            {["Personal", "Health", "Career", "Finance", "Learning", "Relationships"].map((c) => <option key={c}>{c}</option>)}
          </Select>
          <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="md:w-44" />
          <Btn type="submit">Add goal</Btn>
        </form>
      </Card>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {loading ? <p className="text-sm text-zinc-500">Loading…</p> :
          goals.length === 0 ? <div className="md:col-span-2"><Empty message="No goals yet. Add your first goal above." /></div> :
          goals.map((g) => (
            <Card key={g._id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{g.title}</div>
                  <div className="mt-1 flex gap-2 text-xs text-zinc-500">
                    <Badge tone="indigo">{g.category}</Badge>
                    {g.targetDate && <span>target {g.targetDate}</span>}
                    <Badge tone={g.status === "completed" ? "green" : "zinc"}>{g.status}</Badge>
                  </div>
                </div>
                <button onClick={() => remove(g._id)} className="text-zinc-400 hover:text-red-600">✕</button>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <input type="range" min={0} max={100} value={g.progress} onChange={(e) => patch(g._id, { progress: Number(e.target.value) })} className="flex-1" />
                <span className="w-12 text-right text-sm font-semibold">{g.progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div className="h-2 rounded-full bg-indigo-500 transition-all" style={{ width: `${g.progress}%` }} />
              </div>

              <div className="mt-3 space-y-1">
                {g.milestones.map((m, i) => (
                  <label key={i} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900">
                    <input type="checkbox" checked={m.done} onChange={() => toggleMilestone(g, i)} />
                    <span className={m.done ? "text-zinc-400 line-through" : ""}>{m.title}</span>
                  </label>
                ))}
              </div>
              <MilestoneInput onAdd={(t) => addMilestone(g, t)} />
              <div className="mt-3 flex gap-2">
                <Select value={g.status} onChange={(e) => patch(g._id, { status: e.target.value as Goal["status"] })} className="!py-1 text-xs">
                  <option value="active">active</option>
                  <option value="completed">completed</option>
                  <option value="paused">paused</option>
                </Select>
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
}

function MilestoneInput({ onAdd }: { onAdd: (t: string) => void }) {
  const [v, setV] = useState("");
  return (
    <form onSubmit={(e) => { e.preventDefault(); onAdd(v); setV(""); }} className="mt-2 flex gap-2">
      <Input placeholder="+ Add milestone" value={v} onChange={(e) => setV(e.target.value)} className="!py-1 text-sm" />
      <Btn variant="ghost" type="submit">Add</Btn>
    </form>
  );
}

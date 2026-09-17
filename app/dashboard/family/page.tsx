"use client";
import { useEffect, useState } from "react";
import { Card, PageHeader, Btn, Input, Select, Badge, Empty } from "@/components/ui";
import type { FamilyDuty } from "@/lib/types";

async function api(path: string, method = "GET", body?: unknown) {
  const res = await fetch(path, { method, headers: { "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) });
  return res.json();
}

export default function FamilyPage() {
  const [items, setItems] = useState<FamilyDuty[]>([]);
  const [title, setTitle] = useState("");
  const [member, setMember] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<FamilyDuty["priority"]>("medium");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const d = await api("/api/family");
      setItems(Array.isArray(d.items) ? d.items : []);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await api("/api/family", "POST", { title, member, dueDate, priority, done: false });
    setTitle(""); setMember(""); setDueDate("");
    load();
  }

  async function toggle(f: FamilyDuty) {
    setItems((p) => p.map((x) => (x._id === f._id ? { ...x, done: !x.done } : x)));
    await api(`/api/family/${f._id}`, "PATCH", { done: !f.done });
  }

  async function remove(id: string) {
    setItems((p) => p.filter((x) => x._id !== id));
    await api(`/api/family/${id}`, "DELETE");
  }

  const open = items.filter((i) => !i.done);
  const doneItems = items.filter((i) => i.done);

  return (
    <div>
      <PageHeader title="Family Responsibilities" subtitle={`${open.length} open · who needs what`} />
      <Card>
        <form onSubmit={create} className="flex flex-col gap-2 md:flex-row">
          <Input placeholder="e.g. Call mom, school fees, pickup…" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="For whom?" value={member} onChange={(e) => setMember(e.target.value)} className="md:w-36" />
          <Select value={priority} onChange={(e) => setPriority(e.target.value as FamilyDuty["priority"])}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="md:w-44" />
          <Btn type="submit">Add</Btn>
        </form>
      </Card>
      <div className="mt-4 space-y-2">
        {loading ? <p className="text-sm text-zinc-500">Loading…</p> :
          items.length === 0 ? <Empty message="Nobody needs anything. Enjoy the peace — or plan something nice." /> : (
          <>
            {open.map((f) => (
              <Card key={f._id} className="!p-3">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggle(f)} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-600" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{f.title}</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-500">
                      {f.member && <Badge tone="indigo">♡ {f.member}</Badge>}
                      <Badge tone={f.priority === "high" ? "red" : f.priority === "medium" ? "amber" : "zinc"}>{f.priority}</Badge>
                      {f.dueDate && <span>due {f.dueDate}</span>}
                    </div>
                  </div>
                  <button onClick={() => remove(f._id)} className="text-zinc-400 hover:text-red-600">✕</button>
                </div>
              </Card>
            ))}
            {doneItems.length > 0 && (<><p className="pt-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">Done ♡</p>{doneItems.map((f) => (
              <Card key={f._id} className="!p-3 opacity-60">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggle(f)} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-green-500 bg-green-500 text-xs text-white">✓</button>
                  <div className="flex-1 truncate text-sm line-through">{f.title}{f.member ? ` · ${f.member}` : ""}</div>
                  <button onClick={() => remove(f._id)} className="text-zinc-400 hover:text-red-600">✕</button>
                </div>
              </Card>
            ))}</>)}
          </>
        )}
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { Card, PageHeader, Btn, Input, Textarea, Select, Badge, Empty } from "@/components/ui";
import type { Project } from "@/lib/types";

async function api(path: string, method = "GET", body?: unknown) {
  const res = await fetch(path, { method, headers: { "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) });
  return res.json();
}

const STATUS_TONE: Record<Project["status"], "zinc" | "amber" | "green" | "indigo"> = { planning: "indigo", active: "green", "on-hold": "amber", done: "zinc" };

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const d = await api("/api/projects");
      setProjects(Array.isArray(d.items) ? d.items : []);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await api("/api/projects", "POST", { name, deadline, status: "planning", subtasks: [] });
    setName(""); setDeadline("");
    load();
  }

  async function patch(id: string, p: Partial<Project>) {
    setProjects((prev) => prev.map((g) => (g._id === id ? { ...g, ...p } : g)));
    await api(`/api/projects/${id}`, "PATCH", p);
  }

  async function remove(id: string) {
    setProjects((p) => p.filter((g) => g._id !== id));
    await api(`/api/projects/${id}`, "DELETE");
  }

  return (
    <div>
      <PageHeader title="Work & Projects" subtitle={`${projects.filter((p) => p.status === "active").length} active projects`} />
      <Card>
        <form onSubmit={create} className="flex flex-col gap-2 md:flex-row">
          <Input placeholder="New project… e.g. Website redesign" value={name} onChange={(e) => setName(e.target.value)} />
          <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="md:w-44" />
          <Btn type="submit">Add project</Btn>
        </form>
      </Card>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {loading ? <p className="text-sm text-zinc-500">Loading…</p> :
          projects.length === 0 ? <div className="md:col-span-2"><Empty message="No projects yet. Add your first one above." /></div> :
          projects.map((p) => {
            const doneCount = p.subtasks.filter((s) => s.done).length;
            const pct = p.subtasks.length ? Math.round((doneCount / p.subtasks.length) * 100) : 0;
            return (
              <Card key={p._id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold">{p.name}</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-500">
                      <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>
                      {p.deadline && <span>deadline {p.deadline}</span>}
                      <span>{doneCount}/{p.subtasks.length} subtasks</span>
                    </div>
                  </div>
                  <button onClick={() => remove(p._id)} className="text-zinc-400 hover:text-red-600">✕</button>
                </div>
                <div className="mt-2 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div className="h-2 rounded-full bg-indigo-500 transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-2 space-y-1">
                  {p.subtasks.map((s, i) => (
                    <label key={i} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900">
                      <input type="checkbox" checked={s.done} onChange={() => patch(p._id, { subtasks: p.subtasks.map((x, j) => (j === i ? { ...x, done: !x.done } : x)) })} />
                      <span className={s.done ? "text-zinc-400 line-through" : ""}>{s.title}</span>
                    </label>
                  ))}
                </div>
                <SubtaskInput onAdd={(t) => patch(p._id, { subtasks: [...p.subtasks, { title: t, done: false }] })} />
                <div className="mt-2 flex gap-2">
                  <Select value={p.status} onChange={(e) => patch(p._id, { status: e.target.value as Project["status"] })} className="!py-1 text-xs">
                    <option value="planning">planning</option>
                    <option value="active">active</option>
                    <option value="on-hold">on-hold</option>
                    <option value="done">done</option>
                  </Select>
                </div>
              </Card>
            );
          })}
      </div>
    </div>
  );
}

function SubtaskInput({ onAdd }: { onAdd: (t: string) => void }) {
  const [v, setV] = useState("");
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (v.trim()) { onAdd(v.trim()); setV(""); } }} className="mt-2 flex gap-2">
      <Input placeholder="+ Add subtask" value={v} onChange={(e) => setV(e.target.value)} className="!py-1 text-sm" />
      <Btn variant="ghost" type="submit">Add</Btn>
    </form>
  );
}

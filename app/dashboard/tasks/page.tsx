"use client";
import { useEffect, useState } from "react";
import { Card, PageHeader, Btn, Input, Textarea, Select, Badge, Empty } from "@/components/ui";
import type { Task, TaskStatus, Priority } from "@/lib/types";

const STATUS_TONE: Record<TaskStatus, "zinc" | "amber" | "green"> = { todo: "zinc", "in-progress": "amber", done: "green" };

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<"all" | TaskStatus>("all");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data.tasks ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, priority, dueDate }),
    });
    setTitle(""); setDueDate(""); setPriority("medium");
    load();
  }

  async function setStatus(t: Task, status: TaskStatus) {
    setTasks((p) => p.map((x) => (x._id === t._id ? { ...x, status } : x)));
    await fetch(`/api/tasks/${t._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
  }

  async function remove(id: string) {
    setTasks((p) => p.filter((x) => x._id !== id));
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  }

  const shown = tasks.filter((t) => (filter === "all" ? true : t.status === filter));

  return (
    <div>
      <PageHeader title="Tasks" subtitle={`${tasks.filter((t) => t.status !== "done").length} open · ${tasks.filter((t) => t.status === "done").length} done`} />
      <Card>
        <form onSubmit={create} className="flex flex-col gap-2 md:flex-row">
          <Input placeholder="Add a task… e.g. Finish project proposal" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="md:w-44" />
          <Btn type="submit">Add</Btn>
        </form>
      </Card>

      <div className="mt-4 flex gap-2">
        {(["all", "todo", "in-progress", "done"] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-3 py-1 text-xs font-medium ${filter === s ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"}`}>
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {loading ? <p className="text-sm text-zinc-500">Loading…</p> :
          shown.length === 0 ? <Empty message="No tasks here. Add one above to get started." /> :
          shown.map((t) => (
            <Card key={t._id} className="!p-3">
              <div className="flex items-center gap-3">
                <button onClick={() => setStatus(t, t.status === "done" ? "todo" : "done")} title="Toggle done"
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${t.status === "done" ? "border-green-500 bg-green-500 text-white" : "border-zinc-300 dark:border-zinc-600"}`}>
                  {t.status === "done" ? "✓" : ""}
                </button>
                <div className="min-w-0 flex-1">
                  <div className={`truncate text-sm font-medium ${t.status === "done" ? "text-zinc-400 line-through" : ""}`}>{t.title}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                    <Badge tone={STATUS_TONE[t.status]}>{t.status}</Badge>
                    <Badge tone={t.priority === "high" ? "red" : t.priority === "medium" ? "amber" : "zinc"}>{t.priority}</Badge>
                    {t.dueDate && <span>due {t.dueDate}</span>}
                  </div>
                </div>
                <Select value={t.status} onChange={(e) => setStatus(t, e.target.value as TaskStatus)} className="!w-auto !py-1 text-xs">
                  <option value="todo">todo</option>
                  <option value="in-progress">in-progress</option>
                  <option value="done">done</option>
                </Select>
                <button onClick={() => remove(t._id)} className="rounded-lg px-2 py-1 text-sm text-zinc-400 hover:bg-red-50 hover:text-red-600">✕</button>
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
}

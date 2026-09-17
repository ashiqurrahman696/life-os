"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, PageHeader, Btn, Input, Textarea, Select, Badge, Empty } from "@/components/ui";
import type { StudyEntry } from "@/lib/types";

async function api(path: string, method = "GET", body?: unknown) {
  const res = await fetch(path, { method, headers: { "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) });
  return res.json();
}

const TYPES: StudyEntry["type"][] = ["lecture", "assignment", "revision", "exam", "reading", "other"];
const STATUSES: StudyEntry["status"][] = ["todo", "in-progress", "done"];

const STATUS_TONE: Record<string, "zinc" | "amber" | "green"> = { todo: "zinc", "in-progress": "amber", done: "green" };

export default function StudyPage() {
  const [items, setItems] = useState<StudyEntry[]>([]);
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<StudyEntry["type"]>("revision");
  const [dueDate, setDueDate] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const [notes, setNotes] = useState("");
  const [filterSubject, setFilterSubject] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const d = await api("/api/study");
      setItems(Array.isArray(d.items) ? d.items : []);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !title.trim()) return;
    await api("/api/study", "POST", {
      subject: subject.trim(),
      title: title.trim(),
      type,
      status: "todo",
      dueDate: dueDate || undefined,
      durationMin: durationMin ? Number(durationMin) : undefined,
      notes: notes || undefined,
    });
    setSubject(""); setTitle(""); setDueDate(""); setDurationMin(""); setNotes("");
    load();
  }

  async function setStatus(item: StudyEntry, status: StudyEntry["status"]) {
    setItems((p) => p.map((x) => (x._id === item._id ? { ...x, status } : x)));
    await api(`/api/study/${item._id}`, "PATCH", { status });
  }

  async function remove(id: string) {
    setItems((p) => p.filter((x) => x._id !== id));
    await api(`/api/study/${id}`, "DELETE");
  }

  const subjects = useMemo(() => ["All", ...Array.from(new Set(items.map((i) => i.subject).filter(Boolean)))], [items]);
  const shown = useMemo(
    () => items.filter((i) => (filterSubject === "All" || i.subject === filterSubject) && (filterStatus === "All" || i.status === filterStatus)),
    [items, filterSubject, filterStatus]
  );
  const done = items.filter((i) => i.status === "done").length;
  const totalMin = items.filter((i) => i.status === "done").reduce((s, i) => s + Number(i.durationMin || 0), 0);
  const today = new Date().toISOString().slice(0, 10);
  const overdue = items.filter((i) => i.status !== "done" && i.dueDate && i.dueDate < today).length;

  return (
    <div>
      <PageHeader title="Study" subtitle={overdue ? `${overdue} overdue — catch up!` : "Subjects, sessions and exam prep."} />
      <div className="grid grid-cols-3 gap-3">
        <Card className="!p-4"><div className="text-xl font-bold">{items.length}</div><div className="text-sm text-zinc-500">Sessions</div></Card>
        <Card className="!p-4"><div className="text-xl font-bold text-green-600">{done}</div><div className="text-sm text-zinc-500">Completed</div></Card>
        <Card className="!p-4"><div className="text-xl font-bold">{totalMin}m</div><div className="text-sm text-zinc-500">Focused time</div></Card>
      </div>

      <Card className="mt-4">
        <form onSubmit={create} className="grid gap-2 md:grid-cols-3">
          <Input placeholder="Subject (e.g. Physics)" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <Input placeholder="What to study? (e.g. Ch. 5 thermodynamics)" value={title} onChange={(e) => setTitle(e.target.value)} className="md:col-span-2" />
          <Select value={type} onChange={(e) => setType(e.target.value as StudyEntry["type"])}>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <Input type="number" min="0" placeholder="Minutes (optional)" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} />
          <Textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} className="md:col-span-2" rows={2} />
          <Btn type="submit">Add session</Btn>
        </form>
      </Card>

      <div className="mt-4 flex flex-wrap gap-2">
        <Select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
          {subjects.map((s) => <option key={s}>{s}</option>)}
        </Select>
        <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          {["All", ...STATUSES].map((s) => <option key={s}>{s}</option>)}
        </Select>
      </div>

      <div className="mt-3 space-y-2">
        {loading ? <p className="text-sm text-zinc-500">Loading…</p> :
          shown.length === 0 ? <Empty message="No study sessions yet. Add your first one above." /> :
          shown.map((s) => (
            <Card key={s._id} className="!p-3">
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className={`truncate text-sm font-medium ${s.status === "done" ? "text-zinc-400 line-through" : ""}`}>{s.title}</div>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-500">
                    <Badge tone="indigo">{s.subject}</Badge>
                    <Badge tone={STATUS_TONE[s.status]}>{s.status}</Badge>
                    <span>{s.type}</span>
                    {s.dueDate && <span className={s.status !== "done" && s.dueDate < today ? "font-semibold text-red-600" : ""}>due {s.dueDate}</span>}
                    {s.durationMin ? <span>{s.durationMin}m</span> : null}
                  </div>
                  {s.notes && <p className="mt-1 truncate text-xs text-zinc-500">{s.notes}</p>}
                </div>
                <Select value={s.status} onChange={(e) => setStatus(s, e.target.value as StudyEntry["status"])} className="!w-auto text-xs">
                  {STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
                </Select>
                <button onClick={() => remove(s._id)} className="text-zinc-400 hover:text-red-600">✕</button>
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
}

"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, PageHeader, Btn, Input, Textarea, Select, Badge, Empty } from "@/components/ui";
import type { Appointment } from "@/lib/types";

async function api(path: string, method = "GET", body?: unknown) {
  const res = await fetch(path, { method, headers: { "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) });
  return res.json();
}

const TYPES: Appointment["type"][] = ["doctor", "dentist", "meeting", "personal", "service", "other"];

const TYPE_TONE: Record<string, "zinc" | "green" | "amber" | "red" | "indigo"> = {
  doctor: "red", dentist: "amber", meeting: "indigo", personal: "zinc", service: "green", other: "zinc",
};

export default function AppointmentsPage() {
  const [items, setItems] = useState<Appointment[]>([]);
  const [title, setTitle] = useState("");
  const [withWhom, setWithWhom] = useState("");
  const [location, setLocation] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [type, setType] = useState<Appointment["type"]>("meeting");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const d = await api("/api/appointments");
      setItems(Array.isArray(d.items) ? d.items : []);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !start) return;
    await api("/api/appointments", "POST", {
      title: title.trim(), withWhom: withWhom || undefined, location: location || undefined,
      start, end: end || undefined, type, status: "scheduled", notes: notes || undefined,
    });
    setTitle(""); setWithWhom(""); setLocation(""); setStart(""); setEnd(""); setNotes("");
    load();
  }

  async function setStatus(item: Appointment, status: Appointment["status"]) {
    setItems((p) => p.map((x) => (x._id === item._id ? { ...x, status } : x)));
    await api(`/api/appointments/${item._id}`, "PATCH", { status });
  }

  async function remove(id: string) {
    setItems((p) => p.filter((x) => x._id !== id));
    await api(`/api/appointments/${id}`, "DELETE");
  }

  const now = new Date().toISOString().slice(0, 16);
  const today = now.slice(0, 10);
  const scheduled = useMemo(() => items.filter((a) => a.status === "scheduled"), [items]);
  const todays = scheduled.filter((a) => a.start.slice(0, 10) === today);
  const upcoming = scheduled.filter((a) => a.start.slice(0, 10) > today);
  const past = scheduled.filter((a) => a.start < now && a.start.slice(0, 10) !== today);
  const finished = useMemo(() => items.filter((a) => a.status !== "scheduled"), [items]);

  function row(a: Appointment, late: boolean) {
    return (
      <Card key={a._id} className="!p-3">
        <div className="flex items-center gap-3">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold ${late ? "bg-red-100 text-red-700" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"}`}>◷</span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{a.title}</div>
            <div className="mt-0.5 flex flex-wrap gap-2 text-xs text-zinc-500">
              <Badge tone={TYPE_TONE[a.type] ?? "zinc"}>{a.type}</Badge>
              <span className={late ? "font-semibold text-red-600" : "font-medium"}>{a.start.replace("T", " ")}{a.end ? ` → ${a.end.slice(11, 16) || a.end}` : ""}</span>
              {a.withWhom && <span>👤 {a.withWhom}</span>}
              {a.location && <span>📍 {a.location}</span>}
            </div>
            {a.notes && <p className="mt-1 truncate text-xs text-zinc-500">{a.notes}</p>}
          </div>
          {a.status === "scheduled" && (
            <div className="flex shrink-0 gap-1">
              <button onClick={() => setStatus(a, "done")} title="Mark done" className="rounded-lg px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50">✓</button>
              <button onClick={() => setStatus(a, "cancelled")} title="Cancel" className="rounded-lg px-2 py-1 text-xs text-zinc-400 hover:text-amber-600">⊘</button>
              <button onClick={() => remove(a._id)} className="rounded-lg px-2 py-1 text-sm text-zinc-400 hover:text-red-600">✕</button>
            </div>
          )}
          {a.status !== "scheduled" && (
            <div className="flex shrink-0 items-center gap-2">
              <Badge tone={a.status === "done" ? "green" : "zinc"}>{a.status}</Badge>
              <button onClick={() => remove(a._id)} className="text-zinc-400 hover:text-red-600">✕</button>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader title="Appointments" subtitle={todays.length ? `${todays.length} today — be on time!` : "Doctor visits, meetings and bookings."} />
      <div className="grid grid-cols-3 gap-3">
        <Card className="!p-4"><div className="text-xl font-bold">{todays.length}</div><div className="text-sm text-zinc-500">Today</div></Card>
        <Card className="!p-4"><div className="text-xl font-bold">{upcoming.length}</div><div className="text-sm text-zinc-500">Upcoming</div></Card>
        <Card className="!p-4"><div className={`text-xl font-bold ${past.length ? "text-red-600" : ""}`}>{past.length}</div><div className="text-sm text-zinc-500">Missed</div></Card>
      </div>

      <Card className="mt-4">
        <form onSubmit={create} className="grid gap-2 md:grid-cols-3">
          <Input placeholder="Title (e.g. Dentist checkup)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="With whom? (optional)" value={withWhom} onChange={(e) => setWithWhom(e.target.value)} />
          <Input placeholder="Where? (clinic, office…)" value={location} onChange={(e) => setLocation(e.target.value)} />
          <Input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
          <Input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
          <Select value={type} onChange={(e) => setType(e.target.value as Appointment["type"])}>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </Select>
          <Textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="md:col-span-2" />
          <Btn type="submit">Book appointment</Btn>
        </form>
      </Card>

      <div className="mt-4 space-y-2">
        {loading ? <p className="text-sm text-zinc-500">Loading…</p> : (
          <>
            {todays.length > 0 && (<><p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Today</p>{todays.map((a) => row(a, false))}</>)}
            {past.length > 0 && (<><p className="pt-2 text-xs font-semibold uppercase tracking-widest text-red-500">Missed — reschedule or close</p>{past.map((a) => row(a, true))}</>)}
            <p className="pt-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">Upcoming</p>
            {upcoming.length === 0 && todays.length === 0 && past.length === 0 ? <Empty message="No scheduled appointments." /> : upcoming.map((a) => row(a, false))}
            {finished.length > 0 && (<><p className="pt-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">Done / cancelled</p>{finished.map((a) => row(a, false))}</>)}
          </>
        )}
      </div>
    </div>
  );
}

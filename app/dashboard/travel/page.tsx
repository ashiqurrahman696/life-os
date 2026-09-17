"use client";
import { useEffect, useState } from "react";
import { Card, PageHeader, Btn, Input, Textarea, Select, Badge, Empty } from "@/components/ui";
import type { Trip } from "@/lib/types";

async function api(path: string, method = "GET", body?: unknown) {
  const res = await fetch(path, { method, headers: { "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) });
  return res.json();
}

const STATUS_TONE: Record<Trip["status"], "zinc" | "amber" | "green" | "indigo"> = { idea: "zinc", planned: "indigo", booked: "amber", done: "green" };

export default function TravelPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const d = await api("/api/trips");
      setTrips(Array.isArray(d.items) ? d.items : []);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !destination.trim()) return;
    await api("/api/trips", "POST", { name, destination, startDate, endDate, status: "idea", checklist: [] });
    setName(""); setDestination(""); setStartDate(""); setEndDate("");
    load();
  }

  async function patch(id: string, p: Partial<Trip>) {
    setTrips((prev) => prev.map((t) => (t._id === id ? { ...t, ...p } : t)));
    await api(`/api/trips/${id}`, "PATCH", p);
  }

  async function remove(id: string) {
    setTrips((p) => p.filter((t) => t._id !== id));
    await api(`/api/trips/${id}`, "DELETE");
  }

  return (
    <div>
      <PageHeader title="Travel Planning" subtitle="Ideas → booked → memories" />
      <Card>
        <form onSubmit={create} className="grid gap-2 md:grid-cols-5">
          <Input placeholder="Trip name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Destination" value={destination} onChange={(e) => setDestination(e.target.value)} />
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <Btn type="submit">Add trip</Btn>
        </form>
      </Card>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {loading ? <p className="text-sm text-zinc-500">Loading…</p> :
          trips.length === 0 ? <div className="md:col-span-2"><Empty message="No trips yet. Where to next?" /></div> :
          trips.map((t) => {
            const doneCount = t.checklist.filter((c) => c.done).length;
            return (
              <Card key={t._id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-base font-semibold">✈ {t.name}</div>
                    <div className="text-sm text-zinc-500">{t.destination}</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-500">
                      <Badge tone={STATUS_TONE[t.status]}>{t.status}</Badge>
                      {(t.startDate || t.endDate) && <span>{t.startDate || "?"} → {t.endDate || "?"}</span>}
                      {t.budget ? <span>budget ${t.budget}</span> : null}
                    </div>
                  </div>
                  <button onClick={() => remove(t._id)} className="text-zinc-400 hover:text-red-600">✕</button>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Input type="number" placeholder="Budget $" value={t.budget ?? ""} onChange={(e) => patch(t._id, { budget: Number(e.target.value) || undefined })} className="!w-32 !py-1 text-sm" />
                  <Select value={t.status} onChange={(e) => patch(t._id, { status: e.target.value as Trip["status"] })} className="!py-1 text-xs">
                    <option value="idea">idea</option>
                    <option value="planned">planned</option>
                    <option value="booked">booked</option>
                    <option value="done">done</option>
                  </Select>
                  <span className="ml-auto text-xs text-zinc-500">{doneCount}/{t.checklist.length} packed</span>
                </div>
                <div className="mt-2 space-y-1">
                  {t.checklist.map((c, i) => (
                    <label key={i} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900">
                      <input type="checkbox" checked={c.done} onChange={() => patch(t._id, { checklist: t.checklist.map((x, j) => (j === i ? { ...x, done: !x.done } : x)) })} />
                      <span className={c.done ? "text-zinc-400 line-through" : ""}>{c.title}</span>
                    </label>
                  ))}
                </div>
                <ChecklistInput onAdd={(title) => patch(t._id, { checklist: [...t.checklist, { title, done: false }] })} />
              </Card>
            );
          })}
      </div>
    </div>
  );
}

function ChecklistInput({ onAdd }: { onAdd: (t: string) => void }) {
  const [v, setV] = useState("");
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (v.trim()) { onAdd(v.trim()); setV(""); } }} className="mt-2 flex gap-2">
      <Input placeholder="+ Passport, tickets, hotel…" value={v} onChange={(e) => setV(e.target.value)} className="!py-1 text-sm" />
      <Btn variant="ghost" type="submit">Add</Btn>
    </form>
  );
}

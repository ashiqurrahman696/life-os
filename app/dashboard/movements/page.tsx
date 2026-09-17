"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, PageHeader, Btn, Input, Select, Badge, Empty } from "@/components/ui";
import type { Movement } from "@/lib/types";

async function api(path: string, method = "GET", body?: unknown) {
  const res = await fetch(path, { method, headers: { "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) });
  return res.json();
}

const STATUS_TONE: Record<string, "zinc" | "amber" | "green" | "indigo"> = {
  planned: "indigo", out: "amber", back: "green", cancelled: "zinc",
};

export default function MovementsPage() {
  const [items, setItems] = useState<Movement[]>([]);
  const [who, setWho] = useState("");
  const [destination, setDestination] = useState("");
  const [departAt, setDepartAt] = useState("");
  const [returnAt, setReturnAt] = useState("");
  const [purpose, setPurpose] = useState("");
  const [transport, setTransport] = useState("");
  const [notes, setNotes] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const d = await api("/api/movements");
      setItems(Array.isArray(d.items) ? d.items : []);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!who.trim() || !destination.trim() || !departAt) return;
    await api("/api/movements", "POST", {
      who: who.trim(), destination: destination.trim(), departAt,
      returnAt: returnAt || undefined, purpose: purpose || undefined,
      transport: transport || undefined, status: "planned", notes: notes || undefined,
    });
    setWho(""); setDestination(""); setDepartAt(""); setReturnAt(""); setPurpose(""); setTransport(""); setNotes("");
    load();
  }

  async function setStatus(item: Movement, status: Movement["status"]) {
    setItems((p) => p.map((x) => (x._id === item._id ? { ...x, status } : x)));
    await api(`/api/movements/${item._id}`, "PATCH", { status });
  }

  async function remove(id: string) {
    setItems((p) => p.filter((x) => x._id !== id));
    await api(`/api/movements/${id}`, "DELETE");
  }

  const q = query.toLowerCase();
  const filtered = useMemo(
    () => items.filter((m) => !q || m.who.toLowerCase().includes(q) || m.destination.toLowerCase().includes(q)),
    [items, q]
  );
  const outNow = filtered.filter((m) => m.status === "out");
  const planned = filtered.filter((m) => m.status === "planned");
  const finished = filtered.filter((m) => m.status === "back" || m.status === "cancelled");

  function row(m: Movement) {
    return (
      <Card key={m._id} className="!p-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 font-bold text-white dark:bg-white dark:text-zinc-900">
            {m.who.trim().charAt(0).toUpperCase() || "?"}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{m.who} → {m.destination}</div>
            <div className="mt-0.5 flex flex-wrap gap-2 text-xs text-zinc-500">
              <Badge tone={STATUS_TONE[m.status]}>{m.status}</Badge>
              <span>🕒 {m.departAt.replace("T", " ")}{m.returnAt ? ` ⇢ ${m.returnAt.replace("T", " ")}` : ""}</span>
              {m.purpose && <span>🎯 {m.purpose}</span>}
              {m.transport && <span>🚕 {m.transport}</span>}
            </div>
            {m.notes && <p className="mt-1 truncate text-xs text-zinc-500">{m.notes}</p>}
          </div>
          <div className="flex shrink-0 gap-1">
            {m.status === "planned" && <button onClick={() => setStatus(m, "out")} title="Mark out" className="rounded-lg px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50">Out</button>}
            {m.status === "out" && <button onClick={() => setStatus(m, "back")} title="Mark back" className="rounded-lg px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50">Back ✓</button>}
            {(m.status === "planned" || m.status === "out") && <button onClick={() => setStatus(m, "cancelled")} title="Cancel" className="rounded-lg px-2 py-1 text-xs text-zinc-400 hover:text-amber-600">⊘</button>}
            <button onClick={() => remove(m._id)} className="rounded-lg px-2 py-1 text-sm text-zinc-400 hover:text-red-600">✕</button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader title="Who goes when & where" subtitle={outNow.length ? `${outNow.length} currently out — stay in touch.` : "Family movements, pickups and visits."} />
      <div className="grid grid-cols-3 gap-3">
        <Card className="!p-4"><div className={`text-xl font-bold ${outNow.length ? "text-amber-600" : ""}`}>{outNow.length}</div><div className="text-sm text-zinc-500">Out now</div></Card>
        <Card className="!p-4"><div className="text-xl font-bold">{planned.length}</div><div className="text-sm text-zinc-500">Planned</div></Card>
        <Card className="!p-4"><div className="text-xl font-bold">{filtered.filter((m) => m.status === "back").length}</div><div className="text-sm text-zinc-500">Back home</div></Card>
      </div>

      <Card className="mt-4">
        <form onSubmit={create} className="grid gap-2 md:grid-cols-4">
          <Input placeholder="Who? (e.g. Ayesha)" value={who} onChange={(e) => setWho(e.target.value)} />
          <Input placeholder="Where to? (school, office…)" value={destination} onChange={(e) => setDestination(e.target.value)} />
          <Input type="datetime-local" value={departAt} onChange={(e) => setDepartAt(e.target.value)} />
          <Input type="datetime-local" value={returnAt} onChange={(e) => setReturnAt(e.target.value)} />
          <Input placeholder="Purpose (optional)" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
          <Input placeholder="Transport (bus, car…)" value={transport} onChange={(e) => setTransport(e.target.value)} />
          <Input placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <Btn type="submit">Log movement</Btn>
        </form>
      </Card>

      <div className="mt-4 flex gap-2">
        <Input placeholder="Search who or where…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Select value="" onChange={(e) => { if (e.target.value) setStatus(filtered.find((m) => m._id === e.target.value)!, "back"); }}>
          <option value="">Quick: mark back…</option>
          {outNow.map((m) => <option key={m._id} value={m._id}>{m.who} → {m.destination}</option>)}
        </Select>
      </div>

      <div className="mt-3 space-y-2">
        {loading ? <p className="text-sm text-zinc-500">Loading…</p> : filtered.length === 0 ? <Empty message="Nobody logged yet. Add the first movement above." /> : (
          <>
            {outNow.length > 0 && (<><p className="text-xs font-semibold uppercase tracking-widest text-amber-600">Out now</p>{outNow.map(row)}</>)}
            {planned.length > 0 && (<><p className="pt-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">Planned</p>{planned.map(row)}</>)}
            {finished.length > 0 && (<><p className="pt-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">Back / cancelled</p>{finished.map(row)}</>)}
          </>
        )}
      </div>
    </div>
  );
}

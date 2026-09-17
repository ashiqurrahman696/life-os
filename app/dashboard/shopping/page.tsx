"use client";
import { useEffect, useState } from "react";
import { Card, PageHeader, Btn, Input, Select, Badge, Empty } from "@/components/ui";
import type { ShoppingItem } from "@/lib/types";

async function api(path: string, method = "GET", body?: unknown) {
  const res = await fetch(path, { method, headers: { "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) });
  return res.json();
}

export default function ShoppingPage() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [frequency, setFrequency] = useState("weekly");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const d = await api("/api/shopping");
      setItems(Array.isArray(d.items) ? d.items : []);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await api("/api/shopping", "POST", { name, qty, recurring, frequency: recurring ? frequency : "", bought: false });
    setName(""); setQty(""); setRecurring(false);
    load();
  }

  async function toggle(s: ShoppingItem) {
    setItems((p) => p.map((x) => (x._id === s._id ? { ...x, bought: !x.bought } : x)));
    await api(`/api/shopping/${s._id}`, "PATCH", { bought: !s.bought });
  }

  async function remove(id: string) {
    setItems((p) => p.filter((x) => x._id !== id));
    await api(`/api/shopping/${id}`, "DELETE");
  }

  async function clearBought() {
    const bought = items.filter((i) => i.bought && !i.recurring);
    setItems((p) => p.filter((i) => !(i.bought && !i.recurring)));
    await Promise.all(bought.map((i) => api(`/api/shopping/${i._id}`, "DELETE")));
  }

  const toBuy = items.filter((i) => !i.bought);
  const bought = items.filter((i) => i.bought);

  function row(s: ShoppingItem) {
    return (
      <Card key={s._id} className="!p-3">
        <div className="flex items-center gap-3">
          <button onClick={() => toggle(s)} className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${s.bought ? "border-green-500 bg-green-500 text-white" : "border-zinc-300 dark:border-zinc-600"}`}>
            {s.bought ? "✓" : ""}
          </button>
          <div className="min-w-0 flex-1">
            <span className={`text-sm font-medium ${s.bought ? "text-zinc-400 line-through" : ""}`}>{s.name}</span>
            {s.qty && <span className="ml-2 text-xs text-zinc-500">× {s.qty}</span>}
            {s.recurring && <Badge tone="indigo"><span className="ml-1">↻ {s.frequency || "recurring"}</span></Badge>}
          </div>
          <button onClick={() => remove(s._id)} className="text-zinc-400 hover:text-red-600">✕</button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader title="Shopping & Recurring" subtitle={`${toBuy.length} to buy`} action={bought.length > 0 ? <Btn variant="ghost" onClick={clearBought}>Clear bought</Btn> : undefined} />
      <Card>
        <form onSubmit={create} className="flex flex-col gap-2 md:flex-row md:items-center">
          <Input placeholder="e.g. Oat milk, detergent…" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Qty" value={qty} onChange={(e) => setQty(e.target.value)} className="md:w-24" />
          <label className="flex items-center gap-2 whitespace-nowrap text-sm">
            <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} /> Recurring
          </label>
          {recurring && (
            <Select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="as-needed">As needed</option>
            </Select>
          )}
          <Btn type="submit">Add</Btn>
        </form>
      </Card>
      <div className="mt-4 space-y-2">
        {loading ? <p className="text-sm text-zinc-500">Loading…</p> : (
          <>
            {toBuy.length === 0 && bought.length === 0 ? <Empty message="List is empty. Add what you need." /> : toBuy.map(row)}
            {bought.length > 0 && (<><p className="pt-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">Bought</p>{bought.map(row)}</>)}
          </>
        )}
      </div>
    </div>
  );
}

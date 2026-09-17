"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, PageHeader, Btn, Input, Textarea, Select, Badge, Empty } from "@/components/ui";
import type { DocumentEntry } from "@/lib/types";

async function api(path: string, method = "GET", body?: unknown) {
  const res = await fetch(path, { method, headers: { "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) });
  return res.json();
}

const CATS = ["Identity", "Property", "Vehicle", "Health", "Finance", "Education", "Legal", "Other"];

export default function DocumentsPage() {
  const [items, setItems] = useState<DocumentEntry[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Identity");
  const [location, setLocation] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const d = await api("/api/documents");
      setItems(Array.isArray(d.items) ? d.items : []);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await api("/api/documents", "POST", { title, category, location, expiryDate });
    setTitle(""); setLocation(""); setExpiryDate("");
    load();
  }

  async function remove(id: string) {
    setItems((p) => p.filter((x) => x._id !== id));
    await api(`/api/documents/${id}`, "DELETE");
  }

  const q = query.toLowerCase();
  const shown = useMemo(() => items.filter((d) => !q || d.title.toLowerCase().includes(q) || d.category.toLowerCase().includes(q)), [items, q]);
  const today = new Date().toISOString().slice(0, 10);
  const expiring = shown.filter((d) => d.expiryDate && d.expiryDate < today);

  return (
    <div>
      <PageHeader title="Important Documents" subtitle={expiring.length ? `⚠ ${expiring.length} expired — renew soon` : "Know where everything lives"} />
      <Card>
        <form onSubmit={create} className="grid gap-2 md:grid-cols-5">
          <Input placeholder="e.g. Passport, lease agreement" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATS.map((c) => <option key={c}>{c}</option>)}
          </Select>
          <Input placeholder="Where is it? (drawer, folder…)" value={location} onChange={(e) => setLocation(e.target.value)} />
          <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
          <Btn type="submit">Add</Btn>
        </form>
      </Card>
      <Input placeholder="Search documents…" value={query} onChange={(e) => setQuery(e.target.value)} className="mt-4" />
      <div className="mt-3 space-y-2">
        {loading ? <p className="text-sm text-zinc-500">Loading…</p> :
          shown.length === 0 ? <Empty message="No documents indexed yet." /> :
          shown.map((d) => {
            const expired = d.expiryDate && d.expiryDate < today;
            const soon = d.expiryDate && !expired && d.expiryDate < new Date(Date.now() + 60 * 864e5).toISOString().slice(0, 10);
            return (
              <Card key={d._id} className="!p-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🗂</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{d.title}</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-500">
                      <Badge tone="indigo">{d.category}</Badge>
                      {d.location && <span>📍 {d.location}</span>}
                      {d.expiryDate && <span className={expired ? "font-semibold text-red-600" : soon ? "font-semibold text-amber-600" : ""}>expires {d.expiryDate}</span>}
                    </div>
                  </div>
                  <button onClick={() => remove(d._id)} className="text-zinc-400 hover:text-red-600">✕</button>
                </div>
              </Card>
            );
          })}
      </div>
    </div>
  );
}

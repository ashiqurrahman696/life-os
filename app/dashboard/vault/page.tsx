"use client";
import { useEffect, useState } from "react";
import { Card, PageHeader, Btn, Input, Textarea, Select, Badge, Empty } from "@/components/ui";
import type { VaultEntry } from "@/lib/types";

async function api(path: string, method = "GET", body?: unknown) {
  const res = await fetch(path, { method, headers: { "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) });
  return res.json();
}

const CATS = ["Social", "Email", "Banking", "Work", "Shopping", "Streaming", "Utilities", "Other"];

export default function VaultPage() {
  const [items, setItems] = useState<VaultEntry[]>([]);
  const [service, setService] = useState("");
  const [username, setUsername] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("Social");
  const [passwordHint, setPasswordHint] = useState("");
  const [query, setQuery] = useState("");
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const d = await api("/api/vault");
      setItems(Array.isArray(d.items) ? d.items : []);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!service.trim()) return;
    await api("/api/vault", "POST", { service, username, url, category, passwordHint, lastChanged: new Date().toISOString().slice(0, 10) });
    setService(""); setUsername(""); setUrl(""); setPasswordHint("");
    load();
  }

  async function remove(id: string) {
    setItems((p) => p.filter((x) => x._id !== id));
    await api(`/api/vault/${id}`, "DELETE");
  }

  const q = query.toLowerCase();
  const shown = items.filter((v) => !q || v.service.toLowerCase().includes(q) || (v.username ?? "").toLowerCase().includes(q));

  return (
    <div>
      <PageHeader title="Accounts & Passwords" subtitle="Metadata + hints only — LifeOS never stores actual passwords" />
      <Card className="!border-amber-200 !bg-amber-50 dark:!border-amber-900 dark:!bg-amber-950">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          🔒 Security note: store <strong>hints</strong> (e.g. “blue notebook p.3” or “usual + birth year”), never the password itself. Use a dedicated password manager for secrets.
        </p>
      </Card>
      <Card className="mt-4">
        <form onSubmit={create} className="grid gap-2 md:grid-cols-3">
          <Input placeholder="Service (e.g. Gmail)" value={service} onChange={(e) => setService(e.target.value)} />
          <Input placeholder="Username / email" value={username} onChange={(e) => setUsername(e.target.value)} />
          <Input placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} />
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATS.map((c) => <option key={c}>{c}</option>)}
          </Select>
          <Input placeholder="Password hint (not the password!)" value={passwordHint} onChange={(e) => setPasswordHint(e.target.value)} />
          <Btn type="submit">Save entry</Btn>
        </form>
      </Card>
      <Input placeholder="Search accounts…" value={query} onChange={(e) => setQuery(e.target.value)} className="mt-4" />
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {loading ? <p className="text-sm text-zinc-500">Loading…</p> :
          shown.length === 0 ? <div className="md:col-span-2"><Empty message="No saved accounts." /></div> :
          shown.map((v) => (
            <Card key={v._id} className="!p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">🔑 {v.service}</div>
                  {v.username && <div className="text-sm text-zinc-500">{v.username}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="indigo">{v.category}</Badge>
                  <button onClick={() => remove(v._id)} className="text-zinc-400 hover:text-red-600">✕</button>
                </div>
              </div>
              {v.url && <a href={v.url.startsWith("http") ? v.url : `https://${v.url}`} target="_blank" rel="noreferrer" className="mt-1 block truncate text-sm text-indigo-600 hover:underline">{v.url}</a>}
              {v.passwordHint && (
                <button onClick={() => setRevealed((r) => ({ ...r, [v._id]: !r[v._id] }))} className="mt-2 w-full rounded-lg bg-zinc-100 px-3 py-1.5 text-left text-xs dark:bg-zinc-800">
                  {revealed[v._id] ? `Hint: ${v.passwordHint}` : "Click to reveal hint"}
                </button>
              )}
              {v.lastChanged && <p className="mt-1 text-xs text-zinc-400">Last changed: {v.lastChanged}</p>}
            </Card>
          ))}
      </div>
    </div>
  );
}

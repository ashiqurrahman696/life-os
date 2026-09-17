"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, PageHeader, Btn, Input, Textarea, Select, Badge, Empty } from "@/components/ui";
import type { ImportantDate } from "@/lib/types";

async function api(path: string, method = "GET", body?: unknown) {
  const res = await fetch(path, { method, headers: { "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) });
  return res.json();
}

const CATS: ImportantDate["category"][] = ["birthday", "anniversary", "holiday", "deadline", "other"];

function nextOccurrence(dateStr: string, repeatYearly: boolean): { next: string; days: number } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const base = new Date(`${dateStr}T00:00:00`);
  if (!repeatYearly) {
    const days = Math.round((base.getTime() - today.getTime()) / 864e5);
    return { next: dateStr, days };
  }
  let next = new Date(today.getFullYear(), base.getMonth(), base.getDate());
  if (next.getTime() < today.getTime()) next = new Date(today.getFullYear() + 1, base.getMonth(), base.getDate());
  const days = Math.round((next.getTime() - today.getTime()) / 864e5);
  return { next: next.toISOString().slice(0, 10), days };
}

export default function DatesPage() {
  const [items, setItems] = useState<ImportantDate[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState<ImportantDate["category"]>("birthday");
  const [person, setPerson] = useState("");
  const [repeatYearly, setRepeatYearly] = useState(true);
  const [notes, setNotes] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const d = await api("/api/important-dates");
      setItems(Array.isArray(d.items) ? d.items : []);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date) return;
    await api("/api/important-dates", "POST", {
      title: title.trim(), date, category, person: person || undefined, repeatYearly, notes: notes || undefined,
    });
    setTitle(""); setDate(""); setPerson(""); setNotes("");
    load();
  }

  async function remove(id: string) {
    setItems((p) => p.filter((x) => x._id !== id));
    await api(`/api/important-dates/${id}`, "DELETE");
  }

  const q = query.toLowerCase();
  const withCountdown = useMemo(
    () =>
      items
        .filter((d) => !q || d.title.toLowerCase().includes(q) || (d.person ?? "").toLowerCase().includes(q))
        .map((d) => ({ ...d, ...nextOccurrence(d.date, d.repeatYearly) }))
        .sort((a, b) => a.days - b.days),
    [items, q]
  );
  const thisWeek = withCountdown.filter((d) => d.days >= 0 && d.days <= 7);
  const upcoming = withCountdown.filter((d) => d.days > 7);
  const passed = withCountdown.filter((d) => d.days < 0);

  function row(d: typeof withCountdown[number]) {
    const urgent = d.days >= 0 && d.days <= 7;
    return (
      <Card key={d._id} className="!p-3">
        <div className="flex items-center gap-3">
          <span className={`flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl ${urgent ? "bg-red-100 text-red-700" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"}`}>
            <span className="text-sm font-bold leading-none">{d.days < 0 ? "–" : d.days}</span>
            <span className="text-[9px] leading-none">days</span>
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{d.title}</div>
            <div className="mt-0.5 flex flex-wrap gap-2 text-xs text-zinc-500">
              <Badge tone={d.category === "birthday" ? "green" : d.category === "anniversary" ? "indigo" : "zinc"}>{d.category}</Badge>
              {d.person && <span>👤 {d.person}</span>}
              <span title={d.repeatYearly ? "Repeats every year" : "One-time"}>{d.repeatYearly ? `↻ ${d.next.slice(5)}` : d.date}</span>
            </div>
            {d.notes && <p className="mt-1 truncate text-xs text-zinc-500">{d.notes}</p>}
          </div>
          <button onClick={() => remove(d._id)} className="text-zinc-400 hover:text-red-600">✕</button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader title="Important Dates" subtitle={thisWeek.length ? `${thisWeek.length} coming up this week!` : "Birthdays, anniversaries and deadlines."} />
      <Card>
        <form onSubmit={create} className="grid gap-2 md:grid-cols-4">
          <Input placeholder="e.g. Mom's birthday" value={title} onChange={(e) => setTitle(e.target.value)} className="md:col-span-2" />
          <Select value={category} onChange={(e) => setCategory(e.target.value as ImportantDate["category"])}>
            {CATS.map((c) => <option key={c}>{c}</option>)}
          </Select>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input placeholder="Person (optional)" value={person} onChange={(e) => setPerson(e.target.value)} />
          <label className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700">
            <input type="checkbox" checked={repeatYearly} onChange={(e) => setRepeatYearly(e.target.checked)} />
            Repeats yearly
          </label>
          <Input placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <Btn type="submit">Add date</Btn>
        </form>
      </Card>

      <Input placeholder="Search dates or people…" value={query} onChange={(e) => setQuery(e.target.value)} className="mt-4" />

      <div className="mt-3 space-y-2">
        {loading ? <p className="text-sm text-zinc-500">Loading…</p> : withCountdown.length === 0 ? <Empty message="No important dates yet." /> : (
          <>
            {thisWeek.length > 0 && (<><p className="text-xs font-semibold uppercase tracking-widest text-red-500">This week</p>{thisWeek.map(row)}</>)}
            {upcoming.length > 0 && (<><p className="pt-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">Upcoming</p>{upcoming.map(row)}</>)}
            {passed.length > 0 && (<><p className="pt-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">Passed (one-time)</p>{passed.map(row)}</>)}
          </>
        )}
      </div>
    </div>
  );
}

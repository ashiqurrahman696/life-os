"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, PageHeader, Btn, Input, Textarea, Select, Badge, Empty } from "@/components/ui";
import type { KnowledgeEntry } from "@/lib/types";

async function api(path: string, method = "GET", body?: unknown) {
  const res = await fetch(path, { method, headers: { "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) });
  return res.json();
}

const CATS = ["Idea", "Note", "Book", "Article", "Quote", "How-to", "Decision", "Other"];

export default function KnowledgePage() {
  const [items, setItems] = useState<KnowledgeEntry[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Note");
  const [tags, setTags] = useState("");
  const [query, setQuery] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [onlyFav, setOnlyFav] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const d = await api("/api/knowledge");
      setItems(Array.isArray(d.items) ? d.items : []);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    await api("/api/knowledge", "POST", {
      title: title.trim(),
      content: content.trim(),
      category,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      favorite: false,
    });
    setTitle(""); setContent(""); setTags("");
    load();
  }

  async function toggleFav(item: KnowledgeEntry) {
    setItems((p) => p.map((x) => (x._id === item._id ? { ...x, favorite: !x.favorite } : x)));
    await api(`/api/knowledge/${item._id}`, "PATCH", { favorite: !item.favorite });
  }

  async function remove(id: string) {
    setItems((p) => p.filter((x) => x._id !== id));
    await api(`/api/knowledge/${id}`, "DELETE");
  }

  const q = query.toLowerCase();
  const shown = useMemo(
    () =>
      items.filter(
        (k) =>
          (!onlyFav || k.favorite) &&
          (filterCat === "All" || k.category === filterCat) &&
          (!q || k.title.toLowerCase().includes(q) || k.content.toLowerCase().includes(q) || k.tags.join(" ").toLowerCase().includes(q))
      ),
    [items, q, filterCat, onlyFav]
  );

  return (
    <div>
      <PageHeader title="Knowledge & Memory" subtitle="Your second brain — capture everything worth remembering." />
      <Card>
        <form onSubmit={create} className="grid gap-2">
          <div className="grid gap-2 md:grid-cols-3">
            <Input placeholder="Title (e.g. Mentorship notes)" value={title} onChange={(e) => setTitle(e.target.value)} className="md:col-span-2" />
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATS.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </div>
          <Textarea placeholder="What did you learn? Write it in your own words…" value={content} onChange={(e) => setContent(e.target.value)} rows={3} />
          <div className="grid gap-2 md:grid-cols-[1fr_auto]">
            <Input placeholder="Tags, comma separated (e.g. ai, habits)" value={tags} onChange={(e) => setTags(e.target.value)} />
            <Btn type="submit">Save memory</Btn>
          </div>
        </form>
      </Card>

      <div className="mt-4 flex flex-wrap gap-2">
        <Input placeholder="Search memory…" value={query} onChange={(e) => setQuery(e.target.value)} className="!w-56" />
        <Select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          {["All", ...CATS].map((c) => <option key={c}>{c}</option>)}
        </Select>
        <button
          onClick={() => setOnlyFav((v) => !v)}
          className={`rounded-xl border px-4 py-2 text-sm font-medium ${onlyFav ? "border-amber-400 bg-amber-50 text-amber-700" : "border-zinc-200 dark:border-zinc-700"}`}
        >
          ★ Favorites
        </button>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {loading ? <p className="text-sm text-zinc-500">Loading…</p> :
          shown.length === 0 ? <Empty message="Memory is empty. Save your first insight above." /> :
          shown.map((k) => (
            <Card key={k._id} className="!p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{k.title}</div>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-500">
                    <Badge tone="indigo">{k.category}</Badge>
                    {k.tags.map((t) => <span key={t} className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">#{t}</span>)}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button onClick={() => toggleFav(k)} title="Favorite" className={k.favorite ? "text-amber-500" : "text-zinc-300 hover:text-amber-500"}>★</button>
                  <button onClick={() => remove(k._id)} className="text-zinc-400 hover:text-red-600">✕</button>
                </div>
              </div>
              <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">{k.content}</p>
            </Card>
          ))}
      </div>
    </div>
  );
}

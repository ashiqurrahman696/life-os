"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, PageHeader, Btn, Input, Textarea, Empty } from "@/components/ui";
import type { Note } from "@/lib/types";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/notes");
      const data = await res.json();
      const list: Note[] = data.notes ?? [];
      setNotes(list);
      if (!activeId && list.length > 0) setActiveId(list[0]._id);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const active = notes.find((n) => n._id === activeId) ?? null;

  async function create() {
    const res = await fetch("/api/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: "Untitled", content: "" }) });
    const data = await res.json();
    if (data.note) { setNotes((p) => [data.note, ...p]); setActiveId(data.note._id); }
  }

  async function save(id: string, patch: Partial<Note>) {
    setNotes((p) => p.map((n) => (n._id === id ? { ...n, ...patch } : n)));
    await fetch(`/api/notes/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
  }

  async function remove(id: string) {
    setNotes((p) => p.filter((n) => n._id !== id));
    if (activeId === id) setActiveId(null);
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return notes.filter((n) => !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
  }, [notes, query]);

  return (
    <div>
      <PageHeader title="Notes" subtitle="Capture fast, find faster." action={<Btn onClick={create}>+ New note</Btn>} />
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="!p-3 md:col-span-1">
          <Input placeholder="Search notes…" value={query} onChange={(e) => setQuery(e.target.value)} className="mb-2" />
          <div className="max-h-[60vh] space-y-1 overflow-y-auto">
            {loading ? <p className="p-2 text-sm text-zinc-500">Loading…</p> :
              filtered.length === 0 ? <Empty message="No notes found." /> :
              filtered.map((n) => (
                <button key={n._id} onClick={() => setActiveId(n._id)}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${n._id === activeId ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}>
                  <div className="flex items-center gap-1 font-medium">{n.pinned && <span>📌</span>}<span className="truncate">{n.title}</span></div>
                  <div className={`truncate text-xs ${n._id === activeId ? "opacity-70" : "text-zinc-500"}`}>{n.content.slice(0, 60) || "Empty note"}</div>
                </button>
              ))}
          </div>
        </Card>
        <Card className="md:col-span-2">
          {!active ? <Empty message="Select or create a note to start writing." /> : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input value={active.title} onChange={(e) => save(active._id, { title: e.target.value })} className="!text-base !font-semibold" />
                <button title="Pin" onClick={() => save(active._id, { pinned: !active.pinned })} className={`rounded-xl px-3 py-2 text-sm ${active.pinned ? "bg-amber-100" : "bg-zinc-100 dark:bg-zinc-800"}`}>📌</button>
                <button title="Delete" onClick={() => remove(active._id)} className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100">✕</button>
              </div>
              <Textarea rows={16} placeholder="Write…" value={active.content} onChange={(e) => save(active._id, { content: e.target.value })} />
              <p className="text-xs text-zinc-400">Autosaves on every keystroke · Updated {new Date(active.updatedAt).toLocaleString()}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

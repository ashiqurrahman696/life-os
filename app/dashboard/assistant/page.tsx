"use client";
import { useRef, useState } from "react";
import { Card, PageHeader, Btn, Badge } from "@/components/ui";
import type { ChatMessage } from "@/lib/types";

const SUGGESTIONS = ["Plan my day", "Prioritize my tasks", "Review my goals", "Who is out right now?", "Anything expiring soon?", "What's due this week?"];

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi, I'm your LifeOS assistant. I can see your tasks, calendar, appointments, reminders, goals, family movements, vehicle services, and more across all 23 modules. What should we tackle first?" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [demo, setDemo] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next }) });
      const data = await res.json();
      setDemo(Boolean(data.demo));
      setMessages([...next, { role: "assistant", content: data.reply ?? data.error ?? "Something went wrong." }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Request failed. Try again." }]);
    } finally {
      setBusy(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <PageHeader title="AI Life Assistant" subtitle="Grounded in your real LifeOS data." action={demo ? <Badge tone="amber">demo mode — add OPENAI_API_KEY</Badge> : <Badge tone="green">live AI</Badge>} />
      <Card className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"}`}>
                {m.content}
              </div>
            </div>
          ))}
          {busy && <div className="text-sm text-zinc-400">Thinking…</div>}
          <div ref={bottomRef} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => send(s)} className="rounded-full border border-zinc-200 px-3 py-1 text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">{s}</button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="mt-3 flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything… e.g. Plan my day around my tasks and meetings"
            className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900" />
          <Btn type="submit" disabled={busy || !input.trim()}>Send</Btn>
        </form>
      </Card>
    </div>
  );
}

"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, PageHeader, Btn, Input, Select, Empty } from "@/components/ui";
import type { Transaction } from "@/lib/types";

async function api(path: string, method = "GET", body?: unknown) {
  const res = await fetch(path, { method, headers: { "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) });
  return res.json();
}

export default function FinancePage() {
  const [items, setItems] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0, byCategory: {} as Record<string, number>, categories: ["Other"] as string[] });
  const [kind, setKind] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const d = await api("/api/finance");
      setItems(Array.isArray(d.items) ? d.items : []);
      if (d.summary) setSummary(d.summary);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!Number(amount)) return;
    await api("/api/finance", "POST", { kind, amount: Number(amount), category, date, note });
    setAmount(""); setNote("");
    load();
  }

  async function remove(id: string) {
    setItems((p) => p.filter((x) => x._id !== id));
    await api(`/api/finance/${id}`, "DELETE");
    load();
  }

  const maxCat = useMemo(() => Math.max(1, ...Object.values(summary.byCategory)), [summary]);

  return (
    <div>
      <PageHeader title="Personal Finance" subtitle="Income, expenses and spending breakdown" />
      <div className="grid grid-cols-3 gap-3">
        <Card className="!p-4"><div className="text-xl font-bold text-green-600">+Tk. {summary.income.toLocaleString()}</div><div className="text-sm text-zinc-500">Income</div></Card>
        <Card className="!p-4"><div className="text-xl font-bold text-red-600">−Tk. {summary.expense.toLocaleString()}</div><div className="text-sm text-zinc-500">Expenses</div></Card>
        <Card className="!p-4"><div className={`text-xl font-bold ${summary.balance >= 0 ? "" : "text-red-600"}`}>Tk. {summary.balance.toLocaleString()}</div><div className="text-sm text-zinc-500">Balance</div></Card>
      </div>

      <Card className="mt-4">
        <form onSubmit={create} className="grid gap-2 md:grid-cols-6">
          <Select value={kind} onChange={(e) => setKind(e.target.value as "expense" | "income")}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </Select>
          <Input type="number" min="0" step="0.01" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            {summary.categories.map((c) => <option key={c}>{c}</option>)}
          </Select>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
          <Btn type="submit">Add</Btn>
        </form>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Spending by category</h2>
          <div className="mt-3 space-y-2">
            {Object.keys(summary.byCategory).length === 0 ? <Empty message="No expenses yet." /> :
              Object.entries(summary.byCategory).sort((a, b) => b[1] - a[1]).map(([c, v]) => (
                <div key={c}>
                  <div className="flex justify-between text-sm"><span className="font-medium">{c}</span><span className="text-zinc-500">Tk. {v.toLocaleString()}</span></div>
                  <div className="mt-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div className="h-2 rounded-full bg-gradient-to-r from-red-400 to-orange-400" style={{ width: `${(v / maxCat) * 100}%` }} />
                  </div>
                </div>
              ))}
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold">Recent transactions</h2>
          <div className="mt-3 space-y-1.5">
            {loading ? <p className="text-sm text-zinc-500">Loading…</p> :
              items.length === 0 ? <Empty message="No transactions yet." /> :
              items.slice(0, 12).map((t) => (
                <div key={t._id} className="flex items-center gap-3 rounded-xl bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-900">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold ${t.kind === "income" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {t.kind === "income" ? "+" : "−"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{t.note || t.category}</div>
                    <div className="text-xs text-zinc-500">{t.category} · {t.date}</div>
                  </div>
                  <span className={`font-semibold ${t.kind === "income" ? "text-green-600" : ""}`}>Tk. {Number(t.amount).toLocaleString()}</span>
                  <button onClick={() => remove(t._id)} className="text-zinc-400 hover:text-red-600">✕</button>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

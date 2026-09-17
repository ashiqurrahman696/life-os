"use client";
import { useEffect, useState } from "react";
import { Card, PageHeader, Btn, Input, Textarea, Select, Badge, Empty } from "@/components/ui";
import type { EmergencyContact, EmergencyInfo } from "@/lib/types";

async function api(path: string, method = "GET", body?: unknown) {
  const res = await fetch(path, { method, headers: { "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) });
  return res.json();
}

const PRIORITIES: EmergencyContact["priority"][] = ["high", "medium", "low"];
const INFO_TYPES: EmergencyInfo["type"][] = ["allergy", "condition", "medication", "blood", "doctor", "insurance", "instruction", "other"];

const PRIORITY_TONE: Record<string, "red" | "amber" | "zinc"> = { high: "red", medium: "amber", low: "zinc" };

export default function EmergencyPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [infos, setInfos] = useState<EmergencyInfo[]>([]);
  const [cName, setCName] = useState("");
  const [cRelation, setCRelation] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [cAlt, setCAlt] = useState("");
  const [cAddress, setCAddress] = useState("");
  const [cPriority, setCPriority] = useState<EmergencyContact["priority"]>("high");
  const [iType, setIType] = useState<EmergencyInfo["type"]>("allergy");
  const [iTitle, setITitle] = useState("");
  const [iDetails, setIDetails] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [c, i] = await Promise.all([api("/api/emergency-contacts"), api("/api/emergency-info")]);
      setContacts(Array.isArray(c.items) ? c.items : []);
      setInfos(Array.isArray(i.items) ? i.items : []);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function createContact(e: React.FormEvent) {
    e.preventDefault();
    if (!cName.trim() || !cPhone.trim()) return;
    await api("/api/emergency-contacts", "POST", {
      name: cName.trim(), relation: cRelation || "Family", phone: cPhone.trim(),
      altPhone: cAlt || undefined, address: cAddress || undefined, priority: cPriority,
    });
    setCName(""); setCRelation(""); setCPhone(""); setCAlt(""); setCAddress("");
    load();
  }

  async function createInfo(e: React.FormEvent) {
    e.preventDefault();
    if (!iTitle.trim() || !iDetails.trim()) return;
    await api("/api/emergency-info", "POST", { type: iType, title: iTitle.trim(), details: iDetails.trim() });
    setITitle(""); setIDetails("");
    load();
  }

  async function removeContact(id: string) {
    setContacts((p) => p.filter((x) => x._id !== id));
    await api(`/api/emergency-contacts/${id}`, "DELETE");
  }

  async function removeInfo(id: string) {
    setInfos((p) => p.filter((x) => x._id !== id));
    await api(`/api/emergency-info/${id}`, "DELETE");
  }

  const sortedContacts = [...contacts].sort((a, b) => PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority));

  return (
    <div>
      <PageHeader title="Emergency Information" subtitle="Contacts and medical facts — findable in seconds when it matters." />
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
        In a real emergency call your local emergency number first. This page is a family reference, not a substitute for professional help.
      </div>

      <Card className="mt-4">
        <h2 className="font-semibold">Emergency contacts</h2>
        <form onSubmit={createContact} className="mt-3 grid gap-2 md:grid-cols-4">
          <Input placeholder="Name" value={cName} onChange={(e) => setCName(e.target.value)} />
          <Input placeholder="Relation (e.g. Spouse)" value={cRelation} onChange={(e) => setCRelation(e.target.value)} />
          <Input placeholder="Phone" value={cPhone} onChange={(e) => setCPhone(e.target.value)} />
          <Input placeholder="Alt phone (optional)" value={cAlt} onChange={(e) => setCAlt(e.target.value)} />
          <Input placeholder="Address (optional)" value={cAddress} onChange={(e) => setCAddress(e.target.value)} className="md:col-span-2" />
          <Select value={cPriority} onChange={(e) => setCPriority(e.target.value as EmergencyContact["priority"])}>
            {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
          </Select>
          <Btn type="submit">Add contact</Btn>
        </form>
        <div className="mt-3 space-y-2">
          {loading ? <p className="text-sm text-zinc-500">Loading…</p> :
            sortedContacts.length === 0 ? <Empty message="No emergency contacts yet." /> :
            sortedContacts.map((c) => (
              <div key={c._id} className="flex flex-wrap items-center gap-2 rounded-xl bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-900">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 font-bold text-white">✚</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{c.name} <span className="font-normal text-zinc-500">· {c.relation}</span></div>
                  <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
                    <a href={`tel:${c.phone}`} className="font-semibold text-indigo-600 hover:underline">📞 {c.phone}</a>
                    {c.altPhone && <a href={`tel:${c.altPhone}`} className="hover:underline">{c.altPhone}</a>}
                    {c.address && <span>📍 {c.address}</span>}
                  </div>
                </div>
                <Badge tone={PRIORITY_TONE[c.priority]}>{c.priority}</Badge>
                <button onClick={() => removeContact(c._id)} className="text-zinc-400 hover:text-red-600">✕</button>
              </div>
            ))}
        </div>
      </Card>

      <Card className="mt-4">
        <h2 className="font-semibold">Medical & safety notes</h2>
        <p className="mt-1 text-xs text-zinc-500">Blood type, allergies, medications, doctors, insurance, instructions.</p>
        <form onSubmit={createInfo} className="mt-3 grid gap-2 md:grid-cols-4">
          <Select value={iType} onChange={(e) => setIType(e.target.value as EmergencyInfo["type"])}>
            {INFO_TYPES.map((t) => <option key={t}>{t}</option>)}
          </Select>
          <Input placeholder="Title (e.g. Blood type)" value={iTitle} onChange={(e) => setITitle(e.target.value)} />
          <Textarea placeholder="Details (e.g. O+, penicillin allergy…)" value={iDetails} onChange={(e) => setIDetails(e.target.value)} rows={1} />
          <Btn type="submit">Add note</Btn>
        </form>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {loading ? <p className="text-sm text-zinc-500">Loading…</p> :
            infos.length === 0 ? <Empty message="No medical notes yet." /> :
            infos.map((i) => (
              <div key={i._id} className="rounded-xl border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge tone="indigo">{i.type}</Badge>
                    <div className="mt-1 font-semibold">{i.title}</div>
                  </div>
                  <button onClick={() => removeInfo(i._id)} className="text-zinc-400 hover:text-red-600">✕</button>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-zinc-600 dark:text-zinc-400">{i.details}</p>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}

"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, PageHeader, Btn, Input, Select, Badge, Empty } from "@/components/ui";
import type { Vehicle, VehicleService } from "@/lib/types";

async function api(path: string, method = "GET", body?: unknown) {
  const res = await fetch(path, { method, headers: { "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) });
  return res.json();
}

const FUELS: Vehicle["fuel"][] = ["petrol", "diesel", "electric", "hybrid", "other"];
const SERVICE_TYPES: VehicleService["serviceType"][] = ["oil", "tires", "brakes", "insurance", "inspection", "battery", "wash", "other"];

export default function VehiclePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<VehicleService[]>([]);
  const [vName, setVName] = useState("");
  const [vMake, setVMake] = useState("");
  const [vModel, setVModel] = useState("");
  const [vPlate, setVPlate] = useState("");
  const [vMileage, setVMileage] = useState("");
  const [vFuel, setVFuel] = useState<Vehicle["fuel"]>("petrol");
  const [sVehicleId, setSVehicleId] = useState("");
  const [sTitle, setSTitle] = useState("");
  const [sType, setSType] = useState<VehicleService["serviceType"]>("oil");
  const [sDueDate, setSDueDate] = useState("");
  const [sDueMileage, setSDueMileage] = useState("");
  const [sCost, setSCost] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [v, s] = await Promise.all([api("/api/vehicles"), api("/api/vehicle-services")]);
      setVehicles(Array.isArray(v.items) ? v.items : []);
      setServices(Array.isArray(s.items) ? s.items : []);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function createVehicle(e: React.FormEvent) {
    e.preventDefault();
    if (!vName.trim()) return;
    await api("/api/vehicles", "POST", {
      name: vName.trim(), make: vMake || undefined, model: vModel || undefined,
      plate: vPlate || undefined, mileage: vMileage ? Number(vMileage) : undefined, fuel: vFuel,
    });
    setVName(""); setVMake(""); setVModel(""); setVPlate(""); setVMileage("");
    load();
  }

  async function createService(e: React.FormEvent) {
    e.preventDefault();
    if (!sTitle.trim()) return;
    const v = vehicles.find((x) => x._id === sVehicleId);
    await api("/api/vehicle-services", "POST", {
      vehicleId: sVehicleId || undefined,
      vehicleName: v ? v.name : "General",
      title: sTitle.trim(),
      serviceType: sType,
      dueDate: sDueDate || undefined,
      dueMileage: sDueMileage ? Number(sDueMileage) : undefined,
      cost: sCost ? Number(sCost) : undefined,
      done: false,
    });
    setSTitle(""); setSDueDate(""); setSDueMileage(""); setSCost("");
    load();
  }

  async function toggleService(s: VehicleService) {
    setServices((p) => p.map((x) => (x._id === s._id ? { ...x, done: !x.done } : x)));
    await api(`/api/vehicle-services/${s._id}`, "PATCH", { done: !s.done });
  }

  async function removeVehicle(id: string) {
    setVehicles((p) => p.filter((x) => x._id !== id));
    await api(`/api/vehicles/${id}`, "DELETE");
  }

  async function removeService(id: string) {
    setServices((p) => p.filter((x) => x._id !== id));
    await api(`/api/vehicle-services/${id}`, "DELETE");
  }

  async function saveMileage(v: Vehicle, mileage: string) {
    if (!mileage) return;
    await api(`/api/vehicles/${v._id}`, "PATCH", { mileage: Number(mileage) });
    load();
  }

  const today = new Date().toISOString().slice(0, 10);
  const openServices = useMemo(() => services.filter((s) => !s.done), [services]);
  const overdue = openServices.filter((s) => s.dueDate && s.dueDate < today);
  const upcoming = openServices.filter((s) => !s.dueDate || s.dueDate >= today);
  const doneServices = useMemo(() => services.filter((s) => s.done), [services]);
  const totalCost = doneServices.reduce((sum, s) => sum + Number(s.cost || 0), 0);

  function serviceRow(s: VehicleService, late: boolean) {
    return (
      <Card key={s._id} className="!p-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => toggleService(s)}
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${s.done ? "border-green-500 bg-green-500 text-white" : "border-zinc-300 dark:border-zinc-600"}`}
          >
            {s.done ? "✓" : ""}
          </button>
          <div className="min-w-0 flex-1">
            <div className={`truncate text-sm font-medium ${s.done ? "text-zinc-400 line-through" : ""}`}>{s.title}</div>
            <div className="mt-0.5 flex flex-wrap gap-2 text-xs text-zinc-500">
              <Badge tone="indigo">{s.vehicleName}</Badge>
              <span>{s.serviceType}</span>
              {s.dueDate && <span className={late ? "font-semibold text-red-600" : ""}>due {s.dueDate}</span>}
              {s.dueMileage ? <span>@ {Number(s.dueMileage).toLocaleString()} km</span> : null}
              {s.cost ? <span>${Number(s.cost).toLocaleString()}</span> : null}
            </div>
          </div>
          <button onClick={() => removeService(s._id)} className="text-zinc-400 hover:text-red-600">✕</button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader title="Vehicle & Services" subtitle={overdue.length ? `${overdue.length} service overdue — book it!` : "Garage, mileage and service reminders."} />

      <div className="grid grid-cols-3 gap-3">
        <Card className="!p-4"><div className="text-xl font-bold">{vehicles.length}</div><div className="text-sm text-zinc-500">Vehicles</div></Card>
        <Card className="!p-4"><div className={`text-xl font-bold ${overdue.length ? "text-red-600" : ""}`}>{openServices.length}</div><div className="text-sm text-zinc-500">Open services</div></Card>
        <Card className="!p-4"><div className="text-xl font-bold">${totalCost.toLocaleString()}</div><div className="text-sm text-zinc-500">Service spend</div></Card>
      </div>

      <Card className="mt-4">
        <h2 className="font-semibold">My vehicles</h2>
        <form onSubmit={createVehicle} className="mt-3 grid gap-2 md:grid-cols-6">
          <Input placeholder="Name (e.g. City car)" value={vName} onChange={(e) => setVName(e.target.value)} />
          <Input placeholder="Make (e.g. Toyota)" value={vMake} onChange={(e) => setVMake(e.target.value)} />
          <Input placeholder="Model (e.g. Corolla)" value={vModel} onChange={(e) => setVModel(e.target.value)} />
          <Input placeholder="Plate" value={vPlate} onChange={(e) => setVPlate(e.target.value)} />
          <Input type="number" min="0" placeholder="Mileage (km)" value={vMileage} onChange={(e) => setVMileage(e.target.value)} />
          <Select value={vFuel} onChange={(e) => setVFuel(e.target.value as Vehicle["fuel"])}>
            {FUELS.map((f) => <option key={f}>{f}</option>)}
          </Select>
          <Btn type="submit" >Add vehicle</Btn>
        </form>
        <div className="mt-3 space-y-2">
          {loading ? <p className="text-sm text-zinc-500">Loading…</p> :
            vehicles.length === 0 ? <Empty message="No vehicles yet. Add your first one." /> :
            vehicles.map((v) => (
              <VehicleRow key={v._id} vehicle={v} onSaveMileage={saveMileage} onRemove={removeVehicle} />
            ))}
        </div>
      </Card>

      <Card className="mt-4">
        <h2 className="font-semibold">Service reminder</h2>
        <form onSubmit={createService} className="mt-3 grid gap-2 md:grid-cols-4">
          <Select value={sVehicleId} onChange={(e) => setSVehicleId(e.target.value)}>
            <option value="">General (no vehicle)</option>
            {vehicles.map((v) => <option key={v._id} value={v._id}>{v.name}</option>)}
          </Select>
          <Input placeholder="e.g. Oil change, insurance renewal" value={sTitle} onChange={(e) => setSTitle(e.target.value)} />
          <Select value={sType} onChange={(e) => setSType(e.target.value as VehicleService["serviceType"])}>
            {SERVICE_TYPES.map((t) => <option key={t}>{t}</option>)}
          </Select>
          <Input type="date" value={sDueDate} onChange={(e) => setSDueDate(e.target.value)} />
          <Input type="number" min="0" placeholder="Due mileage (km)" value={sDueMileage} onChange={(e) => setSDueMileage(e.target.value)} />
          <Input type="number" min="0" step="0.01" placeholder="Est. cost" value={sCost} onChange={(e) => setSCost(e.target.value)} />
          <Btn type="submit">Add reminder</Btn>
        </form>
      </Card>

      <div className="mt-4 space-y-2">
        {loading ? <p className="text-sm text-zinc-500">Loading…</p> : (
          <>
            {overdue.length > 0 && (<><p className="text-xs font-semibold uppercase tracking-widest text-red-500">Overdue</p>{overdue.map((s) => serviceRow(s, true))}</>)}
            <p className="pt-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">Upcoming</p>
            {upcoming.length === 0 && overdue.length === 0 ? <Empty message="No open service reminders." /> : upcoming.map((s) => serviceRow(s, false))}
            {doneServices.length > 0 && (<><p className="pt-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">Done</p>{doneServices.map((s) => serviceRow(s, false))}</>)}
          </>
        )}
      </div>
    </div>
  );
}

function VehicleRow({ vehicle, onSaveMileage, onRemove }: { vehicle: Vehicle; onSaveMileage: (v: Vehicle, m: string) => void; onRemove: (id: string) => void }) {
  const [mileage, setMileage] = useState(vehicle.mileage ? String(vehicle.mileage) : "");
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-900">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 font-bold text-white dark:bg-white dark:text-zinc-900">🚗</span>
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{vehicle.name}</div>
        <div className="text-xs text-zinc-500">
          {[vehicle.make, vehicle.model, vehicle.year].filter(Boolean).join(" ") || vehicle.fuel}
          {vehicle.plate ? ` · ${vehicle.plate}` : ""}
        </div>
      </div>
      <Input type="number" min="0" placeholder="km" value={mileage} onChange={(e) => setMileage(e.target.value)} className="!w-28" />
      <Btn variant="ghost" onClick={() => onSaveMileage(vehicle, mileage)}>Save km</Btn>
      <button onClick={() => onRemove(vehicle._id)} className="text-zinc-400 hover:text-red-600">✕</button>
    </div>
  );
}

import { ObjectId } from "mongodb";
import { getDb, isDbConfigured } from "./mongodb";

export const COLLECTIONS = {
  tasks: "tasks",
  events: "events",
  notes: "notes",
  goals: "goals",
  reminders: "reminders",
  projects: "projects",
  homeTasks: "homeTasks",
  trips: "trips",
  transactions: "transactions",
  vault: "vault",
  shopping: "shopping",
  documents: "documents",
  family: "family",
  study: "study",
  knowledge: "knowledge",
  vehicles: "vehicles",
  vehicleServices: "vehicleServices",
  appointments: "appointments",
  importantDates: "importantDates",
  emergencyContacts: "emergencyContacts",
  emergencyInfo: "emergencyInfo",
  movements: "movements",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

type MemoryDoc = Record<string, unknown> & { _id: string; userId: string };

const globalStore = globalThis as unknown as {
  __lifeos?: Record<CollectionName, MemoryDoc[]>;
};

function memory(): Record<CollectionName, MemoryDoc[]> {
  if (!globalStore.__lifeos) {
    globalStore.__lifeos = {
      tasks: [], events: [], notes: [], goals: [],
      reminders: [], projects: [], homeTasks: [], trips: [],
      transactions: [], vault: [], shopping: [], documents: [], family: [],
      study: [], knowledge: [], vehicles: [], vehicleServices: [],
      appointments: [], importantDates: [], emergencyContacts: [], emergencyInfo: [], movements: [],
    };
  }
  return globalStore.__lifeos;
}

export function serializeId(doc: Record<string, unknown>): Record<string, unknown> {
  const out = { ...doc };
  if (out._id instanceof ObjectId) out._id = out._id.toHexString();
  return out;
}

function matches(doc: MemoryDoc, filter: Record<string, unknown>): boolean {
  for (const [k, v] of Object.entries(filter)) {
    if (k === "_id" && typeof v === "string") {
      if (doc._id !== v) return false;
    } else if ((doc as Record<string, unknown>)[k] !== v) {
      return false;
    }
  }
  return true;
}

export async function dbFind<T>(
  collection: CollectionName,
  filter: Record<string, unknown>,
  sort: Record<string, 1 | -1> = { updatedAt: -1 }
): Promise<T[]> {
  const db = isDbConfigured() ? await getDb() : null;
  if (db) {
    const docs = await db.collection(collection).find(filter).sort(sort).limit(500).toArray();
    return docs.map((d) => serializeId(d as unknown as Record<string, unknown>)) as T[];
  }
  const [sortKey, sortDir] = Object.entries(sort)[0] ?? ["updatedAt", -1];
  return memory()
    [collection].filter((d) => matches(d, filter))
    .sort((a, b) => {
      const av = String((a as Record<string, unknown>)[sortKey] ?? "");
      const bv = String((b as Record<string, unknown>)[sortKey] ?? "");
      return sortDir === -1 ? bv.localeCompare(av) : av.localeCompare(bv);
    }) as T[];
}

export async function dbInsert<T>(collection: CollectionName, doc: Record<string, unknown>): Promise<T> {
  const db = isDbConfigured() ? await getDb() : null;
  if (db) {
    const res = await db.collection(collection).insertOne(doc as never);
    return { ...doc, _id: res.insertedId.toHexString() } as T;
  }
  const _id = new ObjectId().toHexString();
  const full = { ...doc, _id } as MemoryDoc;
  memory()[collection].unshift(full);
  return full as T;
}

export async function dbGet<T>(collection: CollectionName, id: string, userId: string): Promise<T | null> {
  const db = isDbConfigured() ? await getDb() : null;
  if (db) {
    if (!ObjectId.isValid(id)) return null;
    const doc = await db.collection(collection).findOne({ _id: new ObjectId(id), userId });
    return doc ? (serializeId(doc as unknown as Record<string, unknown>) as T) : null;
  }
  return (memory()[collection].find((d) => d._id === id && d.userId === userId) as T | undefined) ?? null;
}

export async function dbUpdate<T>(
  collection: CollectionName,
  id: string,
  userId: string,
  patch: Record<string, unknown>
): Promise<T | null> {
  const db = isDbConfigured() ? await getDb() : null;
  if (db) {
    if (!ObjectId.isValid(id)) return null;
    const res = await db
      .collection(collection)
      .findOneAndUpdate(
        { _id: new ObjectId(id), userId },
        { $set: patch },
        { returnDocument: "after" }
      );
    return res ? (serializeId(res as unknown as Record<string, unknown>) as T) : null;
  }
  const store = memory()[collection];
  const idx = store.findIndex((d) => d._id === id && d.userId === userId);
  if (idx === -1) return null;
  store[idx] = { ...store[idx], ...patch } as MemoryDoc;
  return store[idx] as T;
}

export async function dbDelete(collection: CollectionName, id: string, userId: string): Promise<boolean> {
  const db = isDbConfigured() ? await getDb() : null;
  if (db) {
    if (!ObjectId.isValid(id)) return false;
    const res = await db.collection(collection).deleteOne({ _id: new ObjectId(id), userId });
    return res.deletedCount === 1;
  }
  const store = memory()[collection];
  const idx = store.findIndex((d) => d._id === id && d.userId === userId);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}

export function nowIso(): string {
  return new Date().toISOString();
}

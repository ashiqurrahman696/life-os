import { NextResponse } from "next/server";
import { dbFind, dbInsert, dbUpdate, dbDelete, nowIso, type CollectionName } from "./db";
import { getCurrentUser } from "./session";

/**
 * Generic CRUD route factory for simple user-scoped collections.
 * Usage in app/api/<name>/route.ts:
 *   import { collectionRoutes } from "@/lib/crud";
 *   export const { GET, POST } = collectionRoutes("reminders", { required: ["title"] });
 * Usage in app/api/<name>/[id]/route.ts:
 *   import { itemRoutes } from "@/lib/crud";
 *   export const { PATCH, DELETE } = itemRoutes("reminders", { allowed: ["title", "done"] });
 */

interface CollectionOptions {
  required?: string[];
  sort?: Record<string, 1 | -1>;
}

interface ItemOptions {
  allowed: string[];
}

export function collectionRoutes(collection: CollectionName, opts: CollectionOptions = {}) {
  const GET = async () => {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const items = await dbFind(collection, { userId: user.id }, opts.sort ?? { updatedAt: -1 });
    return NextResponse.json({ items });
  };

  const POST = async (req: Request) => {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    for (const field of opts.required ?? []) {
      const v = body[field];
      if (v === undefined || v === null || (typeof v === "string" && !v.trim())) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }
    const now = nowIso();
    const item = await dbInsert(collection, { ...body, userId: user.id, createdAt: now, updatedAt: now });
    return NextResponse.json({ item }, { status: 201 });
  };

  return { GET, POST };
}

export function itemRoutes(collection: CollectionName, opts: ItemOptions) {
  const PATCH = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const patch = await req.json().catch(() => ({}));
    const clean: Record<string, unknown> = { updatedAt: nowIso() };
    for (const k of opts.allowed) if (k in patch) clean[k] = patch[k];
    const item = await dbUpdate(collection, id, user.id, clean);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item });
  };

  const DELETE = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const ok = await dbDelete(collection, id, user.id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  };

  return { PATCH, DELETE };
}

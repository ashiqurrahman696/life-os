import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getDb, isDbConfigured } from "./mongodb";

const baseURL = process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function googleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID ?? "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET ?? "";
  if (!clientId || !clientSecret) return undefined;
  return { clientId, clientSecret };
}

// better-auth requires a DB adapter for email/password + OAuth persistence.
// In demo mode (no MONGODB_URI) we still export an auth instance so the
// [...all] route exists, but session resolution falls back to a demo user
// (see lib/session.ts).
async function buildAdapter() {
  if (!isDbConfigured()) return undefined;
  const db = await getDb();
  if (!db) return undefined;
  return mongodbAdapter(db);
}

const adapter = await buildAdapter();
const google = googleConfig();

export const auth = betterAuth({
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET ?? "lifeos-dev-secret-change-me",
  ...(adapter ? { database: adapter } : {}),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  ...(google ? { socialProviders: { google } } : {}),
  session: {
    expiresIn: 60 * 60 * 24 * 7,
  },
});

export type Session = typeof auth.$Infer.Session;

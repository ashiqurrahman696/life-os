import { headers } from "next/headers";
import { auth } from "./auth";
import { isDbConfigured } from "./mongodb";

export interface AppUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  demo?: boolean;
}

export const DEMO_USER: AppUser = {
  id: "demo-user",
  email: "demo@lifeos.local",
  name: "Demo User",
  demo: true,
};

export async function getCurrentUser(): Promise<AppUser | null> {
  // Demo fallback: app is fully usable without env keys.
  if (!isDbConfigured()) return DEMO_USER;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return null;
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name || session.user.email,
      image: session.user.image ?? undefined,
    };
  } catch {
    // If auth misconfigured, degrade to demo rather than 500.
    return DEMO_USER;
  }
}

export function isDemo(): boolean {
  return !isDbConfigured();
}

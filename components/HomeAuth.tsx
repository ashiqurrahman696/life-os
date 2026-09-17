"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiLogOut } from "react-icons/fi";
import { authClient } from "@/lib/auth-client";

const linkBtn =
  "rounded-xl px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800";
const primaryBtn =
  "rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-700 active:scale-[0.98] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200";

export default function HomeAuth() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [busy, setBusy] = useState(false);
  const user = session?.user;

  async function signOut() {
    setBusy(true);
    try {
      await authClient.signOut();
    } finally {
      setBusy(false);
      router.refresh();
    }
  }

  if (isPending) {
    return (
      <div className="flex items-center gap-2" aria-hidden>
        <span className="h-8 w-8 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
        <span className="hidden h-8 w-24 animate-pulse rounded-xl bg-zinc-200 sm:block dark:bg-zinc-800" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Link href="/login" className={linkBtn}>Sign in</Link>
        <Link href="/dashboard" className={primaryBtn}>Open app</Link>
      </>
    );
  }

  const displayName = user.name?.trim() || user.email || "Account";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      <span className="hidden items-center gap-2 sm:flex" title={user.email ?? displayName}>
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white dark:bg-white dark:text-zinc-900">
            {initial}
          </span>
        )}
        <span className="max-w-32 truncate text-sm font-medium">{displayName}</span>
      </span>
      <Link href="/dashboard" className={primaryBtn}>Open app</Link>
      <button
        type="button"
        onClick={signOut}
        disabled={busy}
        title="Sign out"
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 active:scale-95 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      >
        <FiLogOut className="h-4 w-4" />
        <span className="sr-only">{busy ? "Signing out…" : "Sign out"}</span>
      </button>
    </>
  );
}

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/theme";
import type { IconType } from "react-icons";
import {
  FiAlertTriangle,
  FiBarChart2,
  FiBell,
  FiBookOpen,
  FiBriefcase,
  FiCalendar,
  FiCheckSquare,
  FiClock,
  FiCpu,
  FiDatabase,
  FiDollarSign,
  FiFileText,
  FiFolder,
  FiGift,
  FiGrid,
  FiHeart,
  FiHome,
  FiKey,
  FiLayers,
  FiLogOut,
  FiMap,
  FiMenu,
  FiShoppingCart,
  FiTarget,
  FiTool,
  FiUsers,
  FiX,
} from "react-icons/fi";

const GROUPS: { label: string; items: { href: string; label: string; icon: IconType }[] }[] = [
  {
    label: "Daily",
    items: [
      { href: "/dashboard", label: "Overview", icon: FiGrid },
      { href: "/dashboard/tasks", label: "Tasks", icon: FiCheckSquare },
      { href: "/dashboard/calendar", label: "Calendar", icon: FiCalendar },
      { href: "/dashboard/notes", label: "Notes", icon: FiFileText },
      { href: "/dashboard/goals", label: "Goals", icon: FiTarget },
      { href: "/dashboard/assistant", label: "AI Assistant", icon: FiCpu },
    ],
  },
  {
    label: "Life Manager",
    items: [
      { href: "/dashboard/reminders", label: "Reminders", icon: FiBell },
      { href: "/dashboard/projects", label: "Work & Projects", icon: FiBriefcase },
      { href: "/dashboard/home", label: "Home", icon: FiHome },
      { href: "/dashboard/travel", label: "Travel", icon: FiMap },
      { href: "/dashboard/finance", label: "Finance", icon: FiDollarSign },
      { href: "/dashboard/shopping", label: "Shopping", icon: FiShoppingCart },
      { href: "/dashboard/family", label: "Family", icon: FiHeart },
    ],
  },
  {
    label: "Vault & Insights",
    items: [
      { href: "/dashboard/vault", label: "Accounts", icon: FiKey },
      { href: "/dashboard/documents", label: "Documents", icon: FiFolder },
      { href: "/dashboard/analytics", label: "Analytics", icon: FiBarChart2 },
    ],
  },
  {
    label: "Growth",
    items: [
      { href: "/dashboard/study", label: "Study", icon: FiBookOpen },
      { href: "/dashboard/knowledge", label: "Knowledge", icon: FiDatabase },
    ],
  },
  {
    label: "Garage",
    items: [
      { href: "/dashboard/vehicle", label: "Vehicle", icon: FiTool },
    ],
  },
  {
    label: "Care & Plans",
    items: [
      { href: "/dashboard/appointments", label: "Appointments", icon: FiClock },
      { href: "/dashboard/dates", label: "Important Dates", icon: FiGift },
      { href: "/dashboard/emergency", label: "Emergency", icon: FiAlertTriangle },
      { href: "/dashboard/movements", label: "Who When Where", icon: FiUsers },
    ],
  },
];

function NavGroups({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <div className="flex w-full flex-col gap-0">
      {GROUPS.map((g) => (
        <div key={g.label} className="mb-2 flex w-full flex-col gap-0">
          <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">{g.label}</p>
          {g.items.map((n) => {
            const active = pathname === n.href;
            const Icon = n.icon;
            return (
              <Link
                key={n.href}
                href={n.href}
                title={n.label}
                onClick={onNavigate}
                className={`flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{n.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function SignOutRow({ onSignOut, className = "" }: { onSignOut: () => void; className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <ThemeToggle className="border-transparent" />
      <button
        onClick={onSignOut}
        className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        <FiLogOut className="h-4 w-4 shrink-0" />
        <span>Sign out</span>
      </button>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function signOut() {
    try {
      await authClient.signOut();
    } finally {
      router.push("/login");
    }
  }

  // Close the mobile drawer on navigation (e.g. back/forward buttons).
  // Link clicks already close it via onNavigate.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- pathname is an external nav signal, must sync drawer state
    setOpen(false);
  }, [pathname]);

  // Close on Escape + lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open ]);

  return (
    <>
      {/* Mobile top bar with toggle */}
      <header className="sticky top-0 z-30 flex w-full items-center gap-2 border-b border-zinc-200 bg-white/95 p-3 backdrop-blur md:hidden dark:border-zinc-800 dark:bg-zinc-950/95">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close sidebar" : "Open sidebar"}
          aria-expanded={open}
          aria-controls="mobile-sidebar"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 transition hover:bg-zinc-100 active:scale-95 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {open ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
        </button>
        <Link href="/dashboard" className="flex items-center gap-2 px-1" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
            <FiLayers className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold">LifeOS</span>
        </Link>
        <div className="ml-auto">
          <ThemeToggle className="border-transparent" />
        </div>
      </header>

      {/* Mobile backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden={!open}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Mobile drawer */}
      <aside
        id="mobile-sidebar"
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-white p-3 shadow-xl transition-transform duration-300 ease-in-out md:hidden dark:bg-zinc-950 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-4 flex items-center gap-2 px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
            <FiLayers className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold">LifeOS</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <NavGroups pathname={pathname} onNavigate={() => setOpen(false)} />
        </nav>
        <div className="border-t border-zinc-200 pt-2 dark:border-zinc-800">
          <SignOutRow onSignOut={signOut} />
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-0 overflow-y-auto border-r border-zinc-200 bg-white p-3 md:flex dark:border-zinc-800 dark:bg-zinc-950">
        <Link href="/dashboard" className="mb-4 flex items-center gap-2 px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
            <FiLayers className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold">LifeOS</span>
        </Link>
        <NavGroups pathname={pathname} />
        <div className="flex-1" />
        <SignOutRow onSignOut={signOut} className="w-full" />
      </aside>
    </>
  );
}

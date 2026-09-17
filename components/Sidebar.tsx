"use client";
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
  FiShoppingCart,
  FiTarget,
  FiTool,
  FiUsers,
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

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    try {
      await authClient.signOut();
    } finally {
      router.push("/login");
    }
  }

  return (
    <aside className="flex w-full shrink-0 items-center gap-1 overflow-x-auto border-b border-zinc-200 bg-white p-3 md:sticky md:top-0 md:h-screen md:w-60 md:flex-col md:items-stretch md:gap-0 md:overflow-x-hidden md:overflow-y-auto md:border-b-0 md:border-r dark:border-zinc-800 dark:bg-zinc-950">
      <Link href="/dashboard" className="mb-0 mr-2 flex items-center gap-2 px-2 md:mb-4 md:mr-0">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
          <FiLayers className="h-5 w-5" />
        </span>
        <span className="hidden text-lg font-bold md:block">LifeOS</span>
      </Link>
      <div className="flex w-full gap-1 md:flex-col md:gap-0">
        {GROUPS.map((g) => (
          <div key={g.label} className="flex w-full shrink-0 gap-1 md:mb-2 md:flex-col md:gap-0">
            <p className="hidden px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 md:block">{g.label}</p>
            {g.items.map((n) => {
              const active = pathname === n.href;
              const Icon = n.icon;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  title={n.label}
                  className={`flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline md:inline">{n.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
      <div className="hidden flex-1 md:block" />
      <div className="ml-auto flex items-center gap-2 md:ml-0 md:w-full">
        <ThemeToggle className="border-transparent md:order-2" />
        <button
          onClick={signOut}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-500 transition hover:bg-zinc-100 md:w-full md:flex-1 md:text-left dark:hover:bg-zinc-800"
        >
          <FiLogOut className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline md:inline">Sign out</span>
        </button>
      </div>
    </aside>
  );
}

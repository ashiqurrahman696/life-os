import Link from "next/link";
import type { IconType } from "react-icons";
import { ThemeToggle } from "@/components/theme";
import HomeAuth from "@/components/HomeAuth";
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
  FiMap,
  FiShoppingCart,
  FiTarget,
  FiTool,
  FiUsers,
} from "react-icons/fi";

const GROUPS: { label: string; items: { icon: IconType; title: string; desc: string; href: string }[] }[] = [
  {
    label: "Daily",
    items: [
      { icon: FiGrid, title: "Overview", desc: "Today's tasks, events and goals at a glance.", href: "/dashboard" },
      { icon: FiCheckSquare, title: "Tasks", desc: "Prioritize with status, priority, due dates and tags.", href: "/dashboard/tasks" },
      { icon: FiCalendar, title: "Calendar", desc: "Month view, agenda and color-coded events.", href: "/dashboard/calendar" },
      { icon: FiFileText, title: "Notes", desc: "Fast capture with pinning, tags and search.", href: "/dashboard/notes" },
      { icon: FiTarget, title: "Goals", desc: "Milestones, progress tracking and target dates.", href: "/dashboard/goals" },
      { icon: FiCpu, title: "AI Life Assistant", desc: "Plan your day using your real tasks, events and goals.", href: "/dashboard/assistant" },
    ],
  },
  {
    label: "Life Manager",
    items: [
      { icon: FiBell, title: "Reminders", desc: "Never miss birthdays, bills and follow-ups.", href: "/dashboard/reminders" },
      { icon: FiBriefcase, title: "Work & Projects", desc: "Track projects, deadlines and work streams.", href: "/dashboard/projects" },
      { icon: FiHome, title: "Home", desc: "Chores, maintenance and household inventory.", href: "/dashboard/home" },
      { icon: FiMap, title: "Travel", desc: "Trips, itineraries, packing lists and bookings.", href: "/dashboard/travel" },
      { icon: FiDollarSign, title: "Finance", desc: "Budgets, expenses, income and savings.", href: "/dashboard/finance" },
      { icon: FiShoppingCart, title: "Shopping", desc: "Grocery and wishlist with smart lists.", href: "/dashboard/shopping" },
      { icon: FiHeart, title: "Family", desc: "Contacts, events and shared todos for loved ones.", href: "/dashboard/family" },
    ],
  },
  {
    label: "Vault & Insights",
    items: [
      { icon: FiKey, title: "Accounts", desc: "Secure vault for logins and credentials.", href: "/dashboard/vault" },
      { icon: FiFolder, title: "Documents", desc: "IDs, contracts and files with expiry alerts.", href: "/dashboard/documents" },
      { icon: FiBarChart2, title: "Analytics", desc: "Productivity trends across tasks and goals.", href: "/dashboard/analytics" },
    ],
  },
  {
    label: "Growth",
    items: [
      { icon: FiBookOpen, title: "Study", desc: "Subjects, sessions, exam prep and focus time.", href: "/dashboard/study" },
      { icon: FiDatabase, title: "Knowledge", desc: "Second brain — ideas, notes and memory.", href: "/dashboard/knowledge" },
    ],
  },
  {
    label: "Garage",
    items: [
      { icon: FiTool, title: "Vehicle", desc: "Garage, mileage and service reminders.", href: "/dashboard/vehicle" },
    ],
  },
  {
    label: "Care & Plans",
    items: [
      { icon: FiClock, title: "Appointments", desc: "Doctor visits, meetings and bookings.", href: "/dashboard/appointments" },
      { icon: FiGift, title: "Important Dates", desc: "Birthdays, anniversaries and countdowns.", href: "/dashboard/dates" },
      { icon: FiAlertTriangle, title: "Emergency", desc: "Contacts and medical facts in seconds.", href: "/dashboard/emergency" },
      { icon: FiUsers, title: "Who When Where", desc: "Who goes when and where — family movements.", href: "/dashboard/movements" },
    ],
  },
];

export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-16">
      <nav className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
            <FiLayers className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold">LifeOS</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <HomeAuth />
        </div>
      </nav>

      <main className="mt-16 flex flex-col gap-12">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              Your whole life, <span className="text-zinc-400">one OS.</span>
            </h1>
            <p className="mt-4 max-w-md text-zinc-500">
              Tasks, calendar, notes, goals, reminders, projects, home, travel, finance, shopping, family, vault, documents, analytics, study, knowledge, vehicle, appointments, important dates, emergency info, movements — plus an AI assistant that reads your actual data to plan your day.
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/dashboard" className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900">Launch LifeOS</Link>
              <Link href="/signup" className="rounded-xl border border-zinc-200 px-5 py-3 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">Create account</Link>
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">Everything in one place</p>
            <p className="mt-1">23 modules across Daily, Life Manager, Vault & Insights, Growth, Garage, and Care & Plans — open any card below to jump straight into the app.</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800">6 Daily</span>
              <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800">7 Life Manager</span>
              <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800">3 Vault & Insights</span>
              <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800">2 Growth</span>
              <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800">1 Garage</span>
              <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800">4 Care & Plans</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-8">
          {GROUPS.map((g) => (
            <div key={g.label}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">{g.label}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((f) => (
                  <Link
                    key={f.title}
                    href={f.href}
                    className="rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
                  >
                    <f.icon className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                    <div className="mt-2 font-semibold">{f.title}</div>
                    <div className="mt-1 text-sm text-zinc-500">{f.desc}</div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export type TaskStatus = "todo" | "in-progress" | "done";
export type Priority = "low" | "medium" | "high";

export interface Task {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CalEvent {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  _id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  title: string;
  done: boolean;
}

export interface Goal {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  category: string;
  targetDate?: string;
  progress: number;
  milestones: Milestone[];
  status: "active" | "completed" | "paused";
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// ---- New LifeOS modules ----

export interface Reminder {
  _id: string;
  userId: string;
  title: string;
  notes?: string;
  remindAt: string;
  repeat: "none" | "daily" | "weekly" | "monthly";
  done: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSubtask {
  title: string;
  done: boolean;
}

export interface Project {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  status: "planning" | "active" | "on-hold" | "done";
  deadline?: string;
  subtasks: ProjectSubtask[];
  createdAt: string;
  updatedAt: string;
}

export interface HomeTask {
  _id: string;
  userId: string;
  title: string;
  area: string;
  frequency: "once" | "weekly" | "monthly" | "quarterly" | "yearly";
  dueDate?: string;
  done: boolean;
  cost?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TripChecklistItem {
  title: string;
  done: boolean;
}

export interface Trip {
  _id: string;
  userId: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget?: number;
  status: "idea" | "planned" | "booked" | "done";
  checklist: TripChecklistItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  userId: string;
  kind: "income" | "expense";
  amount: number;
  category: string;
  date: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// NOTE: LifeOS never stores actual passwords. Vault entries hold account
// metadata + a personal hint so you remember which credential goes where.
export interface VaultEntry {
  _id: string;
  userId: string;
  service: string;
  username?: string;
  url?: string;
  category: string;
  passwordHint?: string;
  lastChanged?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingItem {
  _id: string;
  userId: string;
  name: string;
  qty?: string;
  category?: string;
  recurring: boolean;
  frequency?: string;
  bought: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentEntry {
  _id: string;
  userId: string;
  title: string;
  category: string;
  location?: string;
  expiryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyDuty {
  _id: string;
  userId: string;
  title: string;
  member?: string;
  dueDate?: string;
  done: boolean;
  priority: "low" | "medium" | "high";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudyEntry {
  _id: string;
  userId: string;
  subject: string;
  title: string;
  type: "lecture" | "assignment" | "revision" | "exam" | "reading" | "other";
  status: "todo" | "in-progress" | "done";
  dueDate?: string;
  durationMin?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeEntry {
  _id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  _id: string;
  userId: string;
  name: string;
  make?: string;
  model?: string;
  year?: string;
  plate?: string;
  mileage?: number;
  fuel: "petrol" | "diesel" | "electric" | "hybrid" | "other";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleService {
  _id: string;
  userId: string;
  vehicleId?: string;
  vehicleName: string;
  title: string;
  serviceType: "oil" | "tires" | "brakes" | "insurance" | "inspection" | "battery" | "wash" | "other";
  dueDate?: string;
  dueMileage?: number;
  mileage?: number;
  cost?: number;
  done: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  _id: string;
  userId: string;
  title: string;
  withWhom?: string;
  location?: string;
  start: string;
  end?: string;
  type: "doctor" | "dentist" | "meeting" | "personal" | "service" | "other";
  status: "scheduled" | "done" | "cancelled";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImportantDate {
  _id: string;
  userId: string;
  title: string;
  date: string;
  category: "birthday" | "anniversary" | "holiday" | "deadline" | "other";
  person?: string;
  repeatYearly: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContact {
  _id: string;
  userId: string;
  name: string;
  relation: string;
  phone: string;
  altPhone?: string;
  address?: string;
  priority: "high" | "medium" | "low";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyInfo {
  _id: string;
  userId: string;
  type: "allergy" | "condition" | "medication" | "blood" | "doctor" | "insurance" | "instruction" | "other";
  title: string;
  details: string;
  createdAt: string;
  updatedAt: string;
}

export interface Movement {
  _id: string;
  userId: string;
  who: string;
  destination: string;
  departAt: string;
  returnAt?: string;
  purpose?: string;
  transport?: string;
  status: "planned" | "out" | "back" | "cancelled";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

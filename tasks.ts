export type Priority = "low" | "medium" | "high";

export type Task = {
  id: string;
  title: string;
  description?: string;
  color: string;
  icon: string;
  category: string;
  priority: Priority;
  dueDate: string; // YYYY-MM-DD
  progress: number; // 0-100
  completed: boolean;
  completedAt?: string;
  createdAt: string;
};

const KEY = "taskflow:tasks:v1";
const THEME_KEY = "taskflow:theme";
const SEEDED_KEY = "taskflow:seeded:v1";

export const TASK_COLORS = [
  "oklch(0.72 0.18 275)",
  "oklch(0.72 0.18 155)",
  "oklch(0.78 0.16 60)",
  "oklch(0.7 0.22 20)",
  "oklch(0.68 0.2 320)",
  "oklch(0.7 0.18 200)",
];

export const TASK_ICONS = ["✨", "💻", "🚀", "📝", "📚", "🎯", "💼", "📊", "🎨", "📱", "🧠", "⚡"];

export const CATEGORIES = ["Work", "Personal", "Design", "Development", "Marketing", "Learning"];

export const PRIORITIES: Priority[] = ["low", "medium", "high"];

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Task[];
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(tasks));
}

export function getTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function setTheme(theme: "light" | "dark") {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function isDueToday(task: Task): boolean {
  return task.dueDate === todayKey();
}

export function newId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function formatDueDate(key: string): string {
  if (!key) return "No due date";
  const today = todayKey();
  if (key === today) return "Today";
  const d = new Date(key);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (key === todayKey(tomorrow)) return "Tomorrow";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function priorityLabel(p: Priority): string {
  return p === "high" ? "High" : p === "medium" ? "Medium" : "Low";
}

export function shouldSeed(): boolean {
  if (typeof window === "undefined") return false;
  if (localStorage.getItem(SEEDED_KEY)) return false;
  return !localStorage.getItem(KEY);
}

export function markSeeded() {
  if (typeof window === "undefined") return;
  localStorage.setItem(SEEDED_KEY, "1");
}

export function sampleTasks(): Task[] {
  const t = new Date();
  const plus = (n: number) => {
    const d = new Date(t);
    d.setDate(t.getDate() + n);
    return todayKey(d);
  };
  return [
    {
      id: newId(),
      title: "Finish Portfolio Website",
      description: "Polish hero, add case studies, ship to production.",
      color: TASK_COLORS[0],
      icon: "💻",
      category: "Development",
      priority: "high",
      dueDate: plus(0),
      progress: 65,
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: newId(),
      title: "Deploy AI Project",
      description: "Set up inference endpoint and connect the frontend.",
      color: TASK_COLORS[1],
      icon: "🚀",
      category: "Development",
      priority: "high",
      dueDate: plus(1),
      progress: 40,
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: newId(),
      title: "Create LinkedIn Post",
      description: "Announce the new project launch with visuals.",
      color: TASK_COLORS[4],
      icon: "📝",
      category: "Marketing",
      priority: "medium",
      dueDate: plus(0),
      progress: 20,
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: newId(),
      title: "Update Resume",
      description: "Add latest experience and refresh the summary.",
      color: TASK_COLORS[2],
      icon: "📄",
      category: "Personal",
      priority: "low",
      dueDate: plus(3),
      progress: 10,
      completed: false,
      createdAt: new Date().toISOString(),
    },
  ];
}

export type Habit = {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  createdAt: string; // ISO date
  target: number; // target days per week (1-7)
  checkins: string[]; // array of YYYY-MM-DD dates completed
};

const KEY = "habit-tracker:habits:v1";
const THEME_KEY = "habit-tracker:theme";

export const HABIT_COLORS = [
  "oklch(0.72 0.18 275)",
  "oklch(0.72 0.18 155)",
  "oklch(0.78 0.16 60)",
  "oklch(0.7 0.22 20)",
  "oklch(0.68 0.2 320)",
  "oklch(0.7 0.18 200)",
];

export const HABIT_ICONS = ["✨", "💧", "📚", "🏃", "🧘", "💪", "🎯", "☀️", "🌙", "🎨", "🍎", "💤"];

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function dateFromKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function loadHabits(): Habit[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Habit[];
  } catch {
    return [];
  }
}

export function saveHabits(habits: Habit[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(habits));
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

export function calcStreak(habit: Habit): number {
  const set = new Set(habit.checkins);
  let streak = 0;
  const cur = new Date();
  // if today isn't done, start from yesterday
  if (!set.has(todayKey(cur))) {
    cur.setDate(cur.getDate() - 1);
  }
  while (set.has(todayKey(cur))) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}

export function longestStreak(habit: Habit): number {
  if (habit.checkins.length === 0) return 0;
  const sorted = [...habit.checkins].sort();
  let longest = 1;
  let cur = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = dateFromKey(sorted[i - 1]);
    const curD = dateFromKey(sorted[i]);
    const diff = Math.round((curD.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) {
      cur++;
      longest = Math.max(longest, cur);
    } else {
      cur = 1;
    }
  }
  return longest;
}

export function weeklyProgress(habit: Habit): { done: number; total: number; percent: number } {
  const now = new Date();
  const day = now.getDay(); // 0 sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(todayKey(d));
  }
  const done = days.filter((d) => habit.checkins.includes(d)).length;
  const total = habit.target;
  return { done, total, percent: Math.min(100, (done / total) * 100) };
}

export function isCompletedToday(habit: Habit): boolean {
  return habit.checkins.includes(todayKey());
}

export function isHabitCompleted(habit: Habit): boolean {
  // "Completed" = met weekly target this week
  const { done, total } = weeklyProgress(habit);
  return done >= total;
}

export function newId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

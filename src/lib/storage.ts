import type { Theme } from "./types";

const THEME_KEY  = "fm-theme";
const BEST_KEY   = "fm-best";        // best solved count, all-time
const TIMER_KEY  = "fm-timer-limit"; // last selected timer (seconds)

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function safeSet(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export function loadTheme(): Theme {
  const t = safeGet<string | null>(THEME_KEY, null);
  if (t === "light" || t === "dark") return t;
  if (typeof window !== "undefined" && window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches) return "light";
  return "dark";
}
export function saveTheme(t: Theme): void { safeSet(THEME_KEY, t); }

export function loadBest(): number {
  return safeGet<number>(BEST_KEY, 0);
}
export function setBestIfHigher(n: number): boolean {
  const cur = loadBest();
  if (n > cur) { safeSet(BEST_KEY, n); return true; }
  return false;
}

export function loadTimerLimit(): number {
  return safeGet<number>(TIMER_KEY, 0);
}
export function saveTimerLimit(n: number): void { safeSet(TIMER_KEY, n); }

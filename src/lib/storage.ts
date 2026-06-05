import type { Mode, SessionResult, Settings, Theme } from "./types";

const THEME_KEY     = "fm-theme";
const SETTINGS_KEY  = "fm-settings";
const HISTORY_KEY   = "fm-history";
const BEST_KEY      = "fm-best";
const HISTORY_MAX   = 12;

export const DEFAULT_SETTINGS: Settings = {
  ops: ["+", "-", "*"],
  maxValue: 20,
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function safeSet(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export function loadSettings(): Settings {
  const s = safeGet<Partial<Settings>>(SETTINGS_KEY, {});
  return { ...DEFAULT_SETTINGS, ...s };
}
export function saveSettings(s: Settings): void { safeSet(SETTINGS_KEY, s); }

export function loadTheme(): Theme {
  const t = safeGet<string | null>(THEME_KEY, null);
  if (t === "light" || t === "dark") return t;
  if (typeof window !== "undefined" && window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches) return "light";
  return "dark";
}
export function saveTheme(t: Theme): void { safeSet(THEME_KEY, t); }

export function loadHistory(): SessionResult[] {
  return safeGet<SessionResult[]>(HISTORY_KEY, []);
}
export function recordSession(s: SessionResult): SessionResult[] {
  const h = loadHistory();
  h.unshift(s);
  while (h.length > HISTORY_MAX) h.pop();
  safeSet(HISTORY_KEY, h);
  return h;
}
export function clearHistory(): void {
  try { localStorage.removeItem(HISTORY_KEY); } catch {}
}

/** Best score per mode-key (e.g. "sprint:30" => 18 problems solved). */
type Bests = Record<string, number>;
export function bestKey(mode: Mode): string {
  return `${mode.kind}:${mode.goal}`;
}
export function getBest(mode: Mode): number | null {
  const b = safeGet<Bests>(BEST_KEY, {});
  return b[bestKey(mode)] ?? null;
}
export function setBestIfHigher(mode: Mode, score: number): boolean {
  const b = safeGet<Bests>(BEST_KEY, {});
  const k = bestKey(mode);
  if (b[k] == null || score > b[k]) {
    b[k] = score;
    safeSet(BEST_KEY, b);
    return true;
  }
  return false;
}

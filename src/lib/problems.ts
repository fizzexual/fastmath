import type { Operation, Problem, Settings } from "./types";

function randInt(lo: number, hi: number): number {
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

function pickOp(ops: Operation[]): Operation {
  if (!ops.length) return "+";
  return ops[Math.floor(Math.random() * ops.length)];
}

const SYMBOL: Record<Operation, string> = { "+": "+", "-": "−", "*": "×", "/": "÷" };

/** Difficulty curve. Level = number of correctly-answered problems so far.
 * Pure escalation: operations get added in, then number range climbs. */
export function settingsForLevel(level: number): Settings {
  if (level < 5)   return { ops: ["+"],                maxValue: 10 };
  if (level < 10)  return { ops: ["+", "-"],           maxValue: 15 };
  if (level < 20)  return { ops: ["+", "-"],           maxValue: 25 };
  if (level < 30)  return { ops: ["+", "-", "*"],      maxValue: 30 };
  if (level < 50)  return { ops: ["+", "-", "*"],      maxValue: 50 };
  if (level < 75)  return { ops: ["+", "-", "*", "/"], maxValue: 70 };
  if (level < 100) return { ops: ["+", "-", "*", "/"], maxValue: 100 };
  return { ops: ["+", "-", "*", "/"], maxValue: 144 };
}

/** Short label for the current level's difficulty (for the HUD). */
export function tierLabel(level: number): string {
  if (level < 5)   return "Tier 1";
  if (level < 10)  return "Tier 2";
  if (level < 20)  return "Tier 3";
  if (level < 30)  return "Tier 4";
  if (level < 50)  return "Tier 5";
  if (level < 75)  return "Tier 6";
  if (level < 100) return "Tier 7";
  return "Tier 8";
}

export function generateProblem(settings: Settings): Problem {
  const op = pickOp(settings.ops);
  const max = Math.max(2, settings.maxValue);
  let a: number, b: number, answer: number;

  switch (op) {
    case "+":
      a = randInt(1, max);
      b = randInt(1, max);
      answer = a + b;
      break;
    case "-": {
      const big = randInt(1, max);
      const small = randInt(1, big);
      a = big;
      b = small;
      answer = a - b;
      break;
    }
    case "*": {
      const cap = max <= 12 ? 12 : Math.min(12, Math.max(5, Math.floor(Math.sqrt(max * 5))));
      a = randInt(2, cap);
      b = randInt(2, cap);
      answer = a * b;
      break;
    }
    case "/": {
      const cap = max <= 12 ? 12 : Math.min(12, Math.max(5, Math.floor(Math.sqrt(max))));
      b = randInt(2, cap);
      answer = randInt(2, cap);
      a = b * answer;
      break;
    }
  }
  return { a, b, op, answer, display: `${a} ${SYMBOL[op]} ${b}` };
}

export function generateNext(prev: Problem | null, level: number, attempts = 6): Problem {
  const s = settingsForLevel(level);
  let p = generateProblem(s);
  for (let i = 0; i < attempts; i++) {
    if (!prev) return p;
    if (p.display !== prev.display) return p;
    p = generateProblem(s);
  }
  return p;
}

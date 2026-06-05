import type { Operation, Problem, ProblemSettings } from "./types";

function randInt(lo: number, hi: number): number {
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}
function pick<T>(xs: T[]): T { return xs[Math.floor(Math.random() * xs.length)]; }

const SUP = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];
const SUB = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"];

function sup(n: number): string {
  return String(n).split("").map((d) => SUP[+d]).join("");
}
function sub(n: number): string {
  return String(n).split("").map((d) => SUB[+d]).join("");
}

/* ---------- Difficulty curve ----------
 * Pure escalation. Each tier introduces something new and/or widens range.
 * Operations stay capped so answers remain mental, not calculator-grade.
 */
export const TIERS: { from: number; ops: Operation[]; maxValue: number; label: string }[] = [
  { from: 0,    ops: ["+"],                                     maxValue: 10,  label: "Tier 1 · +" },
  { from: 5,    ops: ["+", "-"],                                maxValue: 15,  label: "Tier 2 · + −" },
  { from: 12,   ops: ["+", "-"],                                maxValue: 25,  label: "Tier 3 · + −" },
  { from: 22,   ops: ["+", "-", "*"],                           maxValue: 30,  label: "Tier 4 · + − ×" },
  { from: 35,   ops: ["+", "-", "*"],                           maxValue: 50,  label: "Tier 5 · + − ×" },
  { from: 55,   ops: ["+", "-", "*", "/"],                      maxValue: 70,  label: "Tier 6 · + − × ÷" },
  { from: 80,   ops: ["+", "-", "*", "/"],                      maxValue: 100, label: "Tier 7 · + − × ÷" },
  { from: 110,  ops: ["+", "-", "*", "/", "sq"],                maxValue: 144, label: "Tier 8 · squares" },
  { from: 140,  ops: ["+", "-", "*", "/", "sq", "sqrt"],        maxValue: 144, label: "Tier 9 · √" },
  { from: 170,  ops: ["+", "-", "*", "/", "sq", "sqrt", "cube"],          maxValue: 200, label: "Tier 10 · cubes" },
  { from: 200,  ops: ["+", "-", "*", "/", "sq", "sqrt", "cube", "cbrt"],  maxValue: 200, label: "Tier 11 · ∛" },
  { from: 235,  ops: ["+", "-", "*", "/", "sq", "sqrt", "cube", "cbrt", "pow"], maxValue: 250, label: "Tier 12 · powers" },
  { from: 270,  ops: ["+", "-", "*", "/", "sq", "sqrt", "cube", "cbrt", "pow", "mod"], maxValue: 300, label: "Tier 13 · mod" },
  { from: 310,  ops: ["+", "-", "*", "/", "sq", "sqrt", "cube", "cbrt", "pow", "mod", "log"], maxValue: 400, label: "Tier 14 · log" },
];

export function tierForLevel(level: number): typeof TIERS[number] {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (level >= TIERS[i].from) return TIERS[i];
  }
  return TIERS[0];
}
export function tierIndex(level: number): number {
  let idx = 0;
  for (let i = 0; i < TIERS.length; i++) if (level >= TIERS[i].from) idx = i;
  return idx;
}
export function tierLabel(level: number): string {
  return tierForLevel(level).label;
}
export function tierOpsLabel(level: number): string {
  return tierForLevel(level).ops.map(opSymbol).join(" ");
}
export function settingsForLevel(level: number): ProblemSettings {
  const t = tierForLevel(level);
  return { ops: t.ops, maxValue: t.maxValue };
}

/** Human-readable symbol for an op (used in the HUD subtitle). */
export function opSymbol(op: Operation): string {
  switch (op) {
    case "+":    return "+";
    case "-":    return "−";
    case "*":    return "×";
    case "/":    return "÷";
    case "sq":   return "x²";
    case "sqrt": return "√";
    case "cube": return "x³";
    case "cbrt": return "∛";
    case "pow":  return "xʸ";
    case "mod":  return "mod";
    case "log":  return "log";
  }
}

/* ---------- Generators ---------- */

function genAdd(max: number): Problem {
  const a = randInt(1, max), b = randInt(1, max);
  return { op: "+", display: `${a} + ${b}`, answer: a + b };
}
function genSub(max: number): Problem {
  const a = randInt(2, max);
  const b = randInt(1, a);
  return { op: "-", display: `${a} − ${b}`, answer: a - b };
}
function genMul(max: number): Problem {
  const cap = max <= 12 ? 12 : Math.min(12, Math.max(5, Math.floor(Math.sqrt(max * 5))));
  const a = randInt(2, cap), b = randInt(2, cap);
  return { op: "*", display: `${a} × ${b}`, answer: a * b };
}
function genDiv(max: number): Problem {
  const cap = max <= 12 ? 12 : Math.min(12, Math.max(5, Math.floor(Math.sqrt(max))));
  const b = randInt(2, cap);
  const answer = randInt(2, cap);
  return { op: "/", display: `${b * answer} ÷ ${b}`, answer };
}
function genSquare(max: number): Problem {
  const cap = max <= 20 ? 15 : 20;
  const a = randInt(2, cap);
  return { op: "sq", display: `${a}²`, answer: a * a };
}
function genSqrt(max: number): Problem {
  const cap = max <= 20 ? 15 : 20;
  const root = randInt(2, cap);
  return { op: "sqrt", display: `√${root * root}`, answer: root };
}
function genCube(max: number): Problem {
  const cap = max <= 100 ? 7 : 9;
  const a = randInt(2, cap);
  return { op: "cube", display: `${a}³`, answer: a * a * a };
}
function genCbrt(max: number): Problem {
  const cap = max <= 100 ? 7 : 9;
  const root = randInt(2, cap);
  return { op: "cbrt", display: `∛${root * root * root}`, answer: root };
}
function genPow(_max: number): Problem {
  // Keep results modest: pick (a, b) so a^b stays under ~500.
  const choices: [number, number][] = [
    [2, 3], [2, 4], [2, 5], [2, 6], [2, 7], [2, 8],
    [3, 2], [3, 3], [3, 4], [3, 5],
    [4, 2], [4, 3], [4, 4],
    [5, 2], [5, 3],
    [6, 2], [6, 3],
    [7, 2], [7, 3],
    [8, 2], [9, 2], [10, 2], [11, 2], [12, 2],
  ];
  const [a, b] = pick(choices);
  return { op: "pow", display: `${a}${sup(b)}`, answer: Math.pow(a, b) };
}
function genMod(_max: number): Problem {
  const b = randInt(3, 11);
  const q = randInt(2, 9);
  const r = randInt(1, b - 1);
  const a = q * b + r;
  return { op: "mod", display: `${a} mod ${b}`, answer: r };
}
function genLog(_max: number): Problem {
  const base = pick([2, 3, 5, 10]);
  const exp  = base === 2 ? randInt(2, 8) : base === 10 ? randInt(2, 4) : randInt(2, 4);
  const value = Math.pow(base, exp);
  return { op: "log", display: `log${sub(base)} ${value}`, answer: exp };
}

const GENERATORS: Record<Operation, (max: number) => Problem> = {
  "+": genAdd, "-": genSub, "*": genMul, "/": genDiv,
  sq: genSquare, sqrt: genSqrt,
  cube: genCube, cbrt: genCbrt,
  pow: genPow, mod: genMod, log: genLog,
};

export function generateProblem(s: ProblemSettings): Problem {
  const op = pick(s.ops);
  return GENERATORS[op](s.maxValue);
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

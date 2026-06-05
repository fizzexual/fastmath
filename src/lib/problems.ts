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
  { from: 0,   ops: ["+"],                                      maxValue: 12,  label: "Tier 1 · +" },
  { from: 5,   ops: ["+", "-"],                                 maxValue: 20,  label: "Tier 2 · + −" },
  { from: 12,  ops: ["+", "-", "expr"],                         maxValue: 30,  label: "Tier 3 · + − expr" },
  { from: 22,  ops: ["+", "-", "*", "expr"],                    maxValue: 50,  label: "Tier 4 · + − × expr" },
  { from: 35,  ops: ["+", "-", "*", "expr", "pct"],             maxValue: 100, label: "Tier 5 · + − × expr %" },
  { from: 55,  ops: ["+", "-", "*", "/", "expr", "pct"],        maxValue: 200, label: "Tier 6 · + − × ÷ expr %" },
  { from: 80,  ops: ["+", "-", "*", "/", "expr", "pct"],        maxValue: 350, label: "Tier 7 · wider range" },
  { from: 110, ops: ["+", "-", "*", "/", "expr", "pct", "sq"],  maxValue: 500, label: "Tier 8 · squares" },
  { from: 140, ops: ["+", "-", "*", "/", "expr", "pct", "sq", "sqrt"],
    maxValue: 500, label: "Tier 9 · √" },
  { from: 170, ops: ["+", "-", "*", "/", "expr", "pct", "sq", "sqrt", "cube"],
    maxValue: 700, label: "Tier 10 · cubes" },
  { from: 200, ops: ["+", "-", "*", "/", "expr", "pct", "sq", "sqrt", "cube", "cbrt"],
    maxValue: 700, label: "Tier 11 · ∛" },
  { from: 235, ops: ["+", "-", "*", "/", "expr", "pct", "sq", "sqrt", "cube", "cbrt", "pow"],
    maxValue: 900, label: "Tier 12 · powers" },
  { from: 270, ops: ["+", "-", "*", "/", "expr", "pct", "sq", "sqrt", "cube", "cbrt", "pow", "mod"],
    maxValue: 1200, label: "Tier 13 · mod" },
  { from: 310, ops: ["+", "-", "*", "/", "expr", "pct", "sq", "sqrt", "cube", "cbrt", "pow", "mod", "log"],
    maxValue: 1500, label: "Tier 14 · log" },
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
    case "expr": return "(…)";
    case "pct":  return "%";
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

/* Composite expressions. Three sub-patterns:
 *   1. Left-to-right + / − chain      (a + b − c)
 *   2. PEMDAS implicit                (a + b × c — multiplication first)
 *   3. Explicit parentheses           ((a + b) × c)
 * All evaluated to integer answers. */
function genExpr(max: number): Problem {
  const cap = Math.max(10, Math.min(max, 200));
  const pattern = pick(["lr", "lr", "pemdas", "paren"] as const);

  if (pattern === "lr") {
    const a = randInt(1, cap);
    const b = randInt(1, cap);
    const c = randInt(1, cap);
    const op1 = pick(["+", "−"] as const);
    const op2 = pick(["+", "−"] as const);
    const v1 = op1 === "+" ? a + b : a - b;
    const v2 = op2 === "+" ? v1 + c : v1 - c;
    // Keep the answer non-negative for clarity in mental math.
    if (v2 < 0) return genExpr(max);
    return { op: "expr", display: `${a} ${op1} ${b} ${op2} ${c}`, answer: v2 };
  }

  if (pattern === "pemdas") {
    const b = randInt(2, 9);
    const c = randInt(2, 9);
    const product = b * c;
    const op = pick(["+", "−"] as const);
    const a = op === "+" ? randInt(1, cap) : randInt(product + 1, product + cap);
    const answer = op === "+" ? a + product : a - product;
    return { op: "expr", display: `${a} ${op} ${b} × ${c}`, answer };
  }

  // paren
  const a = randInt(1, Math.max(8, Math.floor(cap / 2)));
  const b = randInt(1, Math.max(8, Math.floor(cap / 2)));
  const c = randInt(2, 7);
  const op = pick(["+", "−"] as const);
  const inner = op === "+" ? a + b : Math.max(0, a - b);
  // Guarantee non-negative inside parens by swapping if needed.
  const left = op === "+" ? a : Math.max(a, b);
  const right = op === "+" ? b : Math.min(a, b);
  const answer = inner * c;
  return { op: "expr", display: `(${left} ${op} ${right}) × ${c}`, answer };
}

/* Percent-of. p% of base, choosing p ∈ {5,10,20,25,50,75} and base
 * so the result is always an integer. */
function genPct(max: number): Problem {
  const cap = Math.max(20, Math.min(max, 400));
  const choices: { p: number; multiple: number }[] = [
    { p: 5,  multiple: 20 },
    { p: 10, multiple: 10 },
    { p: 20, multiple: 5  },
    { p: 25, multiple: 4  },
    { p: 50, multiple: 2  },
    { p: 75, multiple: 4  },
  ];
  const { p, multiple } = pick(choices);
  const maxK = Math.max(1, Math.floor(cap / multiple));
  const k = randInt(1, maxK);
  const base = multiple * k;
  return { op: "pct", display: `${p}% of ${base}`, answer: (base * p) / 100 };
}

const GENERATORS: Record<Operation, (max: number) => Problem> = {
  "+": genAdd, "-": genSub, "*": genMul, "/": genDiv,
  sq: genSquare, sqrt: genSqrt,
  cube: genCube, cbrt: genCbrt,
  pow: genPow, mod: genMod, log: genLog,
  expr: genExpr, pct: genPct,
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

export type Operation =
  | "+" | "-" | "*" | "/"
  | "sq"     // x²
  | "sqrt"   // √x
  | "cube"   // x³
  | "cbrt"   // ∛x
  | "pow"    // a^b for small a, b
  | "mod"    // a mod b
  | "log"    // log_b(a) where a is a clean power
  | "expr"   // composite: a op b op c with proper precedence (and sometimes parens)
  | "pct";   // p% of base, picked so answer is integer

export interface Problem {
  op: Operation;
  display: string;
  answer: number;
}

export interface ProblemSettings {
  ops: Operation[];
  maxValue: number;
}

export interface Solve {
  problem: Problem;
  responseMs: number;
}

export interface SessionResult {
  solves: Solve[];
  totalMs: number;
  finishedAt: number;
  timerLimit: number;
  startLevel: number;
  reason: "time" | "manual";
}

export type Theme = "light" | "dark";

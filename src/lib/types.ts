export type Operation = "+" | "-" | "*" | "/";

export interface Problem {
  a: number;
  b: number;
  op: Operation;
  answer: number;
  display: string;     // "47 + 23"
}

export type ModeKind = "sprint" | "endless" | "target";

export interface Mode {
  kind: ModeKind;
  /** Sprint: total seconds. Target: number of problems to solve. Endless: ignored. */
  goal: number;
}

export interface Settings {
  ops: Operation[];
  /** Upper bound for the operand range. Multiplication/division clamp themselves. */
  maxValue: number;
}

export interface Solve {
  problem: Problem;
  responseMs: number;
}

export interface SessionResult {
  mode: Mode;
  settings: Settings;
  solves: Solve[];
  totalMs: number;
  finishedAt: number;
}

export type Theme = "light" | "dark";

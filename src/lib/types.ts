export type Operation = "+" | "-" | "*" | "/";

export interface Problem {
  a: number;
  b: number;
  op: Operation;
  answer: number;
  display: string;
}

export interface Settings {
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
  timerLimit: number; // 0 = no limit, else seconds
  reason: "time" | "manual";
}

export type Theme = "light" | "dark";

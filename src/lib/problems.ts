import type { Operation, Problem, Settings } from "./types";

function randInt(lo: number, hi: number): number {
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

function pickOp(ops: Operation[]): Operation {
  if (!ops.length) return "+";
  return ops[Math.floor(Math.random() * ops.length)];
}

const SYMBOL: Record<Operation, string> = { "+": "+", "-": "−", "*": "×", "/": "÷" };

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
      // Keep answer non-negative for cleaner mental arithmetic.
      const big = randInt(1, max);
      const small = randInt(1, big);
      a = big;
      b = small;
      answer = a - b;
      break;
    }
    case "*": {
      // Cap factors so the answer feels mental, not a calculator job.
      const cap = max <= 12 ? 12 : Math.min(12, Math.max(5, Math.floor(Math.sqrt(max * 5))));
      a = randInt(2, cap);
      b = randInt(2, cap);
      answer = a * b;
      break;
    }
    case "/": {
      // Always integer division. Pick the answer and divisor, derive dividend.
      const cap = max <= 12 ? 12 : Math.min(12, Math.max(5, Math.floor(Math.sqrt(max))));
      b = randInt(2, cap);
      answer = randInt(2, cap);
      a = b * answer;
      break;
    }
  }
  return { a, b, op, answer, display: `${a} ${SYMBOL[op]} ${b}` };
}

/** Avoid generating the same problem back-to-back. */
export function generateNext(prev: Problem | null, settings: Settings, attempts = 6): Problem {
  let p = generateProblem(settings);
  for (let i = 0; i < attempts; i++) {
    if (!prev) return p;
    if (p.display !== prev.display) return p;
    p = generateProblem(settings);
  }
  return p;
}

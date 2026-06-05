import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { generateNext } from "../lib/problems";
import type { Mode, Problem, SessionResult, Settings, Solve } from "../lib/types";

interface Props {
  mode: Mode;
  settings: Settings;
  onFinish: (r: SessionResult) => void;
  onAbort: () => void;
}

function fmtTime(sec: number): string {
  if (sec < 60) return `${sec}`;
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function Game({ mode, settings, onFinish, onAbort }: Props) {
  const [problem, setProblem] = useState<Problem>(() => generateNext(null, settings));
  const [input, setInput] = useState("");
  const [solves, setSolves] = useState<Solve[]>([]);
  const [flash, setFlash] = useState<"good" | "bad" | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const startedAt = useRef<number>(Date.now());
  const problemStart = useRef<number>(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input on mount and after every advance.
  useEffect(() => { inputRef.current?.focus(); }, [problem]);

  // 100ms tick for the timer so stats feel live.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, []);

  // End-of-session conditions.
  useEffect(() => {
    if (mode.kind === "sprint") {
      const elapsed = (now - startedAt.current) / 1000;
      if (elapsed >= mode.goal) end();
    } else if (mode.kind === "target") {
      if (solves.length >= mode.goal) end();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, solves.length, mode.kind, mode.goal]);

  function end() {
    const totalMs = Date.now() - startedAt.current;
    onFinish({
      mode,
      settings,
      solves,
      totalMs,
      finishedAt: Date.now(),
    });
  }

  function handleSubmit(value: string) {
    const n = parseInt(value, 10);
    if (Number.isNaN(n)) return;
    if (n !== problem.answer) {
      setFlash("bad");
      setTimeout(() => setFlash(null), 380);
      return;
    }
    advance();
  }

  function advance() {
    const elapsed = Date.now() - problemStart.current;
    setSolves((prev) => [...prev, { problem, responseMs: elapsed }]);
    setFlash("good");
    setTimeout(() => setFlash(null), 220);
    const next = generateNext(problem, settings);
    setProblem(next);
    setInput("");
    problemStart.current = Date.now();
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (!/^-?\d*$/.test(raw)) return;
    setInput(raw);
    // Auto-advance on exact match. Skip empty string and lone "-".
    if (raw !== "" && raw !== "-") {
      const n = parseInt(raw, 10);
      if (!Number.isNaN(n) && n === problem.answer) {
        // Slight delay to let the user see the match.
        requestAnimationFrame(() => {
          advance();
        });
      }
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(input);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onAbort();
    }
  }

  // Live stats
  const solved = solves.length;
  const totalMs = solved ? solves.reduce((s, x) => s + x.responseMs, 0) : 0;
  const avgMs = solved ? Math.round(totalMs / solved) : 0;
  const elapsedSec = Math.floor((now - startedAt.current) / 1000);
  const remaining = mode.kind === "sprint" ? Math.max(0, mode.goal - elapsedSec) : null;
  const targetLeft = mode.kind === "target" ? Math.max(0, mode.goal - solved) : null;
  const ppm = elapsedSec > 0 ? Math.round((solved * 60) / Math.max(1, elapsedSec)) : 0;

  return (
    <div className="game">
      <div className="stats">
        <div className="stats-left">
          {remaining != null && (
            <div className="stat">
              <span className={"stat-value" + (remaining <= 10 ? " bad" : "")}>{fmtTime(remaining)}</span>
              <span className="stat-label">remaining</span>
            </div>
          )}
          {remaining == null && (
            <div className="stat">
              <span className="stat-value">{fmtTime(elapsedSec)}</span>
              <span className="stat-label">time</span>
            </div>
          )}
          {targetLeft != null && (
            <div className="stat">
              <span className="stat-value accent">{targetLeft}</span>
              <span className="stat-label">to go</span>
            </div>
          )}
        </div>
        <div className="stats-right">
          <div className="stat">
            <span className="stat-value accent">{solved}</span>
            <span className="stat-label">solved</span>
          </div>
          <div className="stat">
            <span className="stat-value">{(avgMs / 1000).toFixed(2)}s</span>
            <span className="stat-label">avg</span>
          </div>
          <div className="stat">
            <span className="stat-value">{ppm}</span>
            <span className="stat-label">/ min</span>
          </div>
        </div>
      </div>

      <div className={"play" + (flash === "good" ? " flash-good" : "") + (flash === "bad" ? " flash-bad" : "")}>
        <AnimatePresence mode="wait">
          <motion.div
            key={problem.display}
            className="problem"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
          >
            {problem.display}
          </motion.div>
        </AnimatePresence>
        <input
          ref={inputRef}
          className="answer-input"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={input}
          onChange={onChange}
          onKeyDown={onKeyDown}
          aria-label="Answer"
        />
        <div className="hint">
          Type the answer. <kbd>Enter</kbd> to submit · <kbd>Esc</kbd> to quit
        </div>

        <button className="ghost small give-up-btn" onClick={onAbort}>Give up</button>
      </div>
    </div>
  );
}

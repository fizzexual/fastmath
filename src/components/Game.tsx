import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { generateNext, rangeForLevel, tierForLevel, tierOpsLabel } from "../lib/problems";
import type { Problem, SessionResult, Solve } from "../lib/types";

interface Props {
  timerLimit: number;          // seconds; 0 = unlimited
  startLevel: number;          // starting tier offset (0 = Tier 1)
  onFinish: (r: SessionResult) => void;
}

function fmtTime(sec: number): string {
  if (sec < 60) return `${sec}`;
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function Game({ timerLimit, startLevel, onFinish }: Props) {
  const [problem, setProblem] = useState<Problem>(() => generateNext(null, startLevel));
  const [input, setInput] = useState("");
  const [solves, setSolves] = useState<Solve[]>([]);
  const [flash, setFlash] = useState<"good" | "bad" | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const startedAt = useRef<number>(Date.now());
  const problemStart = useRef<number>(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);
  const finishedRef = useRef<boolean>(false);

  useEffect(() => { inputRef.current?.focus(); }, [problem]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, []);

  // Time-limit expiry.
  useEffect(() => {
    if (timerLimit <= 0 || finishedRef.current) return;
    const elapsed = (now - startedAt.current) / 1000;
    if (elapsed >= timerLimit) end("time");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, timerLimit]);

  function end(reason: "time" | "manual") {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish({
      solves,
      totalMs: Date.now() - startedAt.current,
      finishedAt: Date.now(),
      timerLimit,
      startLevel,
      reason,
    });
  }

  function advance() {
    const elapsed = Date.now() - problemStart.current;
    const nextSolves = [...solves, { problem, responseMs: elapsed }];
    setSolves(nextSolves);
    setFlash("good");
    setTimeout(() => setFlash(null), 220);
    const nextLevel = startLevel + nextSolves.length;
    const next = generateNext(problem, nextLevel);
    setProblem(next);
    setInput("");
    problemStart.current = Date.now();
  }

  function tryAnswer(value: string) {
    const n = parseInt(value, 10);
    if (Number.isNaN(n)) return;
    if (n !== problem.answer) {
      setFlash("bad");
      setTimeout(() => setFlash(null), 380);
      return;
    }
    advance();
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (!/^-?\d*$/.test(raw)) return;
    setInput(raw);
    if (raw !== "" && raw !== "-") {
      const n = parseInt(raw, 10);
      if (!Number.isNaN(n) && n === problem.answer) {
        requestAnimationFrame(() => advance());
      }
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      tryAnswer(input);
    } else if (e.key === "Escape") {
      e.preventDefault();
      end("manual");
    }
  }

  const solved = solves.length;
  const totalMs = solved ? solves.reduce((s, x) => s + x.responseMs, 0) : 0;
  const avgMs = solved ? Math.round(totalMs / solved) : 0;
  const elapsedSec = Math.floor((now - startedAt.current) / 1000);
  const remaining = timerLimit > 0 ? Math.max(0, timerLimit - elapsedSec) : null;
  const ppm = elapsedSec > 0 ? Math.round((solved * 60) / Math.max(1, elapsedSec)) : 0;
  const currentLevel = startLevel + solved;
  const t = tierForLevel(currentLevel);
  const tierName = t.label.split(" · ")[0];
  const opsLabel = tierOpsLabel(currentLevel);
  const liveRange = rangeForLevel(currentLevel);

  return (
    <div className="game">
      <div className="stats">
        <div className="stats-left">
          {remaining != null ? (
            <div className="stat">
              <span className={"stat-value" + (remaining <= 10 ? " bad" : "")}>{fmtTime(remaining)}</span>
              <span className="stat-label">remaining</span>
            </div>
          ) : (
            <div className="stat">
              <span className="stat-value">{fmtTime(elapsedSec)}</span>
              <span className="stat-label">time</span>
            </div>
          )}
          <div className="stat">
            <span className="stat-value accent">{tierName}</span>
            <span className="stat-label">{opsLabel} · to {liveRange}</span>
          </div>
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
          Type the answer · <kbd>Enter</kbd> submits · <kbd>Esc</kbd> ends run
        </div>
      </div>
    </div>
  );
}

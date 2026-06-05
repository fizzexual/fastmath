import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TIERS, tierIndex } from "../lib/problems";

interface Props {
  timerLimit: number;
  onChangeTimer: (sec: number) => void;
  startLevel: number;
  onChangeStartLevel: (level: number) => void;
  onReset: () => void;
  best: number;
}

const TIMER_OPTIONS = [
  { v: 0,    label: "No limit" },
  { v: 60,   label: "1 minute" },
  { v: 120,  label: "2 minutes" },
  { v: 300,  label: "5 minutes" },
  { v: 600,  label: "10 minutes" },
];

function fmtTimer(sec: number): string {
  if (sec === 0) return "No limit";
  if (sec < 60) return `${sec}s`;
  if (sec % 60 === 0) return `${sec / 60} min`;
  return `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, "0")}`;
}

function useDismiss(open: boolean, close: () => void, ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close, ref]);
}

export function Header({
  timerLimit, onChangeTimer,
  startLevel, onChangeStartLevel,
  onReset, best,
}: Props) {
  const [timerOpen, setTimerOpen] = useState(false);
  const [tierOpen, setTierOpen]   = useState(false);
  const timerRef = useRef<HTMLDivElement>(null);
  const tierRef  = useRef<HTMLDivElement>(null);

  useDismiss(timerOpen, () => setTimerOpen(false), timerRef);
  useDismiss(tierOpen,  () => setTierOpen(false),  tierRef);

  const currentTierIdx = tierIndex(startLevel);

  return (
    <header className="topbar">
      <div className="brand-small">
        FastMath
        {best > 0 && <span className="best-chip">best {best}</span>}
      </div>
      <div className="topbar-actions">
        <button className="ghost small" onClick={onReset} title="Restart the run from your selected tier">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" />
          </svg>
          Reset
        </button>

        <div className="timer-menu" ref={tierRef}>
          <button
            className={"ghost small" + (startLevel > 0 ? " active-chip" : "")}
            onClick={() => setTierOpen((v) => !v)}
            title="Pick a starting tier"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 20V10M12 20V4M18 20v-6" />
            </svg>
            Start: {TIERS[currentTierIdx].label.split(" · ")[0]}
          </button>
          <AnimatePresence>
            {tierOpen && (
              <motion.ul
                className="timer-dropdown wide"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.14 }}
              >
                {TIERS.map((t, i) => (
                  <li
                    key={t.from}
                    className={currentTierIdx === i ? "active" : ""}
                    onClick={() => { onChangeStartLevel(t.from); setTierOpen(false); }}
                  >
                    {t.label}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        <div className="timer-menu" ref={timerRef}>
          <button
            className={"ghost small" + (timerLimit > 0 ? " active-chip" : "")}
            onClick={() => setTimerOpen((v) => !v)}
            title="Set run timer"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2.5M9 2h6" />
            </svg>
            {fmtTimer(timerLimit)}
          </button>
          <AnimatePresence>
            {timerOpen && (
              <motion.ul
                className="timer-dropdown"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.14 }}
              >
                {TIMER_OPTIONS.map((o) => (
                  <li
                    key={o.v}
                    className={timerLimit === o.v ? "active" : ""}
                    onClick={() => { onChangeTimer(o.v); setTimerOpen(false); }}
                  >
                    {o.label}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

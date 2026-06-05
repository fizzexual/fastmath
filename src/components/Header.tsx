import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  timerLimit: number;
  onChangeTimer: (sec: number) => void;
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

function fmtLabel(sec: number): string {
  if (sec === 0) return "No limit";
  if (sec < 60) return `${sec}s`;
  if (sec % 60 === 0) return `${sec / 60} min`;
  return `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, "0")}`;
}

export function Header({ timerLimit, onChangeTimer, onReset, best }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <header className="topbar">
      <div className="brand-small">
        FastMath
        {best > 0 && <span className="best-chip">best {best}</span>}
      </div>
      <div className="topbar-actions">
        <button className="ghost small" onClick={onReset} title="Restart the run">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" />
          </svg>
          Reset
        </button>
        <div className="timer-menu" ref={menuRef}>
          <button
            className={"ghost small" + (timerLimit > 0 ? " active-chip" : "")}
            onClick={() => setMenuOpen((v) => !v)}
            title="Set run timer"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2.5M9 2h6" />
            </svg>
            {fmtLabel(timerLimit)}
          </button>
          <AnimatePresence>
            {menuOpen && (
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
                    onClick={() => { onChangeTimer(o.v); setMenuOpen(false); }}
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

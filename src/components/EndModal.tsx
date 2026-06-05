import { AnimatePresence, motion } from "framer-motion";
import type { SessionResult } from "../lib/types";

interface Props {
  open: boolean;
  result: SessionResult | null;
  newBest: boolean;
  onPlayAgain: () => void;
}

function fmtTime(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function EndModal({ open, result, newBest, onPlayAgain }: Props) {
  if (!result) return null;
  const solved = result.solves.length;
  const totalSec = result.totalMs / 1000;
  const avgMs = solved ? result.totalMs / solved : 0;
  const fastestMs = solved ? Math.min(...result.solves.map((s) => s.responseMs)) : 0;
  const ppm = totalSec > 0 ? Math.round((solved * 60) / totalSec) : 0;

  const headline =
    result.reason === "time"
      ? `${solved} solved in ${fmtTime(result.timerLimit)}`
      : `${solved} solved in ${totalSec.toFixed(1)}s`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <motion.div className="modal-backdrop" />
          <motion.div
            className="modal-card"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
          >
            {newBest && (
              <motion.span
                className="new-best"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 400, damping: 18 }}
              >
                NEW BEST
              </motion.span>
            )}
            <h2 className="end-headline">{headline}</h2>
            <p className="end-sub">
              {result.reason === "time" ? "Time's up." : "Run ended."}
            </p>

            <div className="end-grid">
              <Cell value={String(solved)} label="solved" accent />
              <Cell value={`${(avgMs / 1000).toFixed(2)}s`} label="avg / problem" />
              <Cell value={`${(fastestMs / 1000).toFixed(2)}s`} label="fastest" />
              <Cell value={String(ppm)} label="per minute" />
            </div>

            <div className="modal-actions">
              <button className="primary" onClick={onPlayAgain}>Play again</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Cell({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="end-cell">
      <span className={"end-cell-value" + (accent ? " accent" : "")}>{value}</span>
      <span className="end-cell-label">{label}</span>
    </div>
  );
}

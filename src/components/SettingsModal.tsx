import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Operation, Settings } from "../lib/types";

interface Props {
  open: boolean;
  initial: Settings;
  onClose: () => void;
  onSave: (s: Settings) => void;
}

const OPS: { value: Operation; label: string }[] = [
  { value: "+", label: "+" },
  { value: "-", label: "−" },
  { value: "*", label: "×" },
  { value: "/", label: "÷" },
];

const RANGES: { value: number; label: string }[] = [
  { value: 10,  label: "to 10" },
  { value: 20,  label: "to 20" },
  { value: 50,  label: "to 50" },
  { value: 100, label: "to 100" },
];

export function SettingsModal({ open, initial, onClose, onSave }: Props) {
  const [settings, setSettings] = useState<Settings>(initial);

  useEffect(() => { if (open) setSettings(initial); }, [open, initial]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const toggleOp = (op: Operation) => {
    const has = settings.ops.includes(op);
    if (has && settings.ops.length === 1) return; // keep at least one
    setSettings({
      ...settings,
      ops: has ? settings.ops.filter((o) => o !== op) : [...settings.ops, op],
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.18}}>
          <motion.div className="modal-backdrop" onClick={onClose} />
          <motion.div
            className="modal-card"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 6 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 22, fontSize: 20 }}>Settings</h2>

            <h3 className="section-title">Operations</h3>
            <div className="ops-grid">
              {OPS.map((o) => (
                <button
                  key={o.value}
                  className={"op-btn" + (settings.ops.includes(o.value) ? " active" : "")}
                  onClick={() => toggleOp(o.value)}
                >
                  {o.label}
                </button>
              ))}
            </div>

            <h3 className="section-title">Number range</h3>
            <div className="range-presets">
              {RANGES.map((r) => (
                <button
                  key={r.value}
                  className={settings.maxValue === r.value ? "active" : ""}
                  onClick={() => setSettings({ ...settings, maxValue: r.value })}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div className="modal-actions">
              <button className="ghost" onClick={onClose}>Cancel</button>
              <button className="primary" onClick={() => { onSave(settings); onClose(); }}>Save</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

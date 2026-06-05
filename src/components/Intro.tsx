import { useMemo } from "react";
import type { Mode, SessionResult, Settings } from "../lib/types";
import { getBest } from "../lib/storage";

interface Props {
  settings: Settings;
  history: SessionResult[];
  onStart: (mode: Mode) => void;
  onOpenSettings: () => void;
  onClearHistory: () => void;
}

const MODE_OPTIONS: { mode: Mode; name: string; detail: string }[] = [
  { mode: { kind: "sprint",  goal: 30  }, name: "Sprint 30s",  detail: "How many can you solve in 30 seconds?" },
  { mode: { kind: "sprint",  goal: 60  }, name: "Sprint 60s",  detail: "A full minute, no breaks." },
  { mode: { kind: "sprint",  goal: 120 }, name: "Sprint 2m",   detail: "Endurance under pressure." },
  { mode: { kind: "target",  goal: 25  }, name: "Race to 25",  detail: "First to 25 correct — beat your time." },
  { mode: { kind: "target",  goal: 50  }, name: "Race to 50",  detail: "Long-form race. Stay focused." },
  { mode: { kind: "endless", goal: 0   }, name: "Endless",     detail: "No timer. Quit when you want." },
];

export function Intro({ settings, history, onStart, onOpenSettings, onClearHistory }: Props) {
  const opsLabel = useMemo(() => settings.ops.join(" "), [settings.ops]);
  return (
    <main className="intro">
      <div className="brand">
        <h1>FastMath</h1>
        <p>Mental math drills. Type the answer — auto-advances on correct.</p>
      </div>

      <div className="modes">
        {MODE_OPTIONS.map((opt) => {
          const best = getBest(opt.mode);
          return (
            <button
              key={`${opt.mode.kind}-${opt.mode.goal}`}
              className="mode-card"
              onClick={() => onStart(opt.mode)}
            >
              <span className="mode-name">{opt.name}</span>
              <span className="mode-detail">{opt.detail}</span>
              {best != null && (
                <span className="mode-best">
                  Best: {best}{opt.mode.kind === "target" ? "s" : ""}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="intro-row">
        <button className="ghost small" onClick={onOpenSettings}>
          ⚙ {opsLabel} · to {settings.maxValue}
        </button>
      </div>

      {history.length > 0 && (
        <div className="history">
          <div className="history-title">
            <h3>Recent</h3>
            <button className="link-btn" onClick={onClearHistory}>Clear</button>
          </div>
          <ol className="history-list">
            {history.slice(0, 8).map((s, i) => (
              <HistoryRow key={i} session={s} />
            ))}
          </ol>
        </div>
      )}
    </main>
  );
}

function HistoryRow({ session }: { session: SessionResult }) {
  const solved = session.solves.length;
  const mode = session.mode.kind === "sprint"
    ? `Sprint ${session.mode.goal}s`
    : session.mode.kind === "target"
      ? `Race to ${session.mode.goal}`
      : "Endless";
  const avgMs = solved ? Math.round(session.totalMs / solved) : 0;
  const score = session.mode.kind === "target"
    ? `${(session.totalMs / 1000).toFixed(1)}s`
    : `${solved}`;
  return (
    <li className="history-row">
      <span className="history-mode">{mode}</span>
      <span className="history-conf">
        {session.settings.ops.join(" ")} · to {session.settings.maxValue} · avg {(avgMs / 1000).toFixed(2)}s
      </span>
      <span className="history-score">{score}</span>
    </li>
  );
}

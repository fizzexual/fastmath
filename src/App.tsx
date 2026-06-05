import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeToggle } from "./components/ThemeToggle";
import { Intro } from "./components/Intro";
import { Game } from "./components/Game";
import { EndModal } from "./components/EndModal";
import { SettingsModal } from "./components/SettingsModal";
import {
  clearHistory, loadHistory, loadSettings,
  recordSession, saveSettings, setBestIfHigher,
} from "./lib/storage";
import type { Mode, SessionResult, Settings } from "./lib/types";

type Screen = "intro" | "game";

export default function App() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [mode, setMode] = useState<Mode | null>(null);
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [history, setHistory] = useState<SessionResult[]>(() => loadHistory());
  const [endResult, setEndResult] = useState<SessionResult | null>(null);
  const [newBest, setNewBest] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);

  function start(m: Mode) {
    setMode(m);
    setEndResult(null);
    setNewBest(false);
    setSessionKey((k) => k + 1);
    setScreen("game");
  }

  function finish(result: SessionResult) {
    const updated = recordSession(result);
    setHistory(updated);
    // "Best" depends on mode kind. For sprint+endless, more solved is better.
    // For target, lower time is better — we flip the sign so setBestIfHigher logic still applies.
    const scoreForBest =
      result.mode.kind === "target"
        ? result.solves.length >= result.mode.goal
          ? -result.totalMs  // lower time = higher score (negative)
          : -Infinity        // didn't finish, not a best candidate
        : result.solves.length;
    const isBest = scoreForBest > -Infinity && setBestIfHigher(result.mode, scoreForBest);
    setNewBest(isBest);
    setEndResult(result);
  }

  function abort() {
    setEndResult(null);
    setNewBest(false);
    setScreen("intro");
  }

  function backToMenu() {
    setEndResult(null);
    setNewBest(false);
    setScreen("intro");
  }

  function playAgain() {
    if (!mode) { backToMenu(); return; }
    setEndResult(null);
    setNewBest(false);
    setSessionKey((k) => k + 1);
    setScreen("game");
  }

  function onClearHistory() {
    clearHistory();
    setHistory([]);
  }

  function onSaveSettings(s: Settings) {
    setSettings(s);
    saveSettings(s);
  }

  return (
    <>
      <ThemeToggle />

      <AnimatePresence mode="wait" initial={false}>
        {screen === "intro" && (
          <motion.div
            key="intro"
            style={{ flex: 1, display: "flex", minHeight: 0, width: "100%" }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Intro
              settings={settings}
              history={history}
              onStart={start}
              onOpenSettings={() => setSettingsOpen(true)}
              onClearHistory={onClearHistory}
            />
          </motion.div>
        )}
        {screen === "game" && mode && (
          <motion.div
            key="game"
            style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, width: "100%" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <Game
              key={sessionKey}
              mode={mode}
              settings={settings}
              onFinish={finish}
              onAbort={abort}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <EndModal
        open={!!endResult}
        result={endResult}
        newBest={newBest}
        onBackToMenu={backToMenu}
        onPlayAgain={playAgain}
      />

      <SettingsModal
        open={settingsOpen}
        initial={settings}
        onClose={() => setSettingsOpen(false)}
        onSave={onSaveSettings}
      />
    </>
  );
}

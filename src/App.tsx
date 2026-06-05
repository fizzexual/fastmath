import { useState } from "react";
import { ThemeToggle } from "./components/ThemeToggle";
import { Header } from "./components/Header";
import { Game } from "./components/Game";
import { EndModal } from "./components/EndModal";
import {
  loadBest, loadStartLevel, loadTimerLimit,
  saveStartLevel, saveTimerLimit, setBestIfHigher,
} from "./lib/storage";
import type { SessionResult } from "./lib/types";

export default function App() {
  const [timerLimit, setTimerLimit] = useState<number>(() => loadTimerLimit());
  const [startLevel, setStartLevel] = useState<number>(() => loadStartLevel());
  const [sessionKey, setSessionKey] = useState(0);
  const [endResult, setEndResult] = useState<SessionResult | null>(null);
  const [newBest, setNewBest] = useState(false);
  const [best, setBest] = useState<number>(() => loadBest());

  function handleFinish(result: SessionResult) {
    const solved = result.solves.length;
    const isBest = setBestIfHigher(solved);
    if (isBest) setBest(solved);
    setNewBest(isBest);
    setEndResult(result);
  }

  function reset() {
    setEndResult(null);
    setNewBest(false);
    setSessionKey((k) => k + 1);
  }

  function changeTimer(sec: number) {
    setTimerLimit(sec);
    saveTimerLimit(sec);
    reset();
  }

  function changeStartLevel(n: number) {
    setStartLevel(n);
    saveStartLevel(n);
    reset();
  }

  return (
    <>
      <ThemeToggle />
      <Header
        timerLimit={timerLimit}
        onChangeTimer={changeTimer}
        startLevel={startLevel}
        onChangeStartLevel={changeStartLevel}
        onReset={reset}
        best={best}
      />
      <Game
        key={sessionKey}
        timerLimit={timerLimit}
        startLevel={startLevel}
        onFinish={handleFinish}
      />
      <EndModal
        open={!!endResult}
        result={endResult}
        newBest={newBest}
        onPlayAgain={reset}
      />
    </>
  );
}

# FastMath

Mental math drills for fast data processing.
Type the answer — it auto-advances on correct.

```
   47 × 8
   ______
```

## Run

```bash
npm install
npm run dev      # dev server on :5174
# or
npm run build && npm run preview
```

Requires Node 18+. No backend.

## Modes

- **Sprint 30s / 60s / 2m** — solve as many as you can before the clock runs out.
- **Race to 25 / 50** — first to the target wins on time.
- **Endless** — no timer, quit when you like.

Best score per mode is tracked locally.

## Settings

Pick the operations (`+`, `−`, `×`, `÷`) and the number range (`to 10` … `to 100`).
Subtraction always lands non-negative; division always divides evenly. Multiplication
and division clamp their factors so the answer stays mental, not a calculator job.

## Stack

React 18 · TypeScript · Vite · framer-motion. Static build, deployable to any
host that serves a `dist/` folder.

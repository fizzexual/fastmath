# FastMath

Brain-training drill for fast mental math. One problem at a time. Type the
answer — auto-advances on the exact match. Difficulty escalates as you go.

```
    7² + 16
    ───────
        ?
```

## Run

```bash
npm install
npm run dev          # dev server, opens on :5174
# or
npm run build && npm run preview
```

Requires Node 18+. Pure static frontend, no backend.

## How it works

The whole app is one endless run. There are no modes and no settings — just
type. Three header controls:

- **Reset** — restart the run from your selected starting tier
- **Start: Tier N** — jump straight to a higher tier (skip the easy warm-up)
- **Timer** — set an optional time limit (No limit / 1 / 2 / 5 / 10 minutes)

Type the answer in the input. When your number matches, it advances. `Enter`
explicitly submits (useful for wrong-feel checks). `Esc` ends the run early.

## Difficulty curve

Each tier adds a new operation or widens the number range. The total pool
of distinct possible problems clears **10,000 by Tier 5** and **3.3 million
by Tier 14**, so you'll basically never see the same problem twice.

| Tier | After solving | Operations | Range |
|---|---|---|---|
| 1 | 0   | `+`                                                            | 1–12   |
| 2 | 5   | `+ −`                                                          | 1–20   |
| 3 | 12  | `+ −` and `(…)` composite (`a + b − c`, `(a + b) × c`)         | 1–30   |
| 4 | 22  | `+ − ×` `(…)`                                                  | 1–50   |
| 5 | 35  | `+ − ×` `(…)` `%`                                              | 1–100  |
| 6 | 55  | `+ − × ÷` `(…)` `%`                                            | 1–200  |
| 7 | 80  | same · wider range                                             | 1–350  |
| 8 | 110 | + `x²`                                                         | 1–500  |
| 9 | 140 | + `√`                                                          | 1–500  |
| 10| 170 | + `x³`                                                         | 1–700  |
| 11| 200 | + `∛`                                                          | 1–700  |
| 12| 235 | + `xʸ` (powers)                                                | 1–900  |
| 13| 270 | + `mod`                                                        | 1–1200 |
| 14| 310 | + `log_b`                                                      | 1–1500 |

Sample problems by tier:

```
Tier 3:    9 + 7 − 4
Tier 4:    (8 + 3) × 5
Tier 5:    25% of 80
Tier 6:    47 + 6 × 8
Tier 8:      15²
Tier 11:     ∛729
Tier 12:      4⁵
Tier 13:    47 mod 6
Tier 14:    log₂ 128
```

All answers are integers — composite expressions respect PEMDAS, square
roots only over perfect squares, percentages only over clean multiples,
divisions with even quotients, logarithms over clean powers.

## Stack

React 18 · TypeScript · Vite · framer-motion. Pure static build, deployable
anywhere that serves a `dist/` folder.

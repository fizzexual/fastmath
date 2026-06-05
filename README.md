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

Each tier adds a new operation or widens the number range. Multiplication and
division factors stay capped so even Tier 14 stays mental.

| Tier | After solving | Operations | Range |
|---|---|---|---|
| 1 | 0   | `+`                                                             | 1–10  |
| 2 | 5   | `+ −`                                                           | 1–15  |
| 3 | 12  | `+ −`                                                           | 1–25  |
| 4 | 22  | `+ − ×`                                                         | 1–30  |
| 5 | 35  | `+ − ×`                                                         | 1–50  |
| 6 | 55  | `+ − × ÷`                                                       | 1–70  |
| 7 | 80  | `+ − × ÷`                                                       | 1–100 |
| 8 | 110 | `+ − × ÷ x²`                                                    | 1–144 |
| 9 | 140 | `+ − × ÷ x² √`                                                  | 1–144 |
| 10| 170 | `+ − × ÷ x² √ x³`                                               | 1–200 |
| 11| 200 | `+ − × ÷ x² √ x³ ∛`                                             | 1–200 |
| 12| 235 | `+ − × ÷ x² √ x³ ∛ xʸ`                                          | 1–250 |
| 13| 270 | `+ − × ÷ x² √ x³ ∛ xʸ mod`                                      | 1–300 |
| 14| 310 | `+ − × ÷ x² √ x³ ∛ xʸ mod log`                                  | 1–400 |

Sample problems by tier:

```
Tier 4:    27 × 8
Tier 8:      15²
Tier 11:     ∛729
Tier 12:      4⁵
Tier 13:    47 mod 6
Tier 14:    log₂ 128
```

All answers are integers — square roots only over perfect squares,
divisions only with even quotients, logarithms only over clean powers.

## Stack

React 18 · TypeScript · Vite · framer-motion. Pure static build, deployable
anywhere that serves a `dist/` folder.

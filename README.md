# IDS Assessment Platform — Frontend

Dashboard for the
[`ids-assessment-backend`](https://github.com/MergenUchiha/ids-assessment-backend):
run Metasploit scenarios against a lab, watch the attack animate, and read how
well the IDS detected it.

## Stack

| | |
|---|---|
| Framework | React 18 + TypeScript, Vite 5 |
| Routing | react-router-dom 6 |
| Data | TanStack Query |
| Styling | Tailwind CSS 3 |
| Charts | Recharts |
| i18n | English, Russian, Turkmen |

## Getting started

The backend must be running first — see its README.

```bash
bun install            # or npm install
cp .env.example .env
npm run dev            # http://localhost:5173
```

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000` | Backend base URL |

The dev server is one of the origins the backend allows through
`CORS_ORIGINS`.

## Pages

| Route | What it shows |
|---|---|
| `/` | Dashboard: run status breakdown, cumulative precision/recall/F1, top signatures |
| `/experiments` | Experiments and their runs; launch a run |
| `/scenarios` | Attack scenarios (Metasploit module, port, expected signatures) |
| `/ids-profiles` | IDS rulesets |
| `/runs/:id` | One run: an animated attack/detection view, the confusion matrix, alerts |
| `/alerts` | Recent alerts across all runs |

## Authentication

Sign in with an account an administrator created; there is no registration —
the backend closed it, because an account can launch an attack. The token goes
into `localStorage` and is attached as a bearer header. A 401 clears it and
returns to the login screen.

## Metrics

The backend records one confusion-matrix cell per run — TP, FP, FN or TN —
keyed on whether an attack was launched, not on whether the exploit landed.
Precision, recall and F1 are meaningless over a single run (they can only be 0
or 1), so:

- **`deriveScores` in `src/types`** computes them from cells wherever they are
  shown. On a run detail page it derives that run's degenerate scores; on the
  dashboard it sums the cells across runs first, which is the only aggregate
  that means anything.
- **`GET /experiments/:id/summary`** returns the same figures computed
  server-side for a whole experiment.

## Scripts

```bash
npm run dev       # dev server on 5173
npm run build     # tsc && vite build
npm run preview   # serve the production build
npm run lint      # ESLint
```

## Known limitations

* **No tests.** Correctness was checked by building, linting and running the
  app against a live backend.
* **The bundle is one 720 kB chunk** (Recharts is most of it); no code
  splitting.
* **The token lives in `localStorage`,** readable by any script on the page.
* **The alerts page shows the 500 most recent alerts** with no pagination.

## Licence

Coursework project.

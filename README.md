# IDS Lab — Frontend

React + TypeScript + Vite + Tailwind + Recharts

## Setup

```bash
npm install
npm run dev       # http://localhost:5173
```

## Backend proxy
Vite proxies `/api/*` → `http://localhost:3000` (configured in `vite.config.ts`)

## Pages
- `/` Dashboard — KPI cards, runs per experiment chart, alert severity distribution, recent runs
- `/experiments` Experiments — CRUD + run launcher with scenario selector, runs table
- `/runs/:id` Run Detail — full report: metrics, TP/FP/FN, radar chart, attack timeline, alerts table
- `/scenarios` Scenarios — CRUD for Metasploit attack scenarios
- `/ids-profiles` IDS Profiles — CRUD for Suricata ruleset profiles
- `/alerts` Alerts — global alert table with search + sort

## Auth
JWT stored in `localStorage`. Login at `/login` (default: admin@test.com / admin123)

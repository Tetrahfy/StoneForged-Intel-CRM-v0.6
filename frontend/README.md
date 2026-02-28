cat > README.md << 'EOF'
# StoneForged-Intel

Sales intelligence dashboard & lead generation tool for nutraceutical ingredient suppliers (functional gummies, sleep/energy products).

Tracks trigger events (new R&D hires, reformulations, facility expansions, funding rounds) to identify high-readiness prospects and prioritize outreach.

## Current Features (v0.6)
- Add prospects manually with trigger-based auto-scoring (+3–4 bonus for high-value signals like reformulation)
- Real-time search/filter by brand, trigger, decision maker, next action
- Sortable table (brand & score)
- Permanent delete (SQLite backend)
- Export filtered or full list to CSV
- Dark-mode UI with KPI cards
- Local-first (no external APIs needed)

## Tech Stack
- Frontend: React 19 + TypeScript + Vite + Tailwind CSS v3
- Backend: Node.js + Express + better-sqlite3 (SQLite database)
- Fully offline/local development

## Quick Start (Local)
```bash
# Backend (in one terminal)
cd backend
node server.js

# Frontend (in separate terminal)
cd frontend
npm run dev

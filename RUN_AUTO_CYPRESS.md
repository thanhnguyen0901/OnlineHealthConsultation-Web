# 1 — Install dependencies (already done)
cd OnlineHealthConsultation-Web
npm install

# 2 — Start the Vite dev server (terminal A)
npm run dev

# 3a — Interactive UI (terminal B) — recommended for development
npm run cy:open

# 3b — Headless run (CI)
npm run cy:run

# 3c — Run a specific suite
npm run cy:run:auth
npm run cy:run:patient
npm run cy:run:admin
npm run cy:run:doctor
npm run cy:run:role-guard

# 4 — One-shot: start dev server + run all specs (uses start-server-and-test)
npm run test:e2e
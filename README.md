# Legal Correspondence Manager

A bilingual (English/Hindi) legal correspondence tracking and AI drafting app for Indian PWD/construction contract disputes.

## Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

1. Push this folder to a GitHub repository
2. Connect the repo on [app.netlify.com](https://app.netlify.com)
3. Netlify auto-detects `netlify.toml` — just click **Deploy**

## Local dev

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build
npm run preview   # preview production build
```

## Features

- Case management with opposing party tracking
- Full correspondence timeline per case
- AI-powered letter drafting (reminder, payment demand, escalation, fresh notice)
- Bilingual English/Hindi with print-ready output
- Interest calculator (Sec. 73/74 Indian Contract Act)
- Quick reply with threaded correspondence
- Luminaire Docs API sync (optional)
- All data stored in browser IndexedDB (Dexie.js) — no backend needed
- Full-text fuzzy search (Fuse.js)
- Keyboard shortcuts for power users
- Offline-capable with action queue

## Tech Stack

| Layer | Library | Version |
|-------|---------|---------|
| UI | React | ^18.3.1 |
| Language | TypeScript | ^5.9.3 (strict mode) |
| Build | Vite | ^6.4.4 |
| Styling | Tailwind CSS v4 | ^4.3.3 |
| Storage | Dexie (IndexedDB) | ^4.4.6 |
| Search | Fuse.js | ^7.5.0 |
| Icons | Lucide React | ^0.441.0 |

## Security

- `npm audit` — 0 vulnerabilities
- No hardcoded API keys or secrets in source (keys entered by user at runtime)
- TypeScript strict mode enabled (`noUnusedLocals`, `noUncheckedIndexedAccess`, `noImplicitOverride`, etc.)
- `.gitignore` excludes `.env`, `node_modules`, `dist`, `__pycache__`

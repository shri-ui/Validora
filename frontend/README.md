# Validora — Startup Idea Validator (React + Vite)

Standard React 19 + Vite + TypeScript app with react-router-dom, Tailwind CSS v4, and shadcn-style UI components. Identical UI to the original workspace preview.

## Getting started

```bash
npm install   # or: bun install / pnpm install
npm run dev   # starts the dev server
npm run build # production build to dist/
```

## Structure

- `src/main.tsx` — entry, mounts `BrowserRouter`
- `src/App.tsx` — all routes (`/`, `/history`, `/reports`, `/builder`, `/projects`, `/account`, `/login`, `/signup`, `/forgot-password`)
- `src/components/workspace/` — app screens and the shared `Workspace` layout
- `src/components/ui/` — shadcn-style UI primitives
- `src/lib/preview-data.ts` — sample data and PDF/ZIP download helpers (UI preview only)
- `src/styles.css` — design system (Tailwind v4 theme tokens, light/dark)

Note: this is a UI-only preview — validation, auth, and persistence use sample data and are not connected to live services.

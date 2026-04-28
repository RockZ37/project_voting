## Development Guide

This document describes how to set up a local development environment and common tasks.

Prereqs
- Node.js 18+ or compatible
- pnpm recommended (works with npm/yarn)

Install

```bash
pnpm install
```

Start dev server

```bash
pnpm dev
```

Type checking / lint

```bash
pnpm run lint
```

Build

```bash
pnpm build
```

Design notes
- The project uses Vite with the React plugin and TypeScript (jsx: react-jsx).
- Tailwind classes are used throughout; utility `cn` (in `src/lib/utils.ts`) merges classnames using `clsx` + `tailwind-merge`.

TypeScript tips
- `src/types/react-shims.d.ts` contains shims for `react` and `react/jsx-runtime` if you're working without `@types/react` installed.
- We installed `@types/react` and `@types/react-dom` as dev dependencies; run `pnpm install` after pulling.

Troubleshooting
- If you see `Could not find a declaration file for module 'react'` ensure `@types/react` exists in `devDependencies` and `tsconfig.json` includes `typeRoots`/`include` that contain `src/types`.

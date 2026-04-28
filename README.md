# Project Voting (CivicVote)

This repository is a TypeScript + React frontend for a national online voting demo (CivicVote). It provides authentication, identity verification, ballot selection, and admin dashboards for monitoring and auditing. The project uses Vite, Tailwind, Recharts, Lucide icons, and Motion for UI/UX.

## Quick Start

Prerequisites: Node.js (>=18), pnpm (recommended) or npm/yarn

Install dependencies:

```bash
pnpm install
# or
npm install
```

Run dev server:

```bash
pnpm dev
# or
npm run dev
```

Build for production:

```bash
pnpm build
```

Type-check (lint):

```bash
pnpm run lint
```

Preview production build:

```bash
pnpm preview
```


## Project Layout

- `src/` — application source
  - `components/` — shared UI components and layout
  - `views/` — page-level views (Auth, Verify, Ballot, Admin views)
  - `lib/` — utilities (e.g., `cn` helper)
  - `types.ts` — shared TypeScript types

## Contributing
See `docs/CONTRIBUTING.md` for development workflow and coding guidelines.

## License
This repository does not include a license file. Add one if you plan to publish the project.

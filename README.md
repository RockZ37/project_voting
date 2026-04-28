# Project Voting (CivicVote)

CivicVote is a TypeScript + React voting demo app with a modern UI and a biometric verification flow. It includes voter authentication, identity verification with real face detection, ballot selection, and admin monitoring screens.

## What Is Included

- Voter login and admin login path
- Identity verification using live camera + TensorFlow face detection
- Ballot selection and review flow
- Admin dashboard, voter registry, and audit log views
- Mobile-accessible HTTPS dev preview for camera testing on phones

## Tech Stack

- React 19 + TypeScript 5
- Vite 6
- Tailwind CSS 4
- Motion (animation)
- Lucide React (icons)
- Recharts (charts)
- TensorFlow.js + face-detection model (real-time face detection)
- localtunnel (HTTPS URL for phone testing)

## Prerequisites

- Node.js 18+
- pnpm 10+ (recommended) or npm

## Installation

1. Clone the repository.
2. Install dependencies.

```bash
pnpm install
```

Alternative with npm:

```bash
npm install
```

## Run Modes

### Local Desktop Development

```bash
pnpm dev
```

Opens Vite on:

- Local: `http://localhost:3000`
- Network (LAN): `http://<your-ip>:3000`

### Phone Camera Development (Recommended for Face Detection)

```bash
pnpm run dev:mobile
```

This command:

- Starts Vite on an available local port
- Creates an HTTPS tunnel URL (loca.lt)
- Prints the HTTPS URL in terminal

Use that HTTPS URL on your phone browser for camera access.

## Available Scripts

- `pnpm dev` - Start standard Vite dev server (HTTP)
- `pnpm run dev:mobile` - Start Vite + HTTPS tunnel for phone testing
- `pnpm build` - Production build
- `pnpm preview` - Preview production build
- `pnpm run lint` - Type-check (`tsc --noEmit`)
- `pnpm run clean` - Remove dist folder

## Camera and Face Detection Notes

- The verify screen uses the browser camera API and TensorFlow-based face detection.
- Scan progress increases only when a face is detected.
- If no face is detected, progress slows down/backtracks.
- Camera access is blocked on insecure contexts in most mobile browsers.
- For phones, always use the HTTPS URL from `pnpm run dev:mobile`.

## Project Structure

```text
src/
  App.tsx
  main.tsx
  index.css
  types.ts
  components/
    layout/
      Header.tsx
    ui/
      Button.tsx
      Card.tsx
      Input.tsx
  views/
    AuthView.tsx
    VerifyIdentityView.tsx
    BallotView.tsx
    AdminDashboardView.tsx
    AdminRegistryView.tsx
    AdminLogsView.tsx
  lib/
    utils.ts
scripts/
  dev-mobile.mjs
docs/
  DEVELOPMENT.md
  ARCHITECTURE.md
  COMPONENTS.md
  TROUBLESHOOTING.md
```

## Documentation Index

- `docs/DEVELOPMENT.md` - Setup, workflow, scripts, and release steps
- `docs/ARCHITECTURE.md` - App architecture and state flow
- `docs/COMPONENTS.md` - Components and view-level behavior
- `docs/TROUBLESHOOTING.md` - Common issues and fixes

## Current Status

- Type checking passes (`pnpm run lint`)
- Real face detection is integrated into verification flow
- Mobile HTTPS preview support is added

## License

No license file is currently included.

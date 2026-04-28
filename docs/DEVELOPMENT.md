# Development Guide

This guide covers setup, daily development workflow, and release checks.

## 1) Environment Setup

Requirements:

- Node.js 18+
- pnpm 10+ (recommended)

Install dependencies:

```bash
pnpm install
```

## 2) Local Development

Start standard dev server:

```bash
pnpm dev
```

This runs Vite on port 3000 and binds to all interfaces.

## 3) Mobile/Camera Development

For phone testing, use secure tunnel mode:

```bash
pnpm run dev:mobile
```

What this does:

- Finds an open local port
- Starts Vite on that port
- Opens an HTTPS localtunnel URL for external/mobile access

Use the printed HTTPS URL in your phone browser. Do not use plain LAN HTTP URL for camera features.

## 4) Type Checking

Run TypeScript checks:

```bash
pnpm run lint
```

Current lint script runs:

```bash
tsc --noEmit
```

## 5) Build and Preview

Build production assets:

```bash
pnpm build
```

Preview build locally:

```bash
pnpm preview
```

## 6) Core Dependencies in Use

- UI/framework: `react`, `react-dom`, `typescript`
- Build: `vite`, `@vitejs/plugin-react`
- Styling: `tailwindcss`, `@tailwindcss/vite`
- Motion/icons/charts: `motion`, `lucide-react`, `recharts`
- Face detection: `@tensorflow-models/face-detection`, `@tensorflow/tfjs-*`
- Mobile HTTPS tunnel: `localtunnel`

## 7) Suggested Dev Workflow

1. Pull latest changes.
2. Run `pnpm install`.
3. Run `pnpm run lint` before coding.
4. Start `pnpm dev` or `pnpm run dev:mobile`.
5. Re-run `pnpm run lint` after edits.
6. Build with `pnpm build` before release.

## 8) Notes on Face Verification

- Verification now depends on real face detection, not a fake timer.
- The scan progresses only when a face is visible.
- If camera is blocked or unsupported, an explicit error message is shown.

# Architecture Overview

## 1) High-Level Design

This project is a single-page React application with state-driven view switching in `App.tsx`.

There is no external router. Instead, app view is controlled by an `AppView` enum and rendered by a `switch` statement.

## 2) Folder Responsibilities

- `src/views` - Page-level experiences
- `src/components` - Reusable UI and layout pieces
- `src/lib` - Utility helpers (class name merge, etc.)
- `src/types.ts` - Shared app-level TypeScript models
- `scripts` - Developer tooling scripts (mobile HTTPS dev runner)

## 3) View Flow

Primary flow for voters:

1. Auth view
2. Verify identity view (camera + face detection)
3. Ballot view
4. Review
5. Success

Admin flow:

1. Auth view with admin entry pattern
2. Verify identity view
3. Admin dashboard / registry / logs

## 4) Face Verification Architecture

The verification screen combines:

- Browser camera stream (`getUserMedia`)
- TensorFlow backend (`tfjs` webgl)
- Face detector model (`@tensorflow-models/face-detection`)

Runtime behavior:

1. Camera stream is requested.
2. Stream is attached to video element.
3. Face detector is initialized.
4. Detector loop estimates faces from video frames.
5. Progress increases when face is detected, decreases when not detected.
6. On completion, stream/detection loop are cleaned up and user advances.

## 5) UI and Styling

- Tailwind utilities power layout and visual design.
- Reusable primitives are in `src/components/ui`.
- `cn` utility combines `clsx` and `tailwind-merge` to avoid class conflicts.

## 6) State Management

- Local React state is used throughout.
- Verification screen keeps scan and camera state locally.
- Global app-level view selection stays in `App.tsx`.

## 7) Animation and Data Visualization

- Motion drives transitions and scan-line effects.
- Recharts is used in admin visualizations.

## 8) Security and Runtime Constraints

- Camera access requires secure context on most mobile browsers.
- Use HTTPS tunnel mode for phone testing (`pnpm run dev:mobile`).
- On insecure origins, verification shows a clear error and does not run scan.

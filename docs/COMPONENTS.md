## Components and Views

This document lists the primary UI components and page views and where to find them.

UI Primitives (`src/components/ui`)
- `Button.tsx` — polymorphic button with `variant` and `size` props, uses `cn`.
- `Card.tsx` — container wrapper used widely for panels.
- `Input.tsx` — text input with optional icon.

Layout
- `components/layout/Header.tsx` — top header and navigation controls for switching views.

Views (`src/views`)
- `AuthView.tsx` — login screen and admin shortcut.
- `VerifyIdentityView.tsx` — biometric verification mock with scanning animation.
- `BallotView.tsx` — candidate selection with write-in option.
- `AdminDashboardView.tsx` — charts, controls, and system status.
- `AdminRegistryView.tsx` — list and manage registered voters.
- `AdminLogsView.tsx` — audit logs and export controls.

Utilities
- `src/lib/utils.ts` — `cn` helper (clsx + tailwind-merge).

Types
- `src/types.ts` — Candidate, Voter, AuditLog, AppView, etc.

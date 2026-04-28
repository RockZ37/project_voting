## Architecture Overview

This frontend is a single-page React application structured around page-level `views` and shared `components`.

Key folders
- `src/views/` — top-level screens (AuthView, VerifyIdentityView, BallotView, AdminDashboardView, AdminRegistryView, AdminLogsView).
- `src/components/` — UI primitives and layout (Header, ui/Button, ui/Card, ui/Input).
- `src/lib/` — small utilities (`cn` for class merging).
- `src/types.ts` — application domain types (Voter, Candidate, AuditLog, AppView enum).

State & Routing
- The app uses local React state in `App.tsx` to track `currentView` (no external router). Views are rendered via a `switch` statement and animated with `motion/react`.

Styling
- Tailwind CSS utility classes are used. `cn` wraps `clsx` + `tailwind-merge` for safe concatenation and deduplication.

Icons & Animations
- Icons: `lucide-react` is used for consistent UI icons.
- Animations: `motion/react` is used for interactive transitions.

Charts
- Recharts (`recharts`) is used for the admin results bar chart.

TypeScript
- Compiler options: `jsx: react-jsx`, `module: ESNext`, `isolatedModules: true`.
- `src/types/react-shims.d.ts` was added to provide local shims; `@types/react` and `@types/react-dom` are installed for full typings.

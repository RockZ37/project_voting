# CivicVote Frontend

CivicVote is a frontend-first voting platform built with React and TypeScript. It demonstrates a full voting experience with voter authentication, camera-based identity verification, ballot review and submission, and an admin workspace for monitoring elections, managing voters, and creating candidates.

This repository currently focuses on the frontend application. Backend brainstorming can happen after this foundation is documented and stabilized.

## What This Frontend Includes

- Voter login and admin login entry flow
- Camera-based identity verification with face detection
- Ballot selection, review, and success flow
- Election results view
- Admin dashboard with election management
- Admin registry with CSV upload and searchable voter list
- Admin logs and audit-style activity screens
- Admin sidebar grouping elections and their candidates
- Admin profile menu in the top header
- Mobile-friendly layout and animated transitions

## Tech Stack

- React 19
- TypeScript 5
- Vite 6
- Tailwind CSS 4
- Motion for transitions and page animation
- Lucide React for icons
- Recharts for dashboard visualizations
- TensorFlow.js face detection for verification
- localtunnel for HTTPS mobile testing

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
      AdminPageLayout.tsx
      BallotPageLayout.tsx
      BallotSidebar.tsx
      Sidebar.tsx
    ui/
      Button.tsx
      Card.tsx
      Input.tsx
  data/
    elections.ts
  lib/
    utils.ts
  views/
    AuthView.tsx
    VerifyIdentityView.tsx
    VerificationConfirmView.tsx
    ElectionsView.tsx
    ElectionDetailView.tsx
    BallotView.tsx
    AdminDashboardView.tsx
    AdminRegistryView.tsx
    AdminLogsView.tsx
    AdminCreateElectionView.tsx
    AdminCreateCandidateView.tsx
```

## App Flow

The app is a single-page application. It does not use a router. Instead, `App.tsx` controls the active screen with an `AppView` enum and renders the matching view.

### Voter Flow

1. Authentication
2. Identity verification
3. Election browsing
4. Candidate selection
5. Ballot review
6. Vote submission
7. Success screen
8. Results screen

### Admin Flow

1. Authentication
2. Identity verification
3. Admin dashboard
4. Voter registry
5. Audit logs
6. Create election
7. Create candidate

## Key Frontend Features

### Identity Verification

The verification screen uses the browser camera and TensorFlow face detection. It only progresses when a face is visible, which makes it suitable for demos on real devices.

Use the HTTPS mobile mode when testing camera access on phones.

### Admin Dashboard

The admin dashboard shows election status and allows the admin to manage elections and candidates from a single interface.

### Admin Registry

The registry view supports:

- CSV import of voter records
- Search by voter name, ID, email, status, or date
- In-app table updates after import
- Empty-state handling when no rows match

### Admin Sidebar

The admin sidebar now groups data by election. Newly created elections appear under the Elections section, and each election expands to show its candidates.

### Admin Profile Menu

The header includes a profile icon that opens a profile card for both student and admin sessions. For admins, a fallback admin profile is shown so the menu is always responsive.

## Available Scripts

```bash
pnpm dev
```
Starts the Vite dev server on port 3000.

```bash
pnpm run dev:mobile
```
Starts the app with a secure HTTPS tunnel for camera testing on phones.

```bash
pnpm build
```
Builds the production bundle.

```bash
pnpm preview
```
Previews the production build locally.

```bash
pnpm run lint
```
Runs the TypeScript check with `tsc --noEmit`.

```bash
pnpm run clean
```
Removes the `dist` folder.

## Setup

### Requirements

- Node.js 18 or newer
- pnpm 10 or newer recommended

### Install Dependencies

```bash
pnpm install
```

### Start Development

```bash
pnpm dev
```

Open the local URL printed by Vite in your browser.

### Mobile Camera Testing

```bash
pnpm run dev:mobile
```

This is the recommended mode for phone testing because browser camera access usually requires HTTPS.

## Development Notes

- `src/App.tsx` owns application state and view switching.
- `src/types.ts` defines the shared app models.
- `src/components/ui` contains reusable primitives.
- `src/components/layout` contains app shells and navigation.
- `src/views` contains the page-level experiences.
- `src/data/elections.ts` provides seed election data for the frontend.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Components](docs/COMPONENTS.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

## Notes on Camera Support

- Camera access requires a secure context on most browsers.
- On mobile devices, use the HTTPS tunnel mode.
- If the camera is blocked or unsupported, verification will not start.

## Current Frontend Status

- Frontend features are implemented and running in Vite.
- Admin election and candidate management are wired into local app state.
- Registry CSV import and search are available in the frontend.
- The profile menu now responds for admin sessions.

## Next Step

The frontend is documented and ready for backend planning.

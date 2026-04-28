# Components and Views

This file documents the current UI building blocks and page behavior.

## UI Primitives (`src/components/ui`)

### Button

- Shared button component for primary/outline/ghost actions
- Supports visual variants and sizing
- Used across all workflows

### Card

- Generic container with project styling
- Used for login panels, review cards, and admin data blocks

### Input

- Styled text input
- Used in authentication and form-like controls

## Layout (`src/components/layout`)

### Header

- Top navigation shell
- Reflects current app section
- Supports admin-aware navigation options

## Views (`src/views`)

### AuthView

- Entry point for voter/admin login
- Includes support/help interactions
- Contains special admin access pattern behavior

### VerifyIdentityView

- Live camera preview for biometric check
- Real-time face detection via TensorFlow model
- Progress bar tied to face detection events
- Secure-context and camera-permission error handling

### BallotView

- Candidate cards and selection controls
- Write-in support
- Transition to review flow

### AdminDashboardView

- System and election status overview
- Visual summary metrics and charts

### AdminRegistryView

- Registered voter listing and management tools

### AdminLogsView

- Audit events and activity history
- Suitable for traceability/compliance demonstrations

## Shared Utilities

### `src/lib/utils.ts`

- `cn` helper for className merging
- Combines `clsx` and `tailwind-merge`

## Shared Types

### `src/types.ts`

- Core entities such as candidate, voter, logs, and app views
- Used across views for consistent typing

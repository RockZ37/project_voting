# Troubleshooting

This page covers common development/runtime issues and practical fixes.

## 1) Camera Does Not Open

Symptoms:

- Black camera frame
- Browser camera not starting
- Permission denied errors

Checks:

1. Confirm you are using HTTPS on phone.
2. Confirm browser camera permission is allowed.
3. Confirm no other app/tab is locking camera.

Fix:

- Use `pnpm run dev:mobile` and open the generated `https://...loca.lt` URL.
- Do not use plain `http://<lan-ip>:3000` on mobile for camera workflows.

## 2) Face Detection Does Not Progress

Symptoms:

- Camera visible but progress not increasing
- Status remains "no face detected"

Checks:

1. Keep one face centered in frame.
2. Improve lighting.
3. Reduce motion and keep camera steady.
4. Ensure latest dependencies are installed.

Fix:

```bash
pnpm install
pnpm run lint
```

## 3) `pnpm run dev:mobile` Fails

Possible causes:

- Network issues creating tunnel
- Existing process conflicts

Fix:

1. Stop old dev processes.
2. Re-run:

```bash
pnpm run dev:mobile
```

3. If your network blocks tunnel domains, use desktop localhost for local testing and another approved HTTPS tunnel for phone tests.

## 4) TypeScript React Type Errors

Symptoms:

- Missing declaration file for react
- JSX intrinsic element typing issues

Fix:

```bash
pnpm install
pnpm run lint
```

Confirm `@types/react` and `@types/react-dom` are present in dependencies and workspace TS version is active.

## 5) Lucide Icon Import Errors

Symptoms:

- Import name not exported by `lucide-react`

Fix:

- Use valid icon names from current lucide-react package version.
- Replace invalid imports with supported alternatives.

## 6) `cn` Utility Not Found

Symptoms:

- `Cannot find name 'cn'` or unresolved import

Fix:

- Ensure this import exists in files using `cn`:

```ts
import { cn } from "@/src/lib/utils";
```

## 7) Dev Server Not Reachable on Phone

Symptoms:

- Phone cannot load LAN URL
- Timeout from mobile browser

Fix:

1. Ensure phone and dev machine are on same network if using LAN mode.
2. Prefer tunnel mode (`pnpm run dev:mobile`) for portability.
3. Verify firewall/router rules are not blocking traffic.

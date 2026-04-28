## Troubleshooting & Notes

Common issues encountered while maintaining this project and their fixes:

- "Could not find a declaration file for module 'react'":
  - Solution: Install `@types/react` and `@types/react-dom` as devDependencies or add a local declaration file under `src/types` such as `react-shims.d.ts` that declares `react` and `react/jsx-runtime` modules.

- Missing icon exports from `lucide-react`:
  - If an icon import fails, check `lucide-react`'s exported names. Replace incorrect names (e.g., `FaceIcon`, `Security`) with available icons (e.g., `Lock`, `Shield`).

- `cn` not found / `Cannot find name 'cn'`:
  - Ensure `import { cn } from "@/src/lib/utils";` exists at the top of files that use it.

- Type checking in the editor differs from CLI:
  - Ensure `tsconfig.json` `include`/`typeRoots` settings include `src/types` and that the editor is using the workspace TypeScript version.

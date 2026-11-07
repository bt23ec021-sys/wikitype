# Verification Report — source archive

Prepared on **2026-11-07**, using Node.js 22.16.0, npm 10.9.2, and the globally available TypeScript compiler 5.8.3.

| Check                              | Status                                | Evidence / limitation                                                                                                                                                                         |
| ---------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Source files                       | **Created**                           | React/TypeScript source, styling, docs, tests, GitHub workflows, assets                                                                                                                       |
| npm registry connectivity          | **Blocked**                           | `curl` failed DNS resolution for `registry.npmjs.org`; direct IP connection also failed                                                                                                       |
| Dependency installation            | **Not completed**                     | `npm view` timed out; no npm registry or dependency cache available                                                                                                                           |
| package-lock.json                  | **Incomplete, requires regeneration** | Included a valid JSON lock metadata seed; transitive dependency resolution requires `npm install` with registry access                                                                        |
| Core TypeScript check              | **Passed**                            | `tsc --noEmit --strict --noUncheckedIndexedAccess ...` on non-React core utils, data and Wikipedia integration                                                                                |
| TS/TSX parser                      | **Passed**                            | Global TypeScript parser processed 34 TypeScript/TSX files with zero syntax diagnostics                                                                                                       |
| Pure-function runtime smoke checks | **Passed**                            | Compiled non-React modules and executed 12 groups of Node.js assertions covering offline passage lengths, sentence segmentation, Unicode and WPM calculations, and Wikipedia response parsing |
| UI source stub-assisted check      | **Passed, limited**                   | Checked non-test React source against temporary type-interface stubs, not actual third-party declarations                                                                                     |
| Full app typecheck                 | **Not run**                           | React and third-party type packages were unavailable                                                                                                                                          |
| ESLint                             | **Not run**                           | ESLint packages were unavailable                                                                                                                                                              |
| Vitest unit/component tests        | **Not run**                           | Vitest/React packages could not be installed                                                                                                                                                  |
| Playwright browser E2E             | **Not run**                           | No built application or installed browser dependencies                                                                                                                                        |
| Vite production build              | **Not run**                           | Vite/React packages were unavailable                                                                                                                                                          |
| GitHub Actions execution           | **Not run**                           | Workflow YAML generated; actual execution requires a GitHub repository                                                                                                                        |
| GitHub Pages deployment            | **Not executed**                      | Deployment workflow generated; external publication requires the owner to push and enable Pages                                                                                               |

## Required one-time initialization on a networked computer

The included `package-lock.json` is **not a complete lockfile**. It exists as a metadata seed only; do not treat it as verified. Do the following before using `npm ci` locally:

```bash
npm install
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
```

Commit the **newly generated** `package-lock.json`. The CI/deploy workflows also include a lockfile-resolution step before `npm ci`, so a first deployment can attempt installation without manually changing the workflow. This fallback is a compromise for offline authoring and is less reproducible than committing a complete regenerated lock; after regenerating the lock, consider removing that step to enforce strict immutable lockfile discipline.

**No claim is made that the full application passes tests or builds in this environment.** Review the checks after running them and fix any dependency/API incompatibilities discovered there.

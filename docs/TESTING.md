# Testing Strategy

## Quality commands

```bash
npm ci
npm run typecheck
npm run lint
npm run test
npm run build
```

To iterate: `npm run test:watch`. For E2E browser flows: `npx playwright install chromium && npm run test:e2e`. The Playwright config starts a local Vite server automatically. Full browser binaries are optional and are not part of the regular CI path.

## Unit tests

`src/tests/typingMetrics.test.ts`: 5-grapheme WPM convention, raw WPM vs adjusted WPM, CPM, accuracy, zero-time guard, extra characters, Unicode graphemes, corrected mistakes, lexical completed words.

`src/tests/textProcessor.test.ts`: whitespace normalization, citation markers, empty/short extract rejection, normal/long paragraph selection, Unicode normalization, abbreviation and decimal sentence boundaries, control characters.

`src/tests/wikipedia.test.ts`: CORS query parameters, canonical Wikipedia URL, bad JSON shapes, namespace validation, successful mocked response, network errors, abort behavior, retry exhaustion, clearly identified offline fallback.

`src/tests/storage.test.ts`: versioned persisted session history, clear history, invalid JSON, version mismatch, preferences.

`src/tests/TypingWorkspace.test.tsx`: first character starts the clock, restart resets input with a fresh session key, completion, pause/resume, and timed completion using fake timers.

`src/tests/ModeControls.test.tsx`: timed duration and passage-length settings are propagated without mutating previous settings.

## Browser integration

`e2e/typing.spec.ts` intercepts the MediaWiki endpoint and serves deterministic, valid Wikipedia-style mock responses. It exercises passage attribution, custom mode, full completion, history, restart, and theme selection. The mock is only used in automated tests: production code always fetches Wikipedia directly. API/network behavior is additionally covered by unit tests.

## Manual testing checklist

1. Load desktop and mobile viewport; confirm the responsive typing box remains visible when a virtual keyboard opens.
2. Check dark/light/system themes and reloading with each setting.
3. Type punctuation, spaces, composed accents, CJK text, and multi-code-point emoji; verify cursor and error positioning.
4. Test paste rejection during a test, but paste acceptance in custom-mode setup.
5. Start a timed test, navigate away from the tab, return, and verify time is paused until manually resumed.
6. Trigger new articles rapidly; confirm stale article results do not replace the latest one.
7. Test a network outage (browser DevTools → Network → Offline). Confirm a labelled offline sample is still usable.
8. Simulate localStorage disabled or corrupted. Typing should remain possible even if persistence is unavailable.
9. Run the built version with `npm run preview` and verify the asset base path under a GitHub Pages subdirectory.
10. Use keyboard-only navigation and screen reader checks; confirm focus states, understandable labels, and no per-character announcements.

## CI status

The included `.github/workflows/ci.yml` runs `npm ci`, lint, TypeScript checking, unit tests, and build on pushes and pull requests. Workflow presence does not mean its jobs passed: consult `docs/VERIFICATION.md` and the repository's Actions tab for actual execution evidence.

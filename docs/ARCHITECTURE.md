# Architecture

## Constraints and rationale

WikiType is a **static single-page application**. The production build consists entirely of HTML, CSS, and JavaScript in `dist/`. Browser `fetch` communicates directly with English Wikipedia's public Action API; there is no application-owned backend, proxy, server function, or account service. Local storage is the only persistence layer.

## Module ownership

| Area | Files | Responsibility |
|---|---|---|
| API | `src/services/wikipedia.ts` | Build URL, timeout, retries, validate JSON, mark provenance, deduplicate recently fetched pages |
| Text | `src/utils/textProcessor.ts`, `src/utils/graphemes.ts` | Normalization, sentence segmentation, length targeting, grapheme indexing |
| Metrics | `src/utils/typingMetrics.ts` | Pure speed/accuracy functions and history-independent keystroke accounting |
| Persistence | `src/utils/storage.ts` | Versioned records, runtime validation, corrupted/blocked storage recovery |
| Effects | `src/hooks/usePassages.ts`, `src/hooks/useTypingTest.ts`, `src/hooks/useTheme.ts` | Request cancellation/prefetch, monotonic clock/state machine, system theme |
| UI | `src/components` | Controls, accessible input, styling, result visualization, history, attribution |
| Coordinator | `src/App.tsx` | Selected settings, page navigation, restart generation, persisted sessions |

## Data flow

1. On the first render, `usePassages` starts a cancellable Wikipedia request for the selected length.
2. `acquirePassage` tries up to three main-namespace pages, rejects unusable text, and returns a labelled offline paragraph if no suitable article is available.
3. `usePassages` stores the currently displayed passage and requests a second paragraph in the background for timed-mode continuation.
4. The input receives native `textarea` input/change events; it is controlled and holds the exact current text. `TypingArea` renders an adjacent visual grapheme model and disables paste/drop manipulation.
5. `useTypingTest` begins the clock on the first nonempty change, reads `performance.now()`, records observations from actual measured input, and completes automatically at the defined endpoint.
6. The immutable result is saved through `saveSession` to a versioned local-storage payload. `HistoryView` summarizes the latest 100 saved sessions.

## State machine

```text
Loading --API ready--> Ready --first input--> Running --> Completed
   |                       ^                   |       ^
   |                       |                   v       |
   +--API failure/fallback +----- restart ---- Paused --resume--> Running
   |
   +--unexpected fatal error--> Error (retry / fallback)
```

`Loading` and `Error` are application-level passage-fetch states; the `useTypingTest` hook begins only after a valid passage is available, with status `Ready`. There are no artificially running timers before first input. `Paused` is entered by pressing Escape or hiding the tab; resuming requires explicit user action. This is an **active-focus-time** policy: time spent in a hidden tab is excluded and is not counted against a timed test.

## Clock and race handling

Elapsed time is accumulated as `clockBase + (performance.now() - startedAt)` when running. The UI refresh uses `requestAnimationFrame`, but wall-clock timing never depends on frame or interval counts. Test completion clamps time to the selected deadline in time mode. Unmounting a workspace (new article, settings change, restart) removes its pending animation frame and event handlers; callbacks from old test components cannot write to the replacement component.

The API hook owns separate AbortControllers for the active fetch and prefetch. New article requests abort the old ones and increment a sequence number; late responses are ignored. `prefetching.current` prevents parallel prefetch duplicates. A small one-passage memory queue is intentionally limited to avoid unnecessary requests. When exhausted in a timed test, the test ends instead of silently counting network latency.

## Input strategy

A native textarea is overlaid on a separately rendered visual passage. The native control handles keyboard layouts, focus, selection, mobile keyboards, composition, replacement text, and clipboard events; React `onChange` is the single source of truth. Visual positions and scoring use `Intl.Segmenter(..., { granularity: 'grapheme' })` where supported. A multi-code-point grapheme (including many emoji) is counted once. The fallback counts Unicode code points rather than UTF-16 code units.

Paste and drag/drop are rejected for the *typing exercise*, but custom content entry intentionally permits paste. Shortcut handling is narrow: Escape pauses a running test, while the browser owns all other navigation shortcuts.

## Deployment architecture

The GitHub Pages workflow calculates `VITE_BASE_PATH` from `github.event.repository.name`, except for a `OWNER.github.io` root-site repo; a repository variable overrides either case. Vite rewrites bundled assets for the configured base path. No history router or server rewrite is needed: section navigation stays in React state.

## Decision record

- **React hooks instead of Redux:** state is limited to one test session and a small amount of cross-page preferences.
- **SVG charts instead of chart dependencies:** a tiny responsive visualization with real measured observations.
- **Native textarea instead of global keydown events:** better IME, mobile, keyboard and accessibility behavior.
- **localStorage instead of cloud sync:** no account, credentials, or server; history is inherently device-local.
- **Abort + generation tokens:** stale request/result suppression even under rapid settings changes.
- **No background fetching loop:** avoids rate limit pressure and unnecessary Wikipedia traffic.

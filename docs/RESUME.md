# WikiType — Wikipedia-Powered Typing Speed Test

## Two-line description

Developed an interactive typing-speed application that turns real Wikipedia articles into personalized practice passages using the official MediaWiki API.
Built entirely in the browser with React, strict TypeScript, resilient fetching, grapheme-aware analytics, local history, and GitHub Pages automation.

## Three technical resume bullets

- Engineered a **client-only React/TypeScript typing engine** with a monotonic timer, explicit test-state transitions, Unicode grapheme handling, native IME-compatible input, real-time WPM/accuracy metrics, and correction-aware error tracking.
- Integrated the **Wikipedia MediaWiki API** directly from the browser with CORS-safe requests, response validation, bounded retries, cancellation, duplicate avoidance, article attribution, and clearly licensed offline fallback text.
- Designed a **responsive, accessible single-page experience** featuring three test modes, locally persisted session history, SVG speed charts, automated Vitest/Playwright test coverage, and GitHub Actions workflows for CI and static GitHub Pages deployment.

These describe implemented *code and workflows*; do not claim live deployment, passing CI, user growth, or measured performance wins before verifying them.

## Portfolio description

WikiType makes daily typing practice less repetitive by turning randomly selected Wikipedia introductions into interactive exercises. It highlights each character, measures adjusted and raw typing speed, and records meaningful progress without requiring an account. The architecture handles slow or unavailable network responses, long or unsuitable encyclopedia content, accidental focus changes, mobile keyboards, corrected errors, and device-local persistence. Its polished, theme-aware UI and static deployment pipeline demonstrate an end-to-end frontend engineering workflow.

## Interview explanation (about 45 seconds)

“I wanted typing practice to use interesting real content instead of synthetic sentences, so I built WikiType. The browser calls Wikipedia's official API, validates and trims a random article into a passage, and displays its original title and license. A hook owns the typing state machine and a monotonic clock, while separate pure functions compute WPM, accuracy, Unicode character positions, and correction-aware keystroke statistics. Finished sessions and preferences are stored locally. I used React and strict TypeScript, added unit/component and browser test setups, and configured GitHub Actions for a static GitHub Pages release. The main challenge was keeping typing and timers predictable while asynchronous article requests and mobile input methods behave differently.”

## Key engineering challenges

1. **Asynchronous state safety:** AbortControllers and generation tokens prevent obsolete Wikipedia responses from replacing newer passages; mounted test components own and clean up their timers.
2. **Text correctness:** `Intl.Segmenter` grapheme indexing avoids splitting surrogate pairs and many combined Unicode characters. Sentence segmentation favors semantic text boundaries rather than naive splitting at every period.
3. **Realistic input handling:** Native textarea events accommodate physical keyboards, composition, mobile suggestions, deletions, replacements, and focus management without hijacking browser shortcuts.
4. **Metric integrity:** Raw WPM is distinguished from adjusted WPM, standardized typing words from lexical words, and current-text accuracy from keystroke-history accuracy.
5. **Fail-safe operation:** A labelled original fallback is available when Wikipedia is unreachable; local storage is schema-validated and optional.

## Tradeoffs and decisions

- **Static-only versus backend:** better privacy, low operating cost and effortless Pages hosting, at the cost of no sync or global leaderboard.
- **Current-text speed versus historical effort:** a simple, well-documented WPM formula that can fall when deleting text, with keystroke accuracy retained separately.
- **One cached follow-on passage versus unlimited prefetch:** lighter Wikimedia load and fewer stale requests, with the possibility of early timed-test completion if the next excerpt isn't ready.
- **Custom SVG versus a chart package:** smaller dependencies and sufficient analytics for 1 Hz measured samples.
- **Browser-native text editing versus keydown interception:** robust mobile/IME behavior with occasional browser-driven autocorrect replacements.

## Possible future enhancements

Optional local JSON export, per-language Wikipedia editions, alternative keyboard layouts, richer screen-reader practice mode, configurable goals, and additional browser test coverage. These are proposals, **not implemented features**.

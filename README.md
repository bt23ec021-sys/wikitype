# WikiType

**Curious fingers. Faster typing.** An open-source typing practice site powered by random Wikipedia articles — no account, backend, or database.

> **Project status:** Source implementation and testing setup included. Check [`docs/VERIFICATION.md`](docs/VERIFICATION.md) for the environment-specific verification record. Do not interpret a workflow file as evidence that CI has already passed.

## Why this exists

Typing tests often use recycled phrases. WikiType turns practice into discovery: a browser fetches an introductory excerpt from a random English-language Wikipedia article, prepares a readable passage, and measures progress as you type.

## Features

- **Real Wikipedia text:** official MediaWiki Action API with `generator=random`, browser CORS, sensible retry limits, AbortController cancellation, duplicate avoidance, text validation, and a clearly labeled offline fallback.
- **Three practice modes:** 15/30/60/120-second timed tests; short/medium/long passage completion; local-only custom text.
- **Responsive typing UI:** accurate grapheme-based highlighting, correct/error states, an active cursor, backspace and selection replacement, mobile IME-compatible text input, paste prevention during practice.
- **Measured metrics:** adjusted and raw WPM, CPM, two accuracy definitions, correct/incorrect characters, completed words, progress, and time.
- **Results and private history:** real WPM snapshots, session breakdown, local-storage history, progress chart, personal best, averages, and deletion confirmation.
- **Personalization:** dark, light, and system-following themes; responsive mobile-first layouts; semantic controls and reduced-motion support.
- **Developer-friendly:** strict TypeScript, unit/component tests, Playwright smoke tests, lint, formatting, and GitHub Actions for CI and GitHub Pages.

## Screenshots

Screenshot placeholders (replace after running and capturing the app):

- `docs/screenshots/typing-desktop.png` — typing interface
- `docs/screenshots/results-mobile.png` — results on a phone
- `docs/screenshots/history-desktop.png` — local practice history

**Live demo:** Add your GitHub Pages URL here after deployment. There is no published demo URL included in this starter repository.

## Stack

React 19 · TypeScript (strict) · Vite · Tailwind CSS 4 · Lucide React · Vitest · Testing Library · Playwright · GitHub Actions / Pages.

## Quick start

Requirements: Node.js **22** or newer (compatible Node.js LTS), npm, and a browser with internet connectivity for live Wikipedia content.

**Important for this archive:** The authoring environment could not reach the npm registry, so the included lockfile is a metadata seed, not a fully resolved lockfile. On your first setup, use:

```bash
npm install          # One-time: resolve and regenerate the full package-lock.json
npm ci               # Subsequent reproducible installs
npm run dev
```

Commit the regenerated `package-lock.json` once. Thereafter, normal `npm ci` installations work with the committed complete lockfile. Open the local URL printed by Vite (typically `http://localhost:5173`). The precise limitations and checks are in [`docs/VERIFICATION.md`](docs/VERIFICATION.md).

### Commands

```bash
npm run dev            # Development
npm run typecheck      # Strict type checking
npm run lint           # ESLint
npm run test           # Vitest (one run)
npm run test:watch     # Watch mode
npm run build          # Static build into dist/
npm run preview        # Serve the built files locally
npm run format:check   # Check formatting
npm run format         # Write Prettier formatting
npm run test:e2e       # Browser tests (after npx playwright install chromium)
```

## How it works

```text
Browser UI ──fetch────> en.wikipedia.org/w/api.php
     │                         │
     │   validated extract <───┘
     │
     ├─ sentence selection, NFC normalization, grapheme indexing
     ├─ local typing state machine, performance.now(), live metrics
     └─ localStorage (preferences and completed sessions only)
```

All user-facing code runs in the browser. There is **no backend, account system, analytics service, or database**. Online Wikipedia requests leave the browser for Wikimedia's public API, as expected. Custom practice text is not sent to any service. Preferences and saved session summaries persist **only on the current browser/device**. Clearing browser storage deletes the data.

## Wikipedia API and attribution

The app requests one random page in namespace 0 using `action=query`, `generator=random`, `prop=extracts|info`, `explaintext=1`, `exintro=1`, `inprop=url`, `format=json`, `formatversion=2`, and `origin=*`. It validates the response, selects a usable excerpt, and shows the title and an external article link. Content may be **shortened** for practice; the UI declares this.

Wikipedia's text is generally licensed under **Creative Commons Attribution-ShareAlike 4.0** (and in some contexts GFDL). Attribution links to the original page and license. Offline sample paragraphs are original WikiType material under **CC0-1.0**, explicitly **not Wikipedia content**. Source code is MIT-licensed separately.

Read [`docs/API.md`](docs/API.md) for the exact API contract and constraints.

## Typing metrics

WPM is **correct current graphemes / 5 / elapsed minutes**. Raw WPM is **currently entered graphemes / 5 / elapsed minutes**. CPM is currently entered graphemes per minute. Primary accuracy is current correct graphemes ÷ current entered graphemes; keystroke accuracy also tracks mistakes that the user later corrected. Actual completed words use lexical word segmentation and are not equivalent to five-character WPM units. Full formulas: [`docs/METRICS.md`](docs/METRICS.md).

## GitHub Pages (zero server configuration)

1. Create a new GitHub repository (e.g. `wikitype`) and push this project on branch `main`.
2. Go to **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. The included `.github/workflows/deploy.yml` installs dependencies, validates the project, builds it, uploads `dist/`, and deploys automatically on `main` pushes (or via manual `workflow_dispatch`).
4. Browse to `https://USERNAME.github.io/wikitype/` (substitute your actual owner/repo). If your repository is `USERNAME.github.io`, the workflow builds for `/` instead.
5. For custom domains or custom base paths, add a repo variable `VITE_BASE_PATH`, e.g. `/` or `/my-subpath/`.

**Important:** Deployment succeeds only after dependencies install and checks pass. See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for repository commands, permissions, and troubleshooting.

## Architecture and quality

`src/services` owns Wikimedia access; `src/utils` owns pure parsing/scoring/storage logic; `src/hooks` owns browser side effects and the test state machine; `src/components` owns the views. Unit tests use mock network responses and local-storage fixtures. End-to-end tests intercept API calls, so network variability does not make them flaky. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/TESTING.md`](docs/TESTING.md), and [`docs/FEATURES.md`](docs/FEATURES.md).

## Known limitations

- API access depends on Wikimedia availability, CORS policy, and the visitor's network; the offline samples provide a non-Wikipedia alternative.
- A timed test ends early if the current excerpt finishes before its next excerpt finishes prefetching. Network waiting time is never counted.
- The official `Intl.Segmenter` API is preferred. Extremely old browsers fall back to Unicode code-point segmentation, which can count combined emoji as more than one unit.
- Some browsers' input methods may introduce autocorrect replacements; these are treated as actual replacement operations instead of simulated key presses.
- History is local and intentionally not synchronized. There is no global leaderboard.
- Some Wikipedia text is specialized, and no automated excerpt selection can guarantee literary quality.

## Contributing

Fork the repository, create a feature branch, add appropriate tests, run quality checks, and open a pull request. Keep Wikimedia requests respectful and avoid adding backend requirements. Security and accessibility regressions are high-priority issues.

## Roadmap

Potential future work: multilingual Wikipedia editions; richer accessibility test sessions; explicit keyboard layouts; opt-in local data export/import; configurable pace goals. These are **not** claimed to be implemented.

## Resume-ready project

> **WikiType — Wikipedia-Powered Typing Test:** Built a fully client-side React/TypeScript practice application using Wikipedia's MediaWiki API, grapheme-aware typing metrics, resilient content fetching, local history, responsive UI, and GitHub Pages CI/CD.

More options and technical interview notes: [`docs/RESUME.md`](docs/RESUME.md).

## License

MIT for project code (see [`LICENSE`](LICENSE)). Wikipedia text has separate CC BY-SA obligations; original fallback copy is CC0.

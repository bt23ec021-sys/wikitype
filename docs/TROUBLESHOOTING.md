# Troubleshooting

## Installation

**npm not found:** Install a current Node.js LTS with npm, reopen the terminal, verify `node -v` and `npm -v`.

**`npm ci` exits because the lockfile does not match:** `npm ci` intentionally refuses to update the lockfile. Run `npm install` once with network access, commit the resulting complete `package-lock.json`, then run `npm ci`. Do not delete lockfiles for routine CI builds.

**Dependency install fails on a locked-down network:** Configure the approved npm registry/proxy, then retry. WikiType requires no credentials, but development dependency resolution does require registry access.

**TypeScript errors:** Ensure `npm ci` completed, use a compatible Node LTS, and run `npm run typecheck`. If types are missing, check the lockfile and TypeScript version. Strict type checking is intentional.

**Build issues:** Run `npm run build` and read the first TypeScript/Vite error. Check paths and case sensitivity (Linux CI is case-sensitive). Remove `dist/` and rebuild if stale artifacts remain.

## Wikipedia API

**CORS failure:** Check the browser network request includes `origin=*`. Anonymous requests should not send credentials. Disable extensions that intercept Wikipedia, and check your network access to `en.wikipedia.org`. Do not route through an untrusted third-party proxy.

**429/rate limit or service outage:** Wait and retry manually. The app already caps attempts and uses backoff. It never needs to spin continuously until success.

**Loading feels slow:** Some random articles have very short, missing, or unsuitable extracts, especially for long practice passages. The app tries a small number of pages and then switches to explicitly labelled offline practice.

**Article text appears shortened:** That is by design. A passage-length selector prefers complete sentences, and the UI labels an adapted excerpt; open the article for its full text and revision history.

**Offline sample shown despite working internet:** Wikipedia may have returned consecutive unsuitable pages. Press New article or Retry Wikipedia. Offline paragraphs are original, CC0 material, not Wikipedia articles.

## Typing behavior

**Mobile keyboard doesn't appear:** Tap the passage area; make sure the input is not disabled due to a paused/completed test. Use the Resume or Restart control.

**Characters look different from my keyboard input:** Browser autocorrect, predictive text, accent composition, and other input methods can replace a sequence of characters. The underlying native textarea intentionally preserves the browser's editing semantics. Turn off autocorrect if you want strict character-for-character control.

**Test stops before the chosen time:** A timed test needs a continuation excerpt. If the single prepared follow-on paragraph is unavailable when you finish the current passage, WikiType ends the test without counting network waiting as typing time.

**Timer stopped after switching tabs:** This is the documented auto-pause policy. Click Resume to continue; hidden-tab time is excluded.

**Paste doesn't work:** Paste is intentionally blocked inside the measured typing field; it is allowed in the custom passage editor before starting.

**My score dropped after backspace:** Raw and adjusted WPM use the currently entered text, not all historical keystrokes; keystroke accuracy retains the history of mistakes made.

## History and privacy

**Results disappeared:** History is stored on this browser/device only, subject to storage settings, private/incognito mode, and clearing site data. There is no cloud sync.

**Clear History didn't delete custom text:** Custom draft text is held only in in-memory React state while the page is open, not in saved session history. Refresh to clear it.

**Storage is blocked:** WikiType continues to work; it may be unable to remember session history or preferences. Check the browser's storage/privacy settings.

## GitHub Pages

**Blank page or 404 assets:** Check `VITE_BASE_PATH`. Repository deployments require `/REPO_NAME/`; root sites and root custom domains use `/`. Build and redeploy after changing the variable.

**GitHub Action skipped:** Confirm the project was pushed to `main`, Actions are enabled, and Pages is configured to use GitHub Actions. Check workflow YAML at `.github/workflows/deploy.yml`.

**Deployment permission denied:** The workflow includes `pages: write` and `id-token: write`, but organization settings may restrict GitHub Pages or Actions; check repository policies.

**Subpage 404 after refresh:** WikiType uses in-page view state, not server-side browser-history routes, so this does not occur in the provided implementation. If adding a router, prefer a hash router for Pages.

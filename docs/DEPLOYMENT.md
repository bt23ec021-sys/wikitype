# GitHub Pages Deployment

WikiType is a static SPA. There are no server variables, API keys, database migrations, or server routes to configure.

## 1. Local preparation

Install an actively maintained Node.js LTS release (Node 22 or newer) and npm. From the project root:

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
npm run preview
```

The `dist/` output is the static artifact that GitHub Pages serves. Do **not** commit `node_modules/` or `dist/`. The workflow regenerates the latter.

## 2. Create a repository

Create an empty repository on GitHub named `wikitype` (or any name). Avoid auto-generating a different README/LICENSE on the website if you intend to push this entire folder directly.

```bash
cd wikitype
git init
git add .
git commit -m "Build WikiType static typing app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/wikitype.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `wikitype` with your actual owner/repository name. If you already cloned your repo, simply copy the files in, commit, and push.

## 3. Enable GitHub Pages

1. Open your repository on GitHub.
2. Select **Settings → Pages** (under Code and automation).
3. Under **Build and deployment**, set **Source → GitHub Actions**.
4. The included `.github/workflows/deploy.yml` triggers on pushes to `main` and can also be run manually: **Actions → Deploy to GitHub Pages → Run workflow**.
5. Open **Actions** and watch the `Deploy to GitHub Pages` job. The workflow installs dependencies (`npm ci`), runs lint/type-check/tests, builds, uploads `dist`, and deploys using GitHub's official Pages actions.
6. Find the deployment URL on the workflow's deployment output or under **Settings → Pages**.

## 4. Which URL will it use?

| Repository | URL | Build `base` |
|---|---|---|
| `YOUR_USERNAME/wikitype` | `https://YOUR_USERNAME.github.io/wikitype/` | `/wikitype/` |
| `YOUR_USERNAME/YOUR_USERNAME.github.io` | `https://YOUR_USERNAME.github.io/` | `/` |
| Custom domain | Your domain | Set variable `VITE_BASE_PATH=/` |

The workflow calculates `VITE_BASE_PATH` using the actual GitHub repository name and owner. An explicit **repository variable** named `VITE_BASE_PATH` overrides the automatic rule: visit **Settings → Secrets and variables → Actions → Variables → New repository variable**. For a custom domain serving at its root, set `/`. For a subdirectory, use `/subdir/` with both slashes. There are **no secrets** required.

## 5. Updating the published website

Edit the code locally, test, commit, then `git push origin main`. The Pages workflow automatically builds and deploys the new version. Manual deployment is available via `workflow_dispatch`. GitHub uses a `github-pages` environment with the appropriate `contents: read`, `pages: write`, and `id-token: write` permissions, and serializes concurrent deploys.

## Troubleshooting

**`npm ci` reports a lockfile mismatch:** regenerate `package-lock.json` from `package.json` with a successful `npm install` on a machine that can reach the npm registry, commit that lockfile, and rerun. Consult `docs/VERIFICATION.md` for environment-specific notes.

**A workflow cannot deploy:** Confirm Pages source is **GitHub Actions**, branch `main` exists, and Actions are enabled under repository settings. Check the first failing log step. Organizational policies may restrict Actions or Pages.

**Assets return 404 on a repository site:** Verify the deployment workflow ran with `VITE_BASE_PATH=/REPOSITORY/` and that you did not hardcode absolute `/assets/` paths. For a user/org Pages repository, base should be `/`.

**Refresh returns 404:** WikiType does not use browser-history routes; navigate between views through React state. If adding a client router in the future, use a hash router or provide a separate strategy for Pages fallback routes.

**Live text is missing:** Wikipedia requests happen in the visitor's browser, not during the GitHub build. Browser extensions, CORS policy changes, downtime, and network restrictions can all affect requests. The app provides original offline samples and a retry control.

**CI checks are red:** Read the exact error in the relevant Action step; `npm run lint`, `npm run typecheck`, `npm run test` and `npm run build` are available locally.

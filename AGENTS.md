# Repository Guidelines

## Project Structure & Module Organization
- `content/` — Markdown notes and assets. Source of truth; synced from your Obsidian vault via `make sync`. Place images in `content/images/` and link relatively.
- `quartz/` — Quartz v4 source and components. Customize UI/behavior here. Root configs: `quartz.config.ts`, `quartz.layout.ts`.
- `public/` — Build output (generated). Don’t edit by hand.
- `.github/workflows/` — CI/CD to GitHub Pages. Builds site and deploys `public/` on push to `main`.
- `docs/` — Upstream docs; not used for production deploys.
- `Makefile`, `Dockerfile` — Local workflows and containerized dev.

## Build, Test, and Development Commands
- Install: `npm ci` (Node 22; see `.node-version`).
- Serve locally (auto-sync from Obsidian): `make serve` → http://localhost:8080.
- Build static site: `make build` (outputs to `public/`).
- Publish content only: `make publish` (syncs, commits “Update content from Obsidian vault”, pushes `main`).
- Type/style check: `npm run check` (TypeScript + Prettier check).
- Format: `npm run format`.
- Direct Quartz: `npx quartz build --serve --watch`.
- Docker: `docker build -t hotel-memo . && docker run -p 8080:8080 hotel-memo`.

## Coding Style & Naming Conventions
- Language: TypeScript/TSX in `quartz/`; Markdown in `content/`.
- Formatting: Prettier (`.prettierrc`), 2‑space indent. Run `npm run format` before PRs.
- Content: use `.md`; prefer kebab‑case slugs; keep stable filenames. Put media under `content/images/`.
- Frontmatter: include `title`, optional `tags`, and `draft: true` to hide pages.

## Testing Guidelines
- Run tests: `npm test` (tsx). Add tests for changes under `quartz/**`.
- Naming: `*.test.ts` (example: `quartz/util/path.test.ts`). No strict coverage target; include focused unit tests where feasible.

## Commit & Pull Request Guidelines
- Content syncs use: “Update content from Obsidian vault” (from `make publish`).
- For code/config, prefer Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `ci:`.
- PRs: describe intent, scope, and impact; link issues; include screenshots/GIFs for UI changes; note local test/build steps.

## Security & Configuration Tips
- Update `OBSIDIAN_PATH` in `Makefile` to your local vault before running `make sync` (it replaces `content/`).
- `ignorePatterns` in `quartz.config.ts` excludes `private/`, `templates/`, and `.obsidian/` from publishing—still avoid committing secrets.

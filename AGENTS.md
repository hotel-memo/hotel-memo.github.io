# Repository Guidelines

## Project Structure

- `src/` — Astro のソース (`content.config.ts`, `layouts/`, `pages/`, `lib/`, `styles/`, `assets/`).
- `content/hotel-memo/` — 本拠地リポジトリ `mizzy/hotel-memo` (private) の git submodule。サイトに載るのは `publish/` 配下のみ。
- `public/` — 静的アセット (favicon, `images/` は `content/hotel-memo/publish/images` への symlink)。
- `dist/` — ビルド出力 (.gitignore)。
- `.github/workflows/deploy.yml` — main への push で GitHub Pages にデプロイ。

## Build, Test, and Development

- Install: `npm ci` (Node 22, `.node-version`).
- Dev: `npm run dev` → http://localhost:4321
- Build: `npm run build` (Pagefind index も同時に作る)
- Preview: `npm run preview`
- Type check: `npm run check`
- Content sync: `make sync` (submodule を本拠地 main に追従) / `make publish` (sync して pointer 更新を commit & push)

## Coding Style

- TypeScript / Astro / 素の CSS。
- Prettier 設定はない (デフォルト 2 スペース、ダブルクオート)。
- 不要なコメントを書かない。型と命名で説明する。
- ライトモードのみ。

## Content rules

- 部屋メモ (`publish/宿泊メモ/{chain}/{hotel}/{room}.md`) には frontmatter `title` / `rating` / `stayed_at` を入れる。
- `stayed_at` が不明なら省略 (ランキングには出るが「最近の宿泊メモ」には出ない)。
- ホテル単位 index と地域カタログには frontmatter を入れない (本文の H1 を抽出して使う)。
- 画像は本拠地の `publish/images/` 配下に置き、Markdown からは相対パス `../../../../images/...` で参照する。サイト側で `/images/...` に書き換えてる (remark plugin)。

## Commit & PR

- Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `ci:`.
- PR は draft で作る (CLAUDE.md ルール)。
- submodule pointer の更新は `chore: update content submodule` のような名前で単独 commit にする。

## Secrets

- `SUBMODULE_TOKEN`: 本拠地リポジトリ (private) を CI で clone するための PAT。`contents: read` 権限。

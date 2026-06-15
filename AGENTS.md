# Repository Guidelines

## Project Structure

- `src/` — Astro のソース (`content.config.ts`, `layouts/`, `pages/`, `lib/`, `styles/`, `assets/`).
- `content/` — サイトに載るコンテンツ (詳細は README 参照).
- `public/` — 静的アセット (favicon, `images/` は `content/images` への symlink).
- `dist/` — ビルド出力 (.gitignore).
- `.github/workflows/deploy.yml` — main への push で GitHub Pages にデプロイ.

## Build, Test, and Development

- Install: `npm ci` (Node 22, `.node-version`).
- Dev: `npm run dev` → http://localhost:4321
- Build: `npm run build` (Pagefind index も同時に作る)
- Preview: `npm run preview`
- Type check: `npm run check`

## Coding Style

- TypeScript / Astro / 素の CSS.
- 2 スペース、ダブルクオート.
- 不要なコメントを書かない. 型と命名で説明する.
- ライトモードのみ.

## コンテンツのルール

- 部屋メモ (`content/memos/{chain}/{hotel}/{room}.md`) には frontmatter `title` / `rating` / `stayed_at` を入れる.
- `stayed_at` が不明なら省略 (ランキングには出るが「最近の宿泊メモ」には出ない).
- ホテル index には title を入れない (本文の H1 を抽出する).
- 地域カタログ (`content/regions/{region}.md`) には `title` と `order` を入れる.
- 画像は `content/images/YYYY/MM/foo.jpg` に置き、Markdown からは絶対パス `/images/YYYY/MM/foo.jpg` で参照する.
- ファイル名・ディレクトリ名は英字 kebab-case で揃える. URL がそのままファイル名になる.

## Slug 規約

- チェーン: `hilton`, `hyatt`, `ihg`, `jr-east-mets`, `daiwa-roynet`, `tokyu`
- ホテル: 英字短名 (例: `hilton-fukuoka-seahawk`, `mets-koenji`).
- 部屋: 部屋タイプの英字短名 (例: `exec-suite-king`, `guest-room-high-floor`, `superior-single`).
- 地域: `hokkaido`, `tohoku`, `kanto`, `chubu`, `kansai`, `chugoku-shikoku`, `kyushu-okinawa`.

## Commit & PR

- Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `ci:`.
- PR は draft で作る (CLAUDE.md ルール).

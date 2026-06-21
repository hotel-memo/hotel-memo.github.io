# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## このリポジトリは何か

「ホテルの部屋で快適にパソコン作業ができるか」を 5 段階で記録するサイト (https://hotel-memo.github.io)。
Astro 5 製の静的サイト。コンテンツ (`content/`) は直接ここで管理する。

## コマンド

```sh
npm ci                # 依存インストール (Node 22, .node-version 参照)
npm run dev           # 開発サーバ http://localhost:4321
npm run build         # dist/ 生成 + Pagefind index + OG画像 を作る
npm run preview       # ビルド済 dist/ を http://localhost:4322 で配信
npm run check         # astro check (型チェック)
```

`npm run dev` だけだと Pagefind index が無く `/search/` が動かない。検索を動作確認するときは build → preview で見る。

## アーキテクチャ要点

### Content Collections (`src/content.config.ts`)

4 つの collection を `glob` ローダで構成。**`generateId` をカスタム実装** してデフォルトの slugify を無効化し、`memos/{chain}/{hotel}/{room}` のようなパスをそのまま id にしている。これに依存している箇所が多いので id 形式は壊さないこと。

- `memos` (`memos/**/*.md`, `index.md` 除く): 部屋メモ
- `hotels` (`memos/**/index.md`): ホテル単位の index
- `regions` (`regions/*.md`, `index.md` 除く): 地域カタログ
- `pages` (`index.md`, `ratings.md`): その他のページ

### ルーティング (`src/pages/`)

- `/` → `index.astro` (トップ)
- `/memos/{chain}/` → `memos/[chain]/index.astro` (チェーン)
- `/memos/{chain}/{hotel}/` と `/memos/{chain}/{hotel}/{room}/` → `memos/[...slug].astro` 1 ファイルで両方扱う (`kind: "memo" | "hotel"` で分岐)
- `/regions/{region}/` → `regions/[...slug].astro`
- `/ratings/` → `ratings.astro`
- `/search/` → `search.astro` (Pagefind UI を埋め込み)
- `/og/{...}.png` → `og/[...slug].png.ts` (Satori + resvg で動的生成)

### memo / hotel ページの kind 分岐 (`memos/[...slug].astro`)

`getStaticPaths` で `memos` と `hotels` を両方流し込み、`props.kind` で描画を切替。memo は部屋単位、hotel はその hotel index。ロジックを変えるときはこの両方への影響を意識する。

### 共通レイアウト (`src/layouts/Base.astro`)

`mainClass` prop でトップだけ `main` に `home` class を当て、`max-width` を 760px → 920px に広げている (CSS の `main.home` セレクタで上書き)。

### remark / rehype プラグイン (`astro.config.mjs`)

- `remark-github-blockquote-alert`: GFM の `> [!WARNING]` 等を `.markdown-alert` で描画
- `./src/lib/remark-rewrite-links.mjs`: 本文中の `.md` リンクを `/` 終わりの URL に変換 (自前)
- `rehype-slug`: `## 711号室` 等の見出しに id を自動付与 (部屋メモの宿泊履歴 chip からのアンカージャンプ用)
- `./src/lib/rehype-stay-date.mjs`: `## NNNN号室` / `## 部屋番号失念` 直下の日付段落を `.stay-date` ストリップに整形 (自前)

### OG 画像 (`src/lib/og.ts` + `src/pages/og/[...slug].png.ts`)

ビルド時に Satori で SVG → resvg で PNG。フォントは `src/assets/NotoSansJP-Bold.ttf` (5.3MB, リポジトリに含めている)。
- 各メモ / ホテル / チェーン / 地域 / index に 1 枚ずつ生成
- frontmatter `cover` または `og_cover` があれば PNG 背景にオーバーレイで合成 (`og_cover` が `cover` より優先)
- チェーン用 OG は配下ホテルの最高★メモの cover を自動採用

### Pagefind

`npm run build` で `astro build` 後に `pagefind --site dist` を実行。`Base.astro` の `<main data-pagefind-body>` を見て本文だけインデックス化。検索ページ (`/search/`) は Pagefind UI を `resetStyles: true` で読み込み、`global.css` で全面上書きしている。

### 画像

`content/images/YYYY/MM/foo.jpg` に配置。Astro は `public/images` を見るので `public/images` から `../content/images` への **相対パス symlink** を張っている。**絶対パス symlink にすると CI で 404 になるので注意**。

## コンテンツの作法

- 部屋メモ frontmatter: `title` / `rating` (1-5) / `stayed_at?` / `cover?` / `og_cover?` / `rating_note?`
- ホテル index frontmatter: `title?` / `chain?` / `official?` / `og_cover?`
- 地域カタログ frontmatter: `title?` / `order?`
- 部屋メモのファイル順は意味を持つ (本文の `## NNNN号室` 連番が宿泊履歴 chip の順)
- 同一部屋タイプ内の宿泊履歴 (`## NNNN号室`) は **最新が先頭** になるよう並べる。追記時は部屋情報セクションの直後に挿入する
- 既存のコンテンツに合わせて記法を揃える (見出し位置、空行の入り方、画像配置の流儀)
- 宿泊日は `## NNNN号室` または `## 部屋番号失念` の **直下に空行を挟んで日付段落** を 1 行で置く。書式は正規フォーマットのみ:
  - 範囲(同月) `2025/11/10-17` → `2025.11.10 — 2025.11.17 · 7泊`
  - 範囲(月またぎ) `2025/12/30-2026/1/3` → `2025.12.30 — 2026.01.03 · 4泊`
  - 単日 `2025/11/10` → `2025.11.10` (泊数なし)
  - 区切りは半角ハイフン `-` のみ。全角チルダ `〜` や末尾の `宿泊` 等は使わない
  - パース失敗時はプラグインが silent fallback で生テキストのまま表示する

## デプロイ

`main` への push で GitHub Actions (`.github/workflows/deploy.yml`) が自動で GitHub Pages にデプロイ。Pages の Source は **GitHub Actions** に設定しておく必要がある。

## PR の作り方

- ブランチを切ってからコミット (main 直コミット禁止)
- PR は **draft で作る** (`gh pr create --draft`)
- `gh` コマンドは `-R hotel-memo/hotel-memo.github.io` を明示しなくても origin から解決できる

## 詳細ドキュメント

- `README.md`: 機能・運用の概要
- `AGENTS.md`: コーディングスタイル / コンテンツルール / slug 規約 (このリポジトリで作業するエージェント向け)

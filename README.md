# Hotel Memo

ワークチェアがあるホテルの記録。[hotel-memo.github.io](https://hotel-memo.github.io)。

## 構成

- フレームワーク: [Astro](https://astro.build) (Content Collections + MDX)
- コンテンツ: `content/hotel-memo` (本拠地リポジトリ `mizzy/hotel-memo` を git submodule で取り込み、Markdown は `publish/` 配下を読む)
- 検索: [Pagefind](https://pagefind.app)
- OG 画像: Satori + resvg でビルド時に生成
- デプロイ: GitHub Actions → GitHub Pages

## 開発

```sh
npm ci
npm run dev         # http://localhost:4321
npm run build       # dist/ を生成、Pagefind インデックスも作る
npm run preview     # ビルド結果を確認
```

`.node-version` を見てね (Node 22)。

## コンテンツの更新

本拠地は `mizzy/hotel-memo` (private)。Obsidian の vault から `publish/` に流し、commit & push する運用。

このサイト側に最新コンテンツを取り込むには:

```sh
make sync     # submodule を本拠地 main の HEAD に追従
make publish  # sync して、submodule pointer の更新をこのリポジトリに commit & push
```

## ディレクトリ

```
src/
├ content.config.ts        # Content Collections のスキーマ
├ layouts/Base.astro       # 共通レイアウト
├ pages/                   # ルーティング
├ lib/                     # ヘルパ (memo, og, remark-rewrite-images)
├ styles/global.css        # スタイル (ライトモードのみ)
└ assets/                  # OG 画像用の Noto Sans JP

content/hotel-memo/        # submodule
└ publish/                 # サイトに載るのはここだけ
   ├ index.md
   ├ パソコン作業の快適さ評価.md
   ├ images/
   ├ ワークチェアがあるホテル/   # 地域別カタログ
   └ 宿泊メモ/                  # チェーン/ホテル/部屋タイプ
```

## frontmatter

部屋メモ (`publish/宿泊メモ/{chain}/{hotel}/{room}.md`):

```yaml
---
title: ヒルトン名古屋 エグゼクティブルームツイン
rating: 4         # 1-5
stayed_at: 2026-05-13   # 最新の宿泊日。不明なら省略
---
```

`title` がランキング・最近の宿泊メモに使われる。`rating` がランキングのキー、`stayed_at` が「最近の宿泊メモ」のキー。`stayed_at` を省略するとランキングだけに出る。

地域カタログとホテル単位 index には frontmatter を入れていない。タイトルは本文の `# 見出し` を抽出して使う。

## デプロイ

GitHub Pages に `main` への push で自動デプロイ (`.github/workflows/deploy.yml`)。

本拠地リポジトリが private なので、CI から submodule を fetch するために PAT を `SUBMODULE_TOKEN` という名前で repo secret に設定する必要がある。`contents: read` 権限で十分。

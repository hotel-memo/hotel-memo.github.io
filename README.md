# Hotel × Deskwork

ホテルで快適にパソコン作業はできるかの記録。[hotel-memo.github.io](https://hotel-memo.github.io)。

## 構成

- フレームワーク: [Astro](https://astro.build) (Content Collections + MDX)
- コンテンツ: `content/` 配下に直接置く
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

## ディレクトリ構成

```
content/
├ index.md                       # トップページ本文
├ ratings.md                     # パソコン作業の快適さ評価
├ images/YYYY/MM/foo.jpg         # 撮影日でディレクトリ分け
├ memos/                         # 宿泊メモ
│   └ {chain}/{hotel}/
│       ├ index.md               # ホテル単位の概要
│       └ {room}.md              # 部屋ごとのメモ
└ regions/                       # ワークチェアがあるホテル一覧
    ├ index.md
    └ {region}.md
```

## frontmatter

### 部屋メモ (`content/memos/{chain}/{hotel}/{room}.md`)

```yaml
---
title: ヒルトン名古屋 エグゼクティブルームツイン
rating: 4         # 1-5
stayed_at: 2026-05-13   # 最新の宿泊日。不明なら省略
---
```

- `title`: 一覧表示で使う。
- `rating`: ★ランキングのキー。
- `stayed_at`: 「最近の宿泊メモ」のキー。省略するとランキングだけに出る。

### 地域カタログ (`content/regions/{region}.md`)

```yaml
---
title: 関東地方のワークチェアがあるホテル
order: 3
---
```

`order` がトップの「地域から探す」と地域一覧の並び順。

## Markdown の書き方

- 画像は絶対パスで参照: `![](/images/2026/05/foo.jpg)`
- 他のページへのリンクは相対 or 絶対の `.md` で書ける。ビルド時に `.md` を取って `/` 終わりの URL にする。
- GFM の `> [!WARNING]` のような alert 記法に対応。

## デプロイ

GitHub Pages に `main` への push で自動デプロイ (`.github/workflows/deploy.yml`)。

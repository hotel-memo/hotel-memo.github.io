# 引継書: Quartz → Astro 移行

このリポジトリ (`hotel-memo/hotel-memo.github.io`) のサイトジェネレータを Quartz v4 から Astro 5 に作り直している最中。`/clear` 後の自分(または別の Claude)向けの引継ぎ。

## サイトの主題

「**ホテルで快適にパソコン作業はできるか**」を 5 段階で記録するサイト。ワークチェアの有無が大きなファクター。タイトルは `Hotel × Deskwork`。

URL: <https://hotel-memo.github.io>

## 現在のブランチ

- 作業ブランチ: `rewrite-with-astro` (ローカル only、未 push)
- 既にコミット 1 つ済 (`117c443 feat: Quartz から Astro に乗り換え`)。それ以降にさらに大量の変更があり、まだ未コミット。

## アーキテクチャ

### ディレクトリ構成

```
content/                       # サイトに載るコンテンツ全部
├ index.md                     # トップページ本文 (Markdown)
├ ratings.md                   # パソコン作業の快適さ評価ページ
├ images/YYYY/MM/foo.jpg       # 撮影日基準
├ memos/                       # 宿泊メモ
│   └ {chain}/{hotel}/         # 例: hilton/hilton-nagoya/
│       ├ index.md             # ホテル単位の概要
│       └ {room}.md            # 部屋ごとのメモ
└ regions/                     # ワークチェアがあるホテル一覧
    ├ index.md
    └ {region}.md              # hokkaido, tohoku, kanto, chubu, kansai, chugoku-shikoku, kyushu-okinawa

src/
├ content.config.ts            # Content Collections のスキーマ
├ layouts/Base.astro           # 共通レイアウト
├ pages/                       # ルーティング (src/pages/memos/[...slug].astro, regions/, ratings.astro, search.astro, og/[...slug].png.ts, rss.xml.ts, index.astro)
├ lib/
│   ├ memo.ts                  # ヘルパ (byRatingDesc, byStayedAtDesc, extractH1, memoPathInfo, memoSlug)
│   ├ og.ts                    # Satori で OG 画像生成
│   └ remark-rewrite-links.mjs # `.md` リンクを `/` に書き換え
├ styles/global.css            # 唯一のスタイル
└ assets/NotoSansJP-Bold.ttf   # OG 画像用フォント (5.3MB, git に含めてる)

public/images                  # → ../content/images への絶対 path symlink
.github/workflows/deploy.yml   # main への push で GitHub Pages にデプロイ
Makefile                       # dev/build/preview/clean のラッパ
```

### Content Collections (`src/content.config.ts`)

- `memos`: 部屋メモ (`memos/**/*.md`, ただし `index.md` 除く)。schema: `title, rating(1-5), stayed_at?, draft?`
- `hotels`: ホテル単位 index (`memos/**/index.md`)。schema: `title?, draft?`
- `regions`: 地域カタログ (`regions/*.md`, ただし `index.md` 除く)。schema: `title?, order?, draft?`
- `pages`: その他 (`index.md`, `ratings.md`, `regions/index.md`)。schema: `title?, draft?`

**重要**: `generateId` をカスタムして、デフォルトの slugify(英字小文字化など) を無効にしてある。id は拡張子と `/index` を取った相対パス。

### Markdown 内の規約

- 画像は絶対パス: `![](/images/2026/05/foo.jpg)` (public/images の symlink 経由で配信)
- 他ページへのリンクは `.md` 付きの相対 or 絶対パスで書ける。`remark-rewrite-links` が `.md` → `/` に変換する。
- GFM alert (`> [!WARNING]`) は `remark-github-blockquote-alert` で描画される。
- frontmatter は最小:
  - 部屋メモ: `title`, `rating`, `stayed_at?`
  - 地域: `title`, `order`
  - その他 index 系: なし (本文の `# H1` を抽出してタイトルに使う)

### URL 設計 (全部英字 kebab-case)

- `/` トップ
- `/memos/{chain}/{hotel}/{room}/` 部屋メモ
- `/memos/{chain}/{hotel}/` ホテル index
- `/regions/` 地域カタログトップ
- `/regions/{region}/` 地域別 (hokkaido, tohoku, kanto, chubu, kansai, chugoku-shikoku, kyushu-okinawa)
- `/ratings/` ★ランキング全件
- `/search/` Pagefind 検索
- `/rss.xml`, `/sitemap-index.xml`, `/og/{kind}/{slug}.png`, `/images/...`

ホテル名・部屋名の slug マッピングは `AGENTS.md` 参照。

### トップページ構成 (`src/pages/index.astro`)

3 セクション型:
1. リード文 (`.lede` ボックス)
2. 地域から探す (`.region-grid`、order 順)
3. パソコン作業の快適さランキング (rating 降順、上位 8)
4. 最近の宿泊メモ (stayed_at 降順、上位 8)

`stayed_at` 不明なメモはランキングには出るが「最近の宿泊メモ」には出ない。

### ビルド

`npm run build` で `astro build && pagefind --site dist`。43 ページ + 43 OG 画像 + Pagefind index + sitemap + RSS が dist/ に出る。

### デプロイ

`.github/workflows/deploy.yml` で main への push で GitHub Pages にデプロイ。**Mizzy のローカル運用**: コンテンツは生成 AI で直接 `content/` に書く流れに移行済 (以前は本拠地 `mizzy/hotel-memo` から sync していたが submodule もコピーもやめた)。

## 完了したこと

- Quartz 関連ファイル全削除
- Astro 5 + MDX + sitemap + RSS のセットアップ
- Content Collections と全ルート実装
- 本文ページ・ホテル index・地域カタログ・トップ・ratings・search の各レイアウト
- Pagefind 全文検索 (検索ページ `/search/`)
- Satori + resvg で OG 画像 (43枚) を build 時に生成
- ヘッダー / ナビ / フッター / breadcrumb
- GFM alert 対応
- `.md` リンク自動書き換え
- 21 ファイルの部屋メモに `title/rating/stayed_at` の frontmatter を入れた (本拠地 `mizzy/hotel-memo` PR #2 は merge 済)
- URL の slug 設計 (チェーン・ホテル・部屋・地域すべて英字)
- ビジュアル: 何案か試した結果、**最初のクラシック・読み物系** (faf8f8 地 + 紺アクセント #284b63 + 緑サブ #84a59d + ゴールド ★ #c89b3f, Hiragino Sans) に戻して確定。

## まだやってないこと

1. **未コミットの変更を 1 つにまとめてコミット** (`feat: Quartz から Astro に乗り換え` の続き、または amend)
2. **このリポジトリを `git push -u origin rewrite-with-astro` して main 向けに draft PR を作る** (Mizzy ルール: PR は必ず draft)
3. **GitHub Actions の動作確認**: 現状のデプロイ workflow は submodule 対応のままになってないか?? 直接コピー方針になったので、`actions/checkout@v4` に `submodules: recursive` の指定があれば**消しても問題なし**(submodule はない)。確認すること。
4. **CLAUDE.md の追加検討** (このリポジトリ固有のルール)
5. **本拠地リポジトリ `mizzy/hotel-memo` の今後の扱い**: もう sync で参照しなくなったので、Mizzy がそこをどうするか (アーカイブ?) 判断待ち
6. **検索のスタイル**: Pagefind UI のデフォルト見た目がサイトと馴染んでない可能性。必要なら `src/pages/search.astro` の `<style>` で再調整。

## 直近の Mizzy の好み・判断

- リード文の上に出してた `<h1>ホテルで快適にパソコン作業はできるか</h1>` は**不要** (削除済)
- 「ホテルの部屋で**快適に**仕事ができるか」と「快適に」を明示する
- 「コンセント配置」は重要じゃない(延長コードで解決できる)ので説明文から削除済
- ビジュアル: Astro 標準的なシンプル読み物系が好き。装飾(マスキングテープ、波線、雑誌風ヒーロー、ノート罫線、ピル型タグ)は全部 reject された
- frontmatter の `stayed_at` は **最新の宿泊日**にする (複数ある場合)、不明なら省略
- title フォーマット: 「ホテル名 部屋タイプ」(スペース区切り)

## 開発の起動

```sh
npm run dev               # http://localhost:4321
npm run build             # dist/ 生成
npm run preview           # http://localhost:4322 (現在 background で起動中の可能性あり)
```

dev サーバが background で動いてる場合は TaskList / TaskStop で管理。

## 既知の状態 (引継ぎ時点)

- preview サーバが `localhost:4322` で background 起動中だった (タスク ID は context clear で失われる、再起動した方が早い)
- 全 43 ページが 200 OK で表示できる状態
- ビルドは通る (warning なし)

## 次のセッションでまずやること

1. `git status -s | wc -l` で未コミット差分を把握
2. `git diff HEAD` を見て、最後のコミット 117c443 以降の変更内容を確認
3. Mizzy に「コミットして push しますか?」と確認してから commit/push/PR の流れへ

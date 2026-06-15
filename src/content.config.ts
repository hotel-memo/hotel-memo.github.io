import { defineCollection, z } from "astro:content"
import { glob } from "astro/loaders"

const CONTENT_BASE = "./content/hotel-memo/publish"

// Astro 5 のデフォルト generateId は github-slugger で英数字を小文字化し、
// アンダースコアや「・」「&」などの記号も落とす。日本語サイトでファイル名と
// URL を一致させたいので、拡張子を取った相対パスをそのまま id にする。
const generateId = ({ entry }: { entry: string }) =>
  entry.replace(/\.md$/, "").replace(/\/index$/, "")

const memos = defineCollection({
  loader: glob({
    pattern: ["宿泊メモ/**/*.md", "!宿泊メモ/**/index.md"],
    base: CONTENT_BASE,
    generateId,
  }),
  schema: z.object({
    title: z.string(),
    rating: z.number().int().min(1).max(5),
    stayed_at: z.coerce.date().optional(),
    draft: z.boolean().optional(),
  }),
})

const hotels = defineCollection({
  loader: glob({
    pattern: "宿泊メモ/**/index.md",
    base: CONTENT_BASE,
    generateId,
  }),
  schema: z.object({
    title: z.string().optional(),
    draft: z.boolean().optional(),
  }),
})

const workchair = defineCollection({
  loader: glob({
    pattern: ["ワークチェアがあるホテル/*.md", "!ワークチェアがあるホテル/index.md"],
    base: CONTENT_BASE,
    generateId,
  }),
  schema: z.object({
    title: z.string().optional(),
    draft: z.boolean().optional(),
  }),
})

const pages = defineCollection({
  loader: glob({
    pattern: [
      "index.md",
      "パソコン作業の快適さ評価.md",
      "ワークチェアがあるホテル/index.md",
    ],
    base: CONTENT_BASE,
    generateId,
  }),
  schema: z.object({
    title: z.string().optional(),
    draft: z.boolean().optional(),
  }),
})

export const collections = { memos, hotels, workchair, pages }

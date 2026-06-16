import { defineCollection, z } from "astro:content"
import { glob } from "astro/loaders"

const CONTENT_BASE = "./content"

// 拡張子を取った相対パスをそのまま id にする (デフォルトの slugify を無効化)。
const generateId = ({ entry }: { entry: string }) =>
  entry.replace(/\.md$/, "").replace(/\/index$/, "")

const memos = defineCollection({
  loader: glob({
    pattern: ["memos/**/*.md", "!memos/**/index.md"],
    base: CONTENT_BASE,
    generateId,
  }),
  schema: z.object({
    title: z.string(),
    rating: z.number().int().min(1).max(5),
    rating_note: z.string().optional(),
    stayed_at: z.coerce.date().optional(),
    cover: z.string().optional(),
    og_cover: z.string().optional(),
    draft: z.boolean().optional(),
  }),
})

const hotels = defineCollection({
  loader: glob({
    pattern: "memos/**/index.md",
    base: CONTENT_BASE,
    generateId,
  }),
  schema: z.object({
    title: z.string().optional(),
    chain: z.string().optional(),
    official: z.string().url().optional(),
    og_cover: z.string().optional(),
    draft: z.boolean().optional(),
  }),
})

const regions = defineCollection({
  loader: glob({
    pattern: ["regions/*.md", "!regions/index.md"],
    base: CONTENT_BASE,
    generateId,
  }),
  schema: z.object({
    title: z.string().optional(),
    order: z.number().int().optional(),
    draft: z.boolean().optional(),
  }),
})

const pages = defineCollection({
  loader: glob({
    pattern: ["index.md", "ratings.md"],
    base: CONTENT_BASE,
    generateId,
  }),
  schema: z.object({
    title: z.string().optional(),
    draft: z.boolean().optional(),
  }),
})

export const collections = { memos, hotels, regions, pages }

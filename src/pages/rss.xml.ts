import rss from "@astrojs/rss"
import { getCollection } from "astro:content"
import { byStayedAtDesc } from "../lib/memo"
import type { APIContext } from "astro"

export async function GET(context: APIContext) {
  const memos = (await getCollection("memos"))
    .filter((m) => !m.data.draft && m.data.stayed_at)
    .sort(byStayedAtDesc)

  return rss({
    title: "Hotel Memo",
    description: "ワークチェアがあるホテルの記録",
    site: context.site ?? "https://hotel-memo.github.io",
    items: memos.map((m) => ({
      title: m.data.title,
      description: `★${m.data.rating}/5`,
      pubDate: m.data.stayed_at!,
      link: `/宿泊メモ/${m.id.replace(/^宿泊メモ\//, "")}/`,
    })),
  })
}

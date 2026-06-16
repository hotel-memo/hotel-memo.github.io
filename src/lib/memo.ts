import type { CollectionEntry } from "astro:content"

export type Memo = CollectionEntry<"memos">

export function extractH1(body: string | undefined): string | null {
  if (!body) return null
  const match = body.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : null
}

export function memoPathInfo(id: string) {
  const parts = id.split("/")
  return {
    chain: parts[1] ?? "",
    hotel: parts[2] ?? "",
    room: parts[3]?.replace(/\.md$/, "") ?? "",
  }
}

export function memoSlug(id: string) {
  return id.replace(/\.md$/, "")
}

export function byStayedAtDesc(a: Memo, b: Memo) {
  const at = a.data.stayed_at?.getTime() ?? 0
  const bt = b.data.stayed_at?.getTime() ?? 0
  return bt - at
}

export function byRatingDesc(a: Memo, b: Memo) {
  if (a.data.rating !== b.data.rating) return b.data.rating - a.data.rating
  return byStayedAtDesc(a, b)
}

export const chainNameMap: Record<string, string> = {
  hilton: "Hilton",
  tokyu: "東急ホテルズ",
  "daiwa-roynet": "ダイワロイネット",
  "jr-east-mets": "JR東日本ホテルメッツ",
  hyatt: "Hyatt",
  ihg: "IHG",
}

import { getCollection } from "astro:content"
import { renderOgImage } from "../../lib/og"
import { chainNameMap, extractH1 } from "../../lib/memo"

export async function getStaticPaths() {
  const memos = (await getCollection("memos")).filter((m) =>
    m.id.startsWith("memos/"),
  )
  const hotels = (await getCollection("hotels")).filter((h) =>
    h.id.startsWith("memos/"),
  )
  const regions = await getCollection("regions")
  const pages = await getCollection("pages")

  // ホテルのチェーン別代表 cover (最高★順で先頭の cover を採用)
  const memosByHotel = new Map<string, typeof memos>()
  for (const m of memos) {
    const hotelId = m.id.split("/").slice(0, 3).join("/")
    if (!memosByHotel.has(hotelId)) memosByHotel.set(hotelId, [])
    memosByHotel.get(hotelId)!.push(m)
  }

  const chains = new Set<string>()
  const chainCover = new Map<string, string>()
  for (const h of hotels) {
    const chain = h.id.split("/")[1]
    if (!chain) continue
    chains.add(chain)
    if (chainCover.has(chain)) continue
    if (h.data.og_cover) {
      chainCover.set(chain, h.data.og_cover)
      continue
    }
    const hotelMemos = (memosByHotel.get(h.id) ?? [])
      .slice()
      .sort((a, b) => b.data.rating - a.data.rating)
    const memoCover = hotelMemos.find((m) => m.data.og_cover ?? m.data.cover)
    const cover = memoCover?.data.og_cover ?? memoCover?.data.cover
    if (cover) chainCover.set(chain, cover)
  }

  return [
    ...memos.map((m) => ({
      params: { slug: m.id },
      props: {
        title: m.data.title,
        subtitle: m.id.split("/")[1] ?? undefined,
        rating: m.data.rating,
        cover: m.data.og_cover ?? m.data.cover,
      },
    })),
    ...hotels.map((h) => {
      const hotelMemos = (memosByHotel.get(h.id) ?? [])
        .slice()
        .sort((a, b) => b.data.rating - a.data.rating)
      const autoCover = hotelMemos.find((m) => m.data.og_cover ?? m.data.cover)
      const cover =
        h.data.og_cover ?? autoCover?.data.og_cover ?? autoCover?.data.cover
      return {
        params: { slug: `hotels/${h.id.replace(/^memos\//, "")}` },
        props: {
          title: h.data.title ?? extractH1(h.body) ?? h.id,
          subtitle: h.id.split("/")[1] ?? undefined,
          cover,
        },
      }
    }),
    ...[...chains].map((chain) => ({
      params: { slug: `memos/${chain}` },
      props: {
        title: chainNameMap[chain] ?? chain,
        subtitle: "ホテルチェーン",
        cover: chainCover.get(chain),
      },
    })),
    ...regions.map((r) => {
      const regionNames: Record<string, string> = {
        hokkaido: "北海道",
        tohoku: "東北",
        kanto: "関東",
        chubu: "中部",
        kansai: "関西",
        "chugoku-shikoku": "中国・四国",
        "kyushu-okinawa": "九州・沖縄",
      }
      const slug = r.id.replace(/^regions\//, "")
      return {
        params: { slug: r.id },
        props: {
          title: regionNames[slug] ?? slug,
          subtitle: "ワークチェアがありそうなホテル",
        },
      }
    }),
    ...pages.map((p) => ({
      params: { slug: `pages/${p.id}` },
      props: {
        title: p.data.title ?? extractH1(p.body) ?? p.id,
      },
    })),
    {
      params: { slug: "index" },
      props: { title: "Hotel × Deskwork", hideKicker: true },
    },
  ]
}

export async function GET({
  props,
}: {
  props: {
    title: string
    subtitle?: string
    rating?: number
    cover?: string
    hideKicker?: boolean
  }
}) {
  const png = await renderOgImage(props)
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}

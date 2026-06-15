import { getCollection } from "astro:content"
import { renderOgImage } from "../../lib/og"
import { extractH1 } from "../../lib/memo"

export async function getStaticPaths() {
  const memos = await getCollection("memos")
  const hotels = await getCollection("hotels")
  const workchair = await getCollection("workchair")
  const pages = await getCollection("pages")

  return [
    ...memos.map((m) => ({
      params: { slug: `memos/${m.id.replace(/^宿泊メモ\//, "")}` },
      props: {
        title: m.data.title,
        subtitle: m.id.split("/")[1] ?? undefined,
        rating: m.data.rating,
      },
    })),
    ...hotels.map((h) => ({
      params: { slug: `hotels/${h.id.replace(/^宿泊メモ\//, "")}` },
      props: {
        title: extractH1(h.body) ?? h.id,
        subtitle: h.id.split("/")[1] ?? undefined,
      },
    })),
    ...workchair.map((w) => ({
      params: { slug: `workchair/${w.id.replace(/^ワークチェアがあるホテル\//, "")}` },
      props: {
        title: extractH1(w.body) ?? "ワークチェアがあるホテル",
      },
    })),
    ...pages.map((p) => ({
      params: { slug: `pages/${p.id}` },
      props: {
        title: p.data.title ?? extractH1(p.body) ?? p.id,
      },
    })),
    {
      params: { slug: "index" },
      props: { title: "Hotel Memo" },
    },
  ]
}

export async function GET({ props }: { props: { title: string; subtitle?: string; rating?: number } }) {
  const png = await renderOgImage(props)
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}

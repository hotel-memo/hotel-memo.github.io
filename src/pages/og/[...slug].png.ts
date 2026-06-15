import { getCollection } from "astro:content"
import { renderOgImage } from "../../lib/og"
import { extractH1 } from "../../lib/memo"

export async function getStaticPaths() {
  const memos = await getCollection("memos")
  const hotels = await getCollection("hotels")
  const regions = await getCollection("regions")
  const pages = await getCollection("pages")

  return [
    ...memos.map((m) => ({
      params: { slug: m.id }, // memos/<chain>/<hotel>/<room>
      props: {
        title: m.data.title,
        subtitle: m.id.split("/")[1] ?? undefined,
        rating: m.data.rating,
      },
    })),
    ...hotels.map((h) => ({
      params: { slug: `hotels/${h.id.replace(/^memos\//, "")}` },
      props: {
        title: extractH1(h.body) ?? h.id,
        subtitle: h.id.split("/")[1] ?? undefined,
      },
    })),
    ...regions.map((r) => ({
      params: { slug: r.id }, // regions/<slug>
      props: {
        title: r.data.title ?? extractH1(r.body) ?? "ワークチェアがあるホテル",
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
      props: { title: "Hotel × Deskwork" },
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

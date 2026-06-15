import satori from "satori"
import { Resvg } from "@resvg/resvg-js"
import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))

let fontCache: ArrayBuffer | null = null

async function loadFont(): Promise<ArrayBuffer> {
  if (fontCache) return fontCache
  // Astro の dev/build どちらでも、プロジェクトルートからの相対で読みに行く。
  // フォントは src/assets/ に置く想定。
  const candidates = [
    resolve(__dirname, "../assets/NotoSansJP-Bold.ttf"),
    resolve(process.cwd(), "src/assets/NotoSansJP-Bold.ttf"),
  ]
  for (const p of candidates) {
    try {
      const buf = await readFile(p)
      fontCache = buf.buffer.slice(
        buf.byteOffset,
        buf.byteOffset + buf.byteLength,
      ) as ArrayBuffer
      return fontCache
    } catch {
      // try next
    }
  }
  throw new Error(
    "OG font not found. Place NotoSansJP-Bold.ttf at src/assets/.",
  )
}

export interface OgInput {
  title: string
  subtitle?: string
  rating?: number
}

export async function renderOgImage({
  title,
  subtitle,
  rating,
}: OgInput): Promise<Buffer> {
  const font = await loadFont()
  const stars = rating
    ? "★".repeat(rating) + "☆".repeat(5 - rating)
    : ""

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px 80px",
          background: "#faf8f8",
          color: "#2b2b2b",
          fontFamily: "Noto Sans JP",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                fontSize: "28px",
                color: "#84a59d",
                letterSpacing: "0.08em",
              },
              children: "Hotel × Deskwork",
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                gap: "24px",
              },
              children: [
                stars && {
                  type: "div",
                  props: {
                    style: {
                      fontSize: "52px",
                      color: "#c89b3f",
                      letterSpacing: "0.1em",
                    },
                    children: stars,
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: "64px",
                      lineHeight: "1.3",
                      fontWeight: 700,
                    },
                    children: title,
                  },
                },
                subtitle && {
                  type: "div",
                  props: {
                    style: {
                      fontSize: "28px",
                      color: "#6b6b6b",
                    },
                    children: subtitle,
                  },
                },
              ].filter(Boolean),
            },
          },
          {
            type: "div",
            props: {
              style: {
                fontSize: "22px",
                color: "#6b6b6b",
              },
              children: "ホテルで仕事ができるかの記録",
            },
          },
        ],
      },
    } as any,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Noto Sans JP",
          data: font,
          weight: 700,
          style: "normal",
        },
      ],
    },
  )

  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } })
    .render()
    .asPng()
  return Buffer.from(png)
}

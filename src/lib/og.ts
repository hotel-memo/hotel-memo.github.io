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
  cover?: string
  hideKicker?: boolean
}

async function loadCoverDataUri(cover: string): Promise<string | null> {
  // cover は "/images/2026/05/foo.jpg" のようなサイト内絶対パス。
  // 実体は content/images/... にあるので読み出して data URI に変換。
  if (!cover.startsWith("/images/")) return null
  const path = resolve(process.cwd(), "content", cover.replace(/^\//, ""))
  try {
    const buf = await readFile(path)
    const ext = path.split(".").pop()?.toLowerCase() ?? "jpg"
    const mime =
      ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg"
    return `data:${mime};base64,${buf.toString("base64")}`
  } catch {
    return null
  }
}

export async function renderOgImage({
  title,
  subtitle,
  rating,
  cover,
  hideKicker,
}: OgInput): Promise<Buffer> {
  const font = await loadFont()
  const stars = rating ? "★".repeat(rating) + "☆".repeat(5 - rating) : ""
  const coverDataUri = cover ? await loadCoverDataUri(cover) : null

  const kicker = hideKicker
    ? null
    : {
        type: "div",
        props: {
          style: {
            display: "flex",
            fontSize: "28px",
            color: "#2b2b2b",
            letterSpacing: "0.08em",
          },
          children: [
            { type: "span", props: { children: "Hotel " } },
            {
              type: "span",
              props: {
                style: { color: "#84a59d", padding: "0 0.08em" },
                children: "×",
              },
            },
            { type: "span", props: { children: " Deskwork" } },
          ],
        },
      }

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
          ...(coverDataUri && {
            backgroundImage: `linear-gradient(rgba(250,248,248,0.78), rgba(250,248,248,0.88)), url("${coverDataUri}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }),
        },
        children: [
          ...(kicker ? [kicker] : []),
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                ...(hideKicker && {
                  marginTop: "auto",
                  marginBottom: "auto",
                }),
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
                      display: "flex",
                      flexWrap: "wrap",
                      fontSize: "64px",
                      lineHeight: "1.3",
                      fontWeight: 700,
                    },
                    children: title.includes(" × ")
                      ? (() => {
                          const parts = title.split(" × ")
                          const out: any[] = []
                          parts.forEach((p, i) => {
                            out.push({
                              type: "span",
                              props: { children: i === 0 ? p : ` ${p}` },
                            })
                            if (i < parts.length - 1) {
                              out.push({
                                type: "span",
                                props: {
                                  style: { color: "#84a59d", padding: "0 0.08em" },
                                  children: " ×",
                                },
                              })
                            }
                          })
                          return out
                        })()
                      : title,
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
              children: "ホテルの部屋で快適に仕事を",
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

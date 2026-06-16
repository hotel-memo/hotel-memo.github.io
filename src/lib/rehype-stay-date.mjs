import { visit } from "unist-util-visit"

const ROOM_RE = /^(.+号室|部屋番号失念)\s*$/

export default function rehypeStayDate() {
  return (tree) => {
    visit(tree, "element", (node, index, parent) => {
      if (!parent || index == null) return
      if (node.tagName !== "h2") return
      const text = textOf(node).trim()
      if (!ROOM_RE.test(text)) return

      let i = index + 1
      while (i < parent.children.length) {
        const c = parent.children[i]
        if (c.type === "element") break
        if (c.type === "text" && c.value.trim()) return
        i++
      }
      const next = parent.children[i]
      if (!next || next.type !== "element" || next.tagName !== "p") return

      const parsed = parseStayRange(textOf(next).trim())
      if (!parsed) return

      const children = [{ type: "text", value: parsed.start }]
      if (parsed.end) {
        children.push({ type: "text", value: ` — ${parsed.end}` })
      }
      if (parsed.nights > 0) {
        children.push({
          type: "element",
          tagName: "span",
          properties: { className: ["n"] },
          children: [{ type: "text", value: ` · ${parsed.nights}泊` }],
        })
      }
      next.properties = {
        ...(next.properties ?? {}),
        className: [...asArray(next.properties?.className), "stay-date"],
      }
      next.children = children
    })
  }
}

function textOf(node) {
  if (node.type === "text") return node.value
  if (!node.children) return ""
  return node.children.map(textOf).join("")
}

function asArray(v) {
  return Array.isArray(v) ? v : v ? [v] : []
}

function parseStayRange(s) {
  s = s.trim()
  let m = s.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/)
  if (m) {
    const [, y, mo, d] = m
    const sd = makeDate(+y, +mo, +d)
    if (!sd) return null
    return { start: fmt(sd), end: null, nights: 0 }
  }
  m = s.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})-(\d{1,2})$/)
  if (m) {
    const [, y, mo, d, ed] = m
    const sd = makeDate(+y, +mo, +d)
    const ned = makeDate(+y, +mo, +ed)
    if (!sd || !ned) return null
    if (ned < sd) return null
    return {
      start: fmt(sd),
      end: fmt(ned),
      nights: Math.round((ned - sd) / 86400000),
    }
  }
  m = s.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})-(\d{4})\/(\d{1,2})\/(\d{1,2})$/)
  if (m) {
    const [, y, mo, d, ey, em, ed] = m
    const sd = makeDate(+y, +mo, +d)
    const ned = makeDate(+ey, +em, +ed)
    if (!sd || !ned || ned < sd) return null
    return {
      start: fmt(sd),
      end: fmt(ned),
      nights: Math.round((ned - sd) / 86400000),
    }
  }
  return null
}

function makeDate(y, m, d) {
  if (m < 1 || m > 12 || d < 1 || d > 31) return null
  const dt = new Date(y, m - 1, d)
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null
  return dt
}

function fmt(d) {
  const pad = (n) => String(n).padStart(2, "0")
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
}

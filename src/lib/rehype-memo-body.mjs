import { visit } from "unist-util-visit"

export default function rehypeMemoBody() {
  return (tree, file) => {
    const path = file?.path ?? file?.history?.[0] ?? ""
    if (!path.includes("/memos/")) return

    // --- (A) notes 整形 ---
    visit(tree, "element", (node) => {
      if (node.tagName !== "ul") return
      for (const li of node.children) {
        if (li.type !== "element" || li.tagName !== "li") continue
        const hasNestedList = li.children.some(
          (c) => c.type === "element" && (c.tagName === "ul" || c.tagName === "ol"),
        )
        if (!hasNestedList) continue
        const lead = []
        let i = 0
        while (i < li.children.length) {
          const c = li.children[i]
          if (c.type === "element" && (c.tagName === "ul" || c.tagName === "ol")) break
          lead.push(c)
          i++
        }
        if (lead.length === 0) continue
        const span = {
          type: "element",
          tagName: "span",
          properties: { className: ["parent"] },
          children: lead,
        }
        li.children.splice(0, lead.length, span)
      }
    })
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "ul") return
      if (parent && parent.type === "element" && parent.tagName === "li") return
      node.properties = {
        ...(node.properties ?? {}),
        className: [...asArray(node.properties?.className), "notes"],
      }
    })

    // --- (B) 連続画像をギャラリーにまとめる ---
    visit(tree, "element", (node, index, parent) => {
      if (!parent || index == null) return
      if (!isImageP(node)) return
      let j = index
      const imgs = []
      while (j < parent.children.length) {
        const c = parent.children[j]
        if (c.type === "element" && isImageP(c)) {
          imgs.push(extractImg(c))
          j++
        } else if (c.type === "text" && !c.value.trim()) {
          j++
        } else {
          break
        }
      }
      if (imgs.length === 0) return

      const label = {
        type: "element",
        tagName: "p",
        properties: { className: ["memo-gallery__label"] },
        children: [{ type: "text", value: `写真 ${imgs.length}枚` }],
      }
      const gallery = {
        type: "element",
        tagName: "div",
        properties: { className: ["memo-gallery"] },
        children: imgs,
      }
      parent.children.splice(index, j - index, label, gallery)
      return [visit.SKIP, index + 2]
    })

    // --- (C) 「部屋情報」ul を 2 列テーブルに ---
    visit(tree, "element", (h2, index, parent) => {
      if (h2.tagName !== "h2" || !parent || index == null) return
      if (!textOf(h2).includes("部屋情報")) return

      let i = index + 1
      while (i < parent.children.length) {
        const c = parent.children[i]
        if (c.type === "element") break
        if (c.type === "text" && c.value.trim()) return
        i++
      }
      const ul = parent.children[i]
      if (!ul || ul.type !== "element" || ul.tagName !== "ul") return

      const rows = []
      for (const li of ul.children) {
        if (li.type !== "element" || li.tagName !== "li") continue
        const row = splitKeyValue(li.children)
        if (!row) return
        rows.push(row)
      }
      if (rows.length === 0) return

      const table = {
        type: "element",
        tagName: "div",
        properties: { className: ["info-table"] },
        children: rows.map(({ key, value }) => ({
          type: "element",
          tagName: "div",
          properties: { className: ["row"] },
          children: [
            { type: "element", tagName: "div", properties: { className: ["k"] }, children: [{ type: "text", value: key }] },
            { type: "element", tagName: "div", properties: { className: ["v"] }, children: value },
          ],
        })),
      }
      parent.children.splice(i, 1, table)
    })

    // --- (D) 空セクション見出しを削除 ---
    visit(tree, "element", (h2, index, parent) => {
      if (h2.tagName !== "h2" || !parent || index == null) return

      let i = index + 1
      let hasContent = false
      while (i < parent.children.length) {
        const c = parent.children[i]
        if (c.type === "text") {
          if (c.value.trim()) { hasContent = true; break }
          i++
          continue
        }
        if (c.type === "element") {
          if (c.tagName === "h2" || c.tagName === "h1") break
          if (c.tagName === "hr") break
          hasContent = true
          break
        }
        i++
      }
      if (hasContent) return

      parent.children.splice(index, 1)
      return [visit.SKIP, index]
    })
  }
}

function splitKeyValue(children) {
  if (children.length === 0) return null
  const first = children[0]
  if (first.type !== "text") return null
  const m = first.value.match(/^\s*([^:：]+)[:：]\s*([\s\S]*)$/)
  if (!m) return null
  const key = m[1].trim()
  const restText = m[2]
  const value = []
  if (restText) value.push({ type: "text", value: restText })
  for (let k = 1; k < children.length; k++) value.push(children[k])
  return { key, value }
}

function isImageP(node) {
  if (node.type !== "element" || node.tagName !== "p") return false
  const els = node.children.filter(
    (c) => !(c.type === "text" && !c.value.trim()),
  )
  return els.length === 1 && els[0].type === "element" && els[0].tagName === "img"
}

function extractImg(pNode) {
  return pNode.children.find(
    (c) => c.type === "element" && c.tagName === "img",
  )
}

function asArray(v) {
  return Array.isArray(v) ? v : v ? [v] : []
}

function textOf(node) {
  if (node.type === "text") return node.value
  if (!node.children) return ""
  return node.children.map(textOf).join("")
}

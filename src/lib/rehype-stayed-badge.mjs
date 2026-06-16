import { visit } from "unist-util-visit"

export default function rehypeStayedBadge() {
  return (tree, file) => {
    const path = file?.path ?? file?.history?.[0] ?? ""
    if (!path.includes("/regions/")) return

    visit(tree, "element", (h3, index, parent) => {
      if (h3.tagName !== "h3" || !parent || index == null) return

      let i = index + 1
      while (i < parent.children.length) {
        const c = parent.children[i]
        if (c.type === "element") break
        if (c.type === "text" && c.value.trim()) return
        i++
      }
      const ul = parent.children[i]
      if (!ul || ul.type !== "element" || ul.tagName !== "ul") return

      const hasMemo = ul.children.some(
        (li) =>
          li.type === "element" &&
          li.tagName === "li" &&
          li.children?.some(
            (c) =>
              c.type === "element" &&
              c.tagName === "strong" &&
              textOf(c).trim() === "メモ",
          ),
      )
      if (!hasMemo) return

      const already = h3.children.some(
        (c) =>
          c.type === "element" &&
          asArray(c.properties?.className).includes("badge-stayed"),
      )
      if (already) return

      h3.children.push({
        type: "element",
        tagName: "span",
        properties: { className: ["badge-stayed"] },
        children: [{ type: "text", value: "実宿泊" }],
      })
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

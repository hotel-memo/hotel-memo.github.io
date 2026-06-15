import { visit } from "unist-util-visit"

// Markdown 内の相対リンク `foo.md` や `../bar/baz.md#section` を、サイト上の
// ルーティング規約に合わせた `./foo/` のようなパス付きスラッシュ形式に変換する。
// 絶対 URL や絶対パス、メールリンク等は触らない。
export default function remarkRewriteLinks() {
  return (tree) => {
    visit(tree, "link", (node) => {
      if (!node.url) return
      if (/^[a-z][a-z0-9+.-]*:/i.test(node.url)) return // http:, mailto: 等
      if (node.url.startsWith("/")) return
      if (node.url.startsWith("#")) return

      const [pathPart, hashPart] = node.url.split("#")
      if (!pathPart.endsWith(".md")) return

      const newPath = pathPart.replace(/\.md$/, "/")
      node.url = hashPart ? `${newPath}#${hashPart}` : newPath
    })
  }
}

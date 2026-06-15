import { visit } from "unist-util-visit"

// content/publish 配下の Markdown は `../../../../images/...` のように
// publish ルートからの相対で画像を参照する。Astro 5 の自動画像最適化を
// 経由させると node_modules 経由の解決に失敗するため、絶対パス
// `/images/...` に書き換えて public/images から配信する。
export default function remarkRewriteImages() {
  return (tree) => {
    visit(tree, "image", (node) => {
      if (!node.url) return
      const match = node.url.match(/(?:\.\.\/)+(images\/.+)$/)
      if (match) {
        node.url = "/" + match[1]
      }
    })
  }
}

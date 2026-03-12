import { visit } from "unist-util-visit";

export default function rehypeStripMdLinks() {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "a") return;

      const href = node.properties?.href;
      if (!href || typeof href !== "string") return;

      if (href.endsWith(".md")) {
        let url = href.replace(/\.md$/, "");

        // index.md → directory
        url = url.replace(/\/index$/, "/");

        node.properties.href = url;
      }
    });
  };
}

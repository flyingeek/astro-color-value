import { visit } from "unist-util-visit";

export default function remarkStripMdLinks() {
  return (tree) => {
    visit(tree, "link", (node) => {
      if (!node.url) return;

      // only rewrite local markdown links
      if (node.url.endsWith(".md")) {
        let url = node.url.replace(/\.md$/, "");

        // convert index.md → directory
        url = url.replace(/\/index$/, "/");

        node.url = url;
      }
    });
  };
}

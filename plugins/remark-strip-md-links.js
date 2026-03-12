import { visit } from "unist-util-visit";
const BASE_URL = import.meta.env.BASE_URL;

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
      if (BASE_URL && node.url.startsWith("/")) {
        node.url = BASE_URL + node.url;
      }
    });
  };
}

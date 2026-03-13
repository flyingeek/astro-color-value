import { visit } from "unist-util-visit";

export default function remarkStripMdLinks() {
  return (tree) => {
    visit(tree, ["link", "definition"], (node) => {
      if (!node.url || typeof node.url !== "string") return;

      const url = node.url;

      // Skip external URLs, anchors, and protocol-relative URLs.
      if (
        url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("mailto:") ||
        url.startsWith("tel:") ||
        url.startsWith("#") ||
        url.startsWith("//")
      ) {
        return;
      }

      const queryIndex = url.indexOf("?");
      const hashIndex = url.indexOf("#");
      let splitAt = url.length;
      if (queryIndex !== -1) splitAt = Math.min(splitAt, queryIndex);
      if (hashIndex !== -1) splitAt = Math.min(splitAt, hashIndex);

      const pathname = url.slice(0, splitAt);
      const suffix = url.slice(splitAt);

      if (!pathname.endsWith(".md")) return;

      let rewritten = `${pathname.slice(0, -3)}.html`;

      // Special-case root index links.
      if (rewritten === "index.html" || rewritten === "./index.html") {
        rewritten = "./";
      }

      node.url = rewritten + suffix;
    });
  };
}

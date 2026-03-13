import { visit } from "unist-util-visit";
import path from "node:path";

/**
 * @param {{ linkFormat?: "file" | "directory" }} [options]
 */
export default function remarkStripMdLinks(options = {}) {
  const linkFormat = options.linkFormat === "directory" ? "directory" : "file";

  return (tree, file) => {
    const sourcePath = file?.history?.[0] || "";
    const docsMatch = sourcePath.match(/src[\\/]content[\\/]docs[\\/](.+)$/);
    const relativeFilePath = docsMatch ? docsMatch[1].replace(/\\/g, "/") : "";
    const currentFileName = relativeFilePath ? path.posix.basename(relativeFilePath) : "";
    const isIndexFile = /^index\.mdx?$/.test(currentFileName);

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

      if (!(pathname.endsWith(".md") || pathname.endsWith(".mdx"))) return;

      const extension = pathname.endsWith(".mdx") ? ".mdx" : ".md";
      const withoutExtension = pathname.slice(0, -extension.length);

      let rewritten;
      if (linkFormat === "directory") {
        rewritten = withoutExtension;

        if (rewritten.endsWith("/index")) {
          rewritten = rewritten.slice(0, -6) || ".";
        }

        if (!rewritten.startsWith("/") && !isIndexFile) {
          rewritten = path.posix.join("..", rewritten);
        }

        rewritten = path.posix.normalize(rewritten);

        // Keep root index links consistent.
        if (rewritten === "index" || rewritten === "./index") {
          rewritten = "./";
        }

        if (rewritten !== "./" && rewritten !== "/" && !rewritten.endsWith("/")) {
          rewritten += "/";
        }
      } else {
        rewritten = `${withoutExtension}.html`;
        // Keep root index links consistent.
        if (rewritten === "index.html" || rewritten === "./index.html") {
          rewritten = "./";
        }
      }

      node.url = rewritten + suffix;
    });
  };
}

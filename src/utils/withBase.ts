const ABSOLUTE_URL_RE = /^[a-zA-Z][a-zA-Z\d+.-]*:/;

export function withBase(path: string): string {
  if (!path) return path;

  // Keep absolute URLs and protocol-relative URLs unchanged.
  if (ABSOLUTE_URL_RE.test(path) || path.startsWith("//")) {
    return path;
  }

  // Keep hash links and relative paths unchanged.
  if (path.startsWith("#") || path.startsWith("./") || path.startsWith("../")) {
    return path;
  }

  const baseUrl = import.meta.env.BASE_URL || "/";
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  if (path.startsWith("/")) {
    return normalizedBase ? `${normalizedBase}${path}` : path;
  }

  return normalizedBase ? `${normalizedBase}/${path}` : `/${path}`;
}

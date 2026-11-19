const MAX_SLUG_LENGTH = 80;

export function slugify(value: string) {
  const slug = value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/, "");

  return slug || "untitled";
}

export function uniqueSlug(base: string, taken: string[]) {
  const used = new Set(taken);

  if (!used.has(base)) return base;

  let suffix = 2;
  while (used.has(`${base}-${suffix}`)) suffix += 1;

  return `${base}-${suffix}`;
}

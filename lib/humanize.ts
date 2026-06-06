export function humanizeSlug(slug: string): string {
  // ariadna-alfaro -> "Ariadna Alfaro"; strips trailing collision counter.
  const cleaned = slug.replace(/-\d+$/, '');
  return cleaned
    .split('-')
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

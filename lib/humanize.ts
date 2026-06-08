export function humanizeSlug(slug: string): string {
  // ariadna-alfaro -> "Ariadna Alfaro"; strips trailing collision counter.
  const cleaned = slug.replace(/-\d+$/, '');
  return cleaned
    .split('-')
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

/** Returns just the first-name token from a slug. */
export function firstNameFromSlug(slug: string): string {
  const cleaned = slug.replace(/-\d+$/, '');
  const first = cleaned.split('-').filter(Boolean)[0] ?? '';
  return first.charAt(0).toUpperCase() + first.slice(1);
}

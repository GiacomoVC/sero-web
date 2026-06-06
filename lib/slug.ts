export function toSlug(first: string, last: string): string {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  const f = norm(first);
  const l = norm(last);
  if (f && l) return `${f}-${l}`;
  return f || l || 'sero';
}

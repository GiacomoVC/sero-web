export function getBaseUrl(req?: Request): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (req) {
    const url = new URL(req.url);
    return `${url.protocol}//${url.host}`;
  }
  return 'http://localhost:3000';
}

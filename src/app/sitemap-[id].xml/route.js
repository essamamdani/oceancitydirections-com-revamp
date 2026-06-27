import { GET as handler } from '../api/sitemap/[sitemap]/route';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function GET(request, { params }) {
  // `params` is a promise in Next.js 15+, but let's await it to get `id`
  const p = await params;
  const sitemapParam = `sitemap-${p.id}`;
  return handler(request, { params: Promise.resolve({ sitemap: sitemapParam }) });
}

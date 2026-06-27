import { GET as handler } from '../api/sitemap/[sitemap]/route';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function GET(request) {
  // Mock the params object to act as 'sitemap' for the index
  const params = { sitemap: 'sitemap' };
  return handler(request, { params: Promise.resolve(params) });
}

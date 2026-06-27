import { query } from '@/lib/db';

export async function getLiveSiteId(host) {
  try {
    if (!host || host === 'unknown') return null;
    
    // Clean host
    const cleanDomain = host.replace(/^www\./, '');
    
    const res = await query(`
      SELECT id FROM live_sites 
      WHERE url ILIKE $1
      LIMIT 1
    `, [`%${cleanDomain}%`]);
    
    if (res.rows && res.rows.length > 0) {
      return res.rows[0].id;
    }
    
    // Fallback: check by slug from env
    const siteSlug = process.env.NEXT_PUBLIC_SLUG || cleanDomain.split('.')[0];
    const resSlug = await query(`
      SELECT id FROM live_sites 
      WHERE slug = $1
      LIMIT 1
    `, [siteSlug]);
    
    if (resSlug.rows && resSlug.rows.length > 0) {
      return resSlug.rows[0].id;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching live_site_id:', error);
    return null;
  }
}

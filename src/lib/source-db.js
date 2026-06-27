export async function getSourceDb(requestHost = null) {
    if (process.env.SOURCE_DB) {
        return process.env.SOURCE_DB;
    }
    
    let sourceDb = 'md'; // default
    try {
        let host = requestHost;
        if (!host && typeof window === 'undefined') {
            try {
                const { headers } = await import('next/headers');
                const headersList = await headers();
                host = headersList.get('host') || '';
            } catch(e) {
                host = '';
            }
        }
        
        if (host && typeof window === 'undefined') {
            const cleanDomain = host.replace(/^www\./, '');
            const { query } = await import('@/lib/db');
            
            let siteRes = await query('SELECT short_state FROM live_sites WHERE url ILIKE $1 LIMIT 1', [`%${cleanDomain}%`]);
            if (siteRes.rows.length === 0) {
                const match = cleanDomain.match(/^([a-z]+)directions\.com$/i);
                const slug = match ? match[1].toLowerCase() : cleanDomain.split('.')[0].toLowerCase();
                siteRes = await query('SELECT short_state FROM live_sites WHERE slug = $1 LIMIT 1', [slug]);
            }
            if (siteRes.rows.length > 0 && siteRes.rows[0].short_state) {
                sourceDb = siteRes.rows[0].short_state.toLowerCase();
            }
        }
    } catch(e) {
        console.error('Failed to determine sourceDb dynamically', e);
    }
    return sourceDb;
}

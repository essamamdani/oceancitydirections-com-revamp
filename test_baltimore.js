const { Client } = require('pg');

async function testHomePageLogic(domain) {
    const centralString = "postgresql://postgres:goTRwRD0l2ne7juNEYKY1HI6LsidX30E@supabasekong-ikocos8kw80ggogw0g00gwgk.bk.videohomes.name:5432/postgres";
    const centralClient = new Client({ connectionString: centralString });
    
    try {
        await centralClient.connect();
        
        const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
        const siteRes = await centralClient.query(`SELECT * FROM live_sites WHERE url ILIKE $1 LIMIT 1`, [`%${cleanDomain}%`]);
        
        if (siteRes.rows.length === 0) {
            console.log(`[${cleanDomain}] Not found`);
            await centralClient.end(); return;
        }
        
        const site = siteRes.rows[0];
        
        // Emulate getSiteName
        let siteName = site?.site_name || site?.slug || 'Realty Directions';
        if (siteName && siteName.toLowerCase() === site?.slug?.toLowerCase() && !siteName.toLowerCase().includes('directions')) {
            siteName = siteName.charAt(0).toUpperCase() + siteName.slice(1) + " Directions";
        } else if (siteName && !siteName.toLowerCase().includes('.com')) {
            siteName = siteName.charAt(0).toUpperCase() + siteName.slice(1);
        }
        console.log('Site Name:', siteName);
        
        console.log('IncludeRealty:', site.include_realty);
        
        // Emulate getBestRatedBusiness
        const dbRes = await centralClient.query(`SELECT supabase_url, supabase_anon_key, supabase_service_key, state_name FROM state_databases WHERE id = $1 OR LOWER(state_code) = LOWER($2) LIMIT 1`, [site.state_database_id, site.short_state]);
        const dbInfo = dbRes.rows[0];
        console.log('DB Info:', dbInfo ? dbInfo.supabase_url : 'None');
        
        const fetchSupabase = async (endpoint, payload) => {
           const url = `${dbInfo.supabase_url}/rest/v1/rpc/${endpoint}`;
           const resp = await fetch(url, {
               method: 'POST',
               headers: {
                   'apikey': dbInfo.supabase_service_key,
                   'Authorization': `Bearer ${dbInfo.supabase_service_key}`,
                   'Content-Type': 'application/json'
               },
               body: JSON.stringify(payload)
           });
           if (!resp.ok) throw new Error(await resp.text());
           return await resp.json();
        };

        const defaultState = dbInfo.state_name.toLowerCase();
        let countiesList = [];
        if (site.counties_jsonb) {
            countiesList = site.counties_jsonb.map(c => c.name);
        } else if (site.counties) {
            countiesList = site.counties.split(',').map(c => c.trim());
        }
        const defaultCounties = countiesList.map(name => name.toLowerCase());
        
        console.log("Counties:", defaultCounties);

        // Fetch best rated business logic
        const queryParams = `select=*,categories!inner(name)&state_lower=eq.${encodeURIComponent(defaultState)}&rating_value=gte.4.8&main_image=not.is.null&main_image=not.eq.&county_lower=in.(${encodeURIComponent(defaultCounties.join(','))})&categories.name=ilike.*restaurant*&order=rating_value.desc&limit=6`;
        
        const bResp = await fetch(`${dbInfo.supabase_url}/rest/v1/businesses?${queryParams}`, {
            headers: {
                'apikey': dbInfo.supabase_service_key,
                'Authorization': `Bearer ${dbInfo.supabase_service_key}`
            }
        });
        
        if (!bResp.ok) {
            console.error("Error fetching businesses:", await bResp.text());
        } else {
            const bData = await bResp.json();
            console.log(`Found ${bData.length} best rated restaurants`);
        }

        await centralClient.end();
    } catch (err) {
        console.error('Error:', err);
    }
}

testHomePageLogic("baltimoredirections.com");
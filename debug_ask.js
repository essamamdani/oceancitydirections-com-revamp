require('dotenv').config({ path: '.env.local' });
const { fetchSiteData } = require('./src/lib/site-config.js');
const { fetchListings } = require('./src/lib/actions.js');

async function run() {
  process.env.NEXT_PUBLIC_SLUG = 'oceancity';
  try {
    const site = await fetchSiteData();
    console.log('Site fetched:', site ? site.slug : null);
    
    if (site) {
      const filters = { ask: '2 beds in usd 500000' };
      const result = await fetchListings(site, filters);
      console.log('Result total records:', result ? result['@odata.count'] : null);
    }
  } catch (e) {
    console.error('Error fetching listings:', e);
  }
}
run();

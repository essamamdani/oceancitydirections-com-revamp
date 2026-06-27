const { Client } = require('pg');

async function run() {
  const centralString = "postgresql://postgres:goTRwRD0l2ne7juNEYKY1HI6LsidX30E@supabasekong-ikocos8kw80ggogw0g00gwgk.bk.videohomes.name:5432/postgres";
  const centralClient = new Client({ connectionString: centralString });
  await centralClient.connect();
  const siteRes = await centralClient.query(`SELECT * FROM live_sites WHERE url ILIKE '%baltimore%' LIMIT 1`);
  const site = siteRes.rows[0];
  await centralClient.end();

  // mimic helper.js site object transformation
  let countiesList = [];
  if (site.counties_jsonb) {
      countiesList = site.counties_jsonb.map(c => c.name);
  } else if (site.counties) {
      countiesList = site.counties.split(',').map(c => c.trim());
  }

  const siteConfig = {
    ...site,
    ShortState: site.short_state,
    DefaultCounties: countiesList
  };

  const { homePageListing } = await import('./src/lib/actions.js');
  try {
      const properties = await homePageListing(siteConfig);
      console.log('Properties:', properties);
  } catch(e) {
      console.error(e);
  }
}
run();
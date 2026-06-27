require('dotenv').config({ path: '.env.local' });
const { getAnswerRealtyObject, getAnswer } = require('./src/lib/actions.js');
const { fetchSiteData } = require('./src/lib/site-config.js');

async function run() {
  process.env.NEXT_PUBLIC_SLUG = 'oceancity';
  try {
     const site = await fetchSiteData();
     console.log('Testing business search...');
     const biz = await getAnswer(site, { ask: 'restaurant' });
     console.log('Business:', biz ? biz.businesses.length : 'null');
  } catch (e) {
     console.error('Biz Error:', e);
  }
  
  try {
     console.log('Testing realty search...');
     const realty = await getAnswerRealtyObject({ ask: 'looking for a house $150000' });
     console.log('Realty:', realty);
  } catch(e) {
     console.error('Realty Error:', e);
  }
}
run();

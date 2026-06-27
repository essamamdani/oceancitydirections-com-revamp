const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const { fetchMLS } = require('./src/lib/actions');
const { fetchMLSStatus, transformRealtyCounty } = require('./src/lib/helper');

async function test() {
  const siteConfig = { 
    DefaultCounties: ['worcester'],
    ShortState: 'md'
  };
  const defaultShortState = 'md';
  const defaultCounties = ['worcester'];
  
  const countyList = defaultCounties
      .map(c => `'${transformRealtyCounty(c)}-${defaultShortState}'`)
      .join(', ');
  
  const select = 'ListingKey,UnparsedAddress,ListingId,ModificationTimestamp,City,County';
  const filter = `StateOrProvince eq '${defaultShortState}' and County in (${countyList}) and MlsStatus in (${fetchMLSStatus['default']}) and DaysOnMarket le 180`;
  
  const encodedUrl = `BrightProperties?$format=json&$top=1&$count=true&$select=${select}&$filter=${filter}`.replace(/ /g, '%20');
  console.log("Fetching...", encodedUrl);
  try {
    const res = await fetchMLS(siteConfig, encodedUrl);
    console.log("Response Keys:", Object.keys(res || {}));
    if (res && res['@odata.count']) {
      console.log("Total Count available:", res['@odata.count']);
    }
  } catch(e) {
    console.error(e.message);
  }
}
test();

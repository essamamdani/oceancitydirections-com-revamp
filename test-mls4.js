const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function test() {
  try {
    const siteConfig = { 
      DefaultCounties: ['worcester'],
      ShortState: 'md',
      IncludeRealty: true
    };
    
    // Load dynamically like in the app
    const { fetchMLS } = require('./src/lib/actions');
    const { fetchMLSStatus, transformRealtyCounty } = require('./src/lib/helper');
    
    const defaultShortState = 'md';
    const defaultCounties = ['worcester'];
    
    const countyList = defaultCounties
        .map(c => `'${transformRealtyCounty(c)}-${defaultShortState}'`)
        .join(', ');
    
    const select = 'ListingKey,UnparsedAddress,ListingId,ModificationTimestamp,City,County';
    const filter = `StateOrProvince eq '${defaultShortState}' and County in (${countyList}) and MlsStatus in (${fetchMLSStatus['default']}) and DaysOnMarket le 180`;
    
    // Real RESO APIs often cap out at $top=10000. Let's try 10,000.
    const encodedUrl = `BrightProperties?$format=json&$top=10000&$count=true&$select=${select}&$filter=${filter}`.replace(/ /g, '%20');
    console.log("Fetching...", encodedUrl);
    
    const res = await fetchMLS(siteConfig, encodedUrl);
    console.log("Response Type:", typeof res);
    if (res && res['@odata.count']) {
      console.log("Total Count available:", res['@odata.count']);
      console.log("Returned items:", res.value?.length);
    } else {
      console.log(res);
    }
  } catch(e) {
    console.error(e.message);
  }
}
test();

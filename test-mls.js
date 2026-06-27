const { fetchSiteConfigByDomain } = require('./src/lib/site-config');
const { fetchMLS } = require('./src/lib/actions');
const { fetchMLSStatus, transformRealtyCounty } = require('./src/lib/helper');

async function test() {
  const siteConfig = await fetchSiteConfigByDomain('oceancitydirections.com');
  const defaultShortState = siteConfig?.ShortState?.toLowerCase() || 'md';
  const defaultCounties = siteConfig?.DefaultCounties || [];
  
  const countyList = defaultCounties
      .map(c => `'${transformRealtyCounty(c)}-${defaultShortState}'`)
      .join(', ');
  
  const select = 'ListingKey,UnparsedAddress,ListingId,ModificationTimestamp,City,County';
  const filter = `StateOrProvince eq '${defaultShortState}' and County in (${countyList}) and MlsStatus in (${fetchMLSStatus['default']}) and DaysOnMarket le 180`;
  
  console.log("Fetching max available per request...");
  
  try {
    // Try to get max limit RESO allows (often 10,000 max)
    const encodedUrl = `BrightProperties?$format=json&$top=1&$count=true&$select=${select}&$filter=${filter}`.replace(/ /g, '%20');
    const res = await fetchMLS(siteConfig, encodedUrl);
    console.log("Total Count available:", res['@odata.count']);
    console.log("Next link:", res['@odata.nextLink'] ? "Yes" : "No");
  } catch(e) {
    console.error(e.message);
  }
}
test();

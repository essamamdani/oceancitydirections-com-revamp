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
  const encodedUrl = `BrightProperties?$format=json&$top=10&$select=${select}&$filter=${filter}`.replace(/ /g, '%20');
  
  console.log("Encoded URL:", encodedUrl);
  try {
    const mlsResult = await fetchMLS(siteConfig, encodedUrl);
    console.log("Result length:", mlsResult?.value?.length);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();

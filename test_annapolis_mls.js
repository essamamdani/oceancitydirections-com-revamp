require('dotenv').config({ path: '.env.local' });

async function getMLSApiToken() {
  const urlencoded = new URLSearchParams({ client_id: process.env.OKTA_CLIENT_ID, client_secret: process.env.OKTA_CLIENT_SECRET, grant_type: 'client_credentials' });
  const tRes = await fetch(process.env.OKTA_BASE_URL, { method: 'POST', body: urlencoded, headers: { accept: 'application/json', 'content-type': 'application/x-www-form-urlencoded' } });
  const tData = await tRes.json();
  return tData.access_token;
}

async function testCounty(token, countyName) {
  const baseUrl = process.env.BRIGHT_MLS_BASE_URL;
  const filter = `StateOrProvince eq 'MD' and PropertyType eq 'Residential' and MlsStatus in ('ACTIVE-BRIGHT','COMING SOON-BRIGHT') and County eq '${countyName}-md'`;
  const url = new URL(baseUrl + '/BrightProperties');
  url.searchParams.append('$format', 'json');
  url.searchParams.append('$top', '1');
  url.searchParams.append('$count', 'true');
  url.searchParams.append('$filter', filter);
  
  const res = await fetch(url.toString(), { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` } });
  if (res.status === 200) {
     const data = await res.json();
     console.log(`[OK] County '${countyName}': ${data['@odata.count']} records`);
  } else {
     console.log(`[FAIL] County '${countyName}': Error ${res.status}`);
  }
}

async function run() {
  const token = await getMLSApiToken();
  const variants = [
    'kent',
    'charles',
    'prince georges',
    'prince george',
    "prince george's",
    'queen annes',
    'queen anne',
    "queen anne's",
    'st marys',
    'saint marys',
    'st. marys',
    'st mary',
    'saint mary',
    'anne arundel',
    'calvert'
  ];
  
  for (const v of variants) {
     await testCounty(token, v);
  }
}
run();

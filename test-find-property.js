require('dotenv').config({ path: '.env-local' });

async function getMLSApiToken() {
  const urlencoded = new URLSearchParams({
    client_id: process.env.OKTA_CLIENT_ID,
    client_secret: process.env.OKTA_CLIENT_SECRET,
    grant_type: 'client_credentials'
  });
  const tRes = await fetch(process.env.OKTA_BASE_URL, {
    method: 'POST',
    body: urlencoded,
    headers: { accept: 'application/json', 'content-type': 'application/x-www-form-urlencoded' }
  });
  const tData = await tRes.json();
  return tData.access_token;
}

function realtySlug(property) {
  const { ListingKey, UnparsedAddress, ListingId } = property;
  const slug = UnparsedAddress
    .replace(/,/g, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return `/realty/${ListingKey}--${slug}-${ListingId}`;
}

async function searchByFilter(token, label, filterStr) {
  const baseUrl = process.env.BRIGHT_MLS_BASE_URL;
  const select = 'ListingKey,UnparsedAddress,ListingId,City,County,StateOrProvince,ListPrice,MlsStatus';
  const url = new URL(baseUrl + '/BrightProperties');
  url.searchParams.append('$format', 'json');
  url.searchParams.append('$top', '10');
  url.searchParams.append('$select', select);
  url.searchParams.append('$filter', filterStr);

  console.log(`\n[${label}]`);
  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }
  });

  if (res.status !== 200) {
    console.log('Error:', res.status, await res.text());
    return [];
  }

  const data = await res.json();
  return data.value || [];
}

async function findProperty() {
  const token = await getMLSApiToken();

  // All statuses including active, under contract, coming soon, closed, etc.
  const allStatuses = `'ACTIVE-BRIGHT','COMING SOON-BRIGHT','ACTIVE UNDER CONTRACT-BRIGHT','PENDING-BRIGHT','CLOSED-BRIGHT','WITHDRAWN-BRIGHT','EXPIRED-BRIGHT'`;

  const searches = [
    ['Full address (all statuses)', `contains(UnparsedAddress, '12304 Welford Manor Drive') and MlsStatus in (${allStatuses})`],
    ['Street name Welford Manor (all statuses)', `contains(UnparsedAddress, 'Welford Manor') and MlsStatus in (${allStatuses})`],
    ['No status filter - any MLS record', `contains(UnparsedAddress, 'Welford Manor')`],
  ];

  let found = false;
  for (const [label, filter] of searches) {
    const properties = await searchByFilter(token, label, filter);
    if (properties.length > 0) {
      found = true;
      console.log(`  -> ${properties.length} property(ies) mili:\n`);
      properties.forEach((p, i) => {
        const slug = realtySlug(p);
        console.log(`  --- Property ${i + 1} ---`);
        console.log('  Address    :', p.UnparsedAddress);
        console.log('  ListingKey :', p.ListingKey);
        console.log('  ListingId  :', p.ListingId);
        console.log('  City       :', p.City);
        console.log('  County     :', p.County);
        console.log('  Status     :', p.MlsStatus);
        console.log('  Price      : $' + (p.ListPrice || 0).toLocaleString());
        console.log('  Slug path  :', slug);
        console.log('  Full URL   :', `http://localhost:3000${slug}`);
        console.log('');
      });
    } else {
      console.log('  -> Kuch nahi mila');
    }
  }

  if (!found) {
    console.log('\nKoi bhi search mein property nahi mili.');
    console.log('Possible reasons:');
    console.log('  1. Property is Maryland/Worcester ke bahar hai');
    console.log('  2. Address spelling alag ho sakti hai MLS mein');
    console.log('  3. Property Bright MLS network mein registered nahi');
  }
}

findProperty().catch(console.error);

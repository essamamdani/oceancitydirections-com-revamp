/**
 * AI Search Diagnostic Test
 * Tests detectQueryType, parseNaturalLanguageQuery, buildNLFilterURL
 * Run: node test-ai-search.js
 */

let passed = 0, failed = 0;
function pass(label) { passed++; console.log(`  \x1b[32m✔\x1b[0m ${label}`); }
function fail(label, got, expected) { failed++; console.log(`  \x1b[31m✘\x1b[0m ${label}\n    got:      \x1b[33m${JSON.stringify(got)}\x1b[0m\n    expected: \x1b[33m${JSON.stringify(expected)}\x1b[0m`); }
function section(t) { console.log(`\n\x1b[36m━━━ ${t} ━━━\x1b[0m`); }

// ─── Fixed helpers (copy from actions.js) ────────────────────────────────────

function detectQueryType(query) {
  // ListingId: no spaces, starts with 2+ letters, contains at least one digit
  const hasListingId = !query.includes(' ') && /^[A-Z]{2,}[A-Z0-9]*\d[A-Z0-9]*$/i.test(query.trim());
  if (hasListingId) return { type: 'listing_id', features: { listingId: query.trim() } };

  const hasPrice = /\$\d+/.test(query)
    || /\d+\s*(k|thousand)\b/i.test(query)
    || /\d+(\.\d+)?\s*million\b/i.test(query)
    || /\$?\d+(\.\d+)?\s*m\b/i.test(query);

  const hasZip = /\b\d{5}\b/.test(query);
  const hasBedrooms = /\d+\s*(bed|bedroom|br)/i.test(query);
  const hasType = /\b(house|condo|apartment|flat|townhome|duplex)\b/i.test(query);

  // Property type alone (even without in/near/at) → Natural Language
  if (hasPrice || hasBedrooms || hasType) {
    return { type: 'natural_language', features: { hasPrice, hasZip, hasBedrooms, hasType } };
  }
  if (/^\d+/.test(query) && !hasType && !hasZip) {
    return { type: 'address', features: { hasPrice, hasZip, hasBedrooms, hasType } };
  }
  return { type: 'mixed', features: { hasPrice, hasZip, hasBedrooms, hasType } };
}

function parseNaturalLanguageQuery(query) {
  const filters = {};

  const priceMillion = query.match(/\$?(\d+(?:\.\d+)?)\s*million\b/i);
  const priceMShort = query.match(/\$(\d+(?:\.\d+)?)\s*m\b/i) || query.match(/\b(\d+(?:\.\d+)?)\s*m\b(?!\w)/i);
  const priceKMatch = query.match(/\$?(\d+(?:\.\d+)?)\s*k\b/i);
  const underPriceMatch = query.match(/under\s+\$?(\d+(?:,\d{3})*)/i);
  const priceMatch = query.match(/\$(\d+(?:,\d{3})*)/);

  if (priceMillion) {
    filters.price = Math.round(parseFloat(priceMillion[1]) * 1_000_000);
  } else if (priceMShort) {
    filters.price = Math.round(parseFloat(priceMShort[1]) * 1_000_000);
  } else if (priceKMatch) {
    filters.price = Math.round(parseFloat(priceKMatch[1]) * 1_000);
  } else if (underPriceMatch) {
    filters.price = parseInt(underPriceMatch[1].replace(/,/g, ''));
  } else if (priceMatch) {
    filters.price = parseInt(priceMatch[1].replace(/,/g, ''));
  }

  const bedMatch = query.match(/(\d+)\s*(?:bed|bedroom|br)/i);
  if (bedMatch) filters.bedrooms = parseInt(bedMatch[1]);

  const zipMatch = query.match(/\b(\d{5})\b/);
  if (zipMatch) filters.zip = zipMatch[1];

  const typeMap = { house: 'Residential', condo: 'Residential', apartment: 'Residential', flat: 'Residential', townhome: 'Residential', duplex: 'Residential' };
  for (const [keyword, type] of Object.entries(typeMap)) {
    if (query.toLowerCase().includes(keyword)) { filters.propertyType = type; break; }
  }

  const cityMatch = query.match(/(?:in|near)\s+([a-zA-Z][a-zA-Z\s]*?)(?=\s*,|\s+\d|\s+(?:under|over|with|and|for|near|the)\b|$)/i);
  if (cityMatch) filters.city = cityMatch[1].trim();

  return filters;
}

function buildNLFilterURL(baseFilter, locationFilter, filters, fetchCategory) {
  let url = `BrightProperties?$format=json&$top=100&$count=true&$filter=${baseFilter}`;
  url += `PropertyType eq '${fetchCategory}' and `;
  if (!filters.zip) url += locationFilter + ' and ';
  if (filters.price) url += `ListPrice le ${filters.price} and `;
  if (filters.bedrooms) url += `BedroomsTotal ge ${filters.bedrooms} and `;
  if (filters.zip) url += `PostalCode eq '${filters.zip}' and `;
  if (filters.city) url += `City eq '${filters.city}' and `;
  url = url.replace(/ and $/, '');
  return url;
}

const fetchCategories = { sale: 'Residential', rent: 'Residential Lease', land: 'Land', multi: 'Multi-Family', commercial: 'Commercial Sale', 'commercial-lease': 'CommercialLease' };

function buildAIObjectURL(baseFilter, locationFilter, aiObject, fetchCategory) {
  if (!aiObject) return null;
  const hasUsefulData = (aiObject.address && aiObject.address.trim()) ||
    (aiObject.price && aiObject.price > 0) ||
    (aiObject.bedrooms && aiObject.bedrooms > 0) ||
    (aiObject.sqft && aiObject.sqft > 0);
  if (!hasUsefulData) return null;

  const category = fetchCategories[aiObject.category] || fetchCategory;
  let url = `BrightProperties?$format=json&$top=100&$count=true&$filter=${baseFilter}PropertyType eq '${category}' and `;

  if (aiObject.address && aiObject.address.trim()) {
    url += `contains(UnparsedAddress, '${aiObject.address.replace(/'/g, "''").trim()}')`;
  } else {
    url += locationFilter;
  }

  if (aiObject.price && aiObject.price > 0) url += ` and ListPrice le ${aiObject.price}`;
  if (aiObject.bedrooms && aiObject.bedrooms > 0) url += ` and BedroomsTotal ge ${aiObject.bedrooms}`;
  if (aiObject.sqft && aiObject.sqft > 0) url += ` and LivingArea ge ${aiObject.sqft}`;

  return url;
}

// Parallel merge helper (mirrors fetchListings logic)
function mergeByListingKey(...arrays) {
  const seen = new Set();
  const merged = [];
  for (const arr of arrays) {
    for (const p of (arr || [])) {
      if (!seen.has(p.ListingKey)) { seen.add(p.ListingKey); merged.push(p); }
    }
  }
  return merged;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

section('1. detectQueryType — NL price formats');
{
  const t = detectQueryType('1 million apartment in 20602');
  t.type === 'natural_language' ? pass('"1 million apartment in 20602" → natural_language') : fail('"1 million apartment in 20602"', t.type, 'natural_language');
}
{
  const t = detectQueryType('1 million flat in 20602');
  t.type === 'natural_language' ? pass('"1 million flat in 20602" → natural_language') : fail('"1 million flat in 20602"', t.type, 'natural_language');
}
{
  const t = detectQueryType('$500k house in annapolis');
  t.type === 'natural_language' ? pass('"$500k house in annapolis" → natural_language') : fail('"$500k house in annapolis"', t.type, 'natural_language');
}
{
  const t = detectQueryType('500k house in 21401');
  t.type === 'natural_language' ? pass('"500k house in 21401" → natural_language') : fail('"500k house in 21401"', t.type, 'natural_language');
}
{
  const t = detectQueryType('1.5m condo near annapolis');
  t.type === 'natural_language' ? pass('"1.5m condo near annapolis" → natural_language') : fail('"1.5m condo near annapolis"', t.type, 'natural_language');
}
{
  const t = detectQueryType('3 bedroom house under $400000');
  t.type === 'natural_language' ? pass('"3 bedroom house under $400000" → natural_language') : fail('"3 bedroom house under $400000"', t.type, 'natural_language');
}

section('2. detectQueryType — address, listing_id, mixed');
{
  const t = detectQueryType('123 Main St Annapolis MD');
  t.type === 'address' ? pass('"123 Main St Annapolis MD" → address') : fail('"123 Main St Annapolis MD"', t.type, 'address');
}
{
  const t = detectQueryType('MDAA2140244');
  t.type === 'listing_id' ? pass('"MDAA2140244" → listing_id') : fail('"MDAA2140244"', t.type, 'listing_id');
}
{
  const t = detectQueryType('annapolis waterfront home');
  t.type === 'mixed' ? pass('"annapolis waterfront home" → mixed') : fail('"annapolis waterfront home"', t.type, 'mixed');
}

section('3. parseNaturalLanguageQuery — price formats');
{
  const f = parseNaturalLanguageQuery('1 million apartment in 20602');
  f.price === 1_000_000 ? pass('"1 million" → price 1000000') : fail('"1 million" price', f.price, 1_000_000);
  f.zip === '20602' ? pass('"in 20602" → zip 20602') : fail('"in 20602" zip', f.zip, '20602');
}
{
  const f = parseNaturalLanguageQuery('1.5 million house in annapolis');
  f.price === 1_500_000 ? pass('"1.5 million" → price 1500000') : fail('"1.5 million" price', f.price, 1_500_000);
}
{
  const f = parseNaturalLanguageQuery('$500k condo');
  f.price === 500_000 ? pass('"$500k" → price 500000') : fail('"$500k" price', f.price, 500_000);
}
{
  const f = parseNaturalLanguageQuery('500k house in 21401');
  f.price === 500_000 ? pass('"500k" (no $) → price 500000') : fail('"500k" price', f.price, 500_000);
  f.zip === '21401' ? pass('"in 21401" → zip 21401') : fail('"in 21401" zip', f.zip, '21401');
}
{
  const f = parseNaturalLanguageQuery('under $300000 3 bedroom house');
  f.price === 300_000 ? pass('"under $300000" → price 300000') : fail('"under $300000" price', f.price, 300_000);
  f.bedrooms === 3 ? pass('"3 bedroom" → bedrooms 3') : fail('"3 bedroom"', f.bedrooms, 3);
}
{
  const f = parseNaturalLanguageQuery('$250,000 house');
  f.price === 250_000 ? pass('"$250,000" → price 250000') : fail('"$250,000" price', f.price, 250_000);
}

section('4. buildNLFilterURL — zip bypasses county filter');
{
  const base = "StateOrProvince eq 'MD' and MlsStatus in ('ACTIVE-BRIGHT') and DaysOnMarket le 365 and ";
  const locFilter = "County in ('anne arundel-md','kent-md')";
  const filters = { zip: '20602', price: 1_000_000 };
  const url = buildNLFilterURL(base, locFilter, filters, 'Residential');
  !url.includes('anne arundel') ? pass('zip present → county filter skipped') : fail('county filter skipped', 'county in URL', 'county absent');
  url.includes("PostalCode eq '20602'") ? pass('PostalCode eq 20602 in URL') : fail('PostalCode filter missing', url, 'PostalCode present');
  url.includes('ListPrice le 1000000') ? pass('ListPrice le 1000000 in URL') : fail('ListPrice filter missing', url, 'ListPrice present');
  console.log(`    URL: \x1b[33m${url}\x1b[0m`);
}
{
  const base = "StateOrProvince eq 'MD' and MlsStatus in ('ACTIVE-BRIGHT') and DaysOnMarket le 365 and ";
  const locFilter = "County in ('anne arundel-md','kent-md')";
  const filters = { price: 500_000 };
  const url = buildNLFilterURL(base, locFilter, filters, 'Residential');
  url.includes('anne arundel') ? pass('no zip → county filter applied') : fail('county filter missing', url, 'county present');
}

section('5. buildAIObjectURL — AI object to MLS URL');
{
  const base = "StateOrProvince eq 'MD' and MlsStatus in ('ACTIVE-BRIGHT') and DaysOnMarket le 365 and ";
  const loc  = "County in ('anne arundel-md')";

  // price + bedrooms, no address → use locationFilter
  const url1 = buildAIObjectURL(base, loc, { price: 500000, bedrooms: 3, category: 'sale' }, 'Residential');
  url1 !== null ? pass('price+bedrooms → URL generated') : fail('price+bedrooms URL', url1, 'non-null');
  url1 && url1.includes('ListPrice le 500000') ? pass('ListPrice le 500000 present') : fail('ListPrice le 500000', url1, 'contains ListPrice');
  url1 && url1.includes('BedroomsTotal ge 3') ? pass('BedroomsTotal ge 3 present') : fail('BedroomsTotal ge 3', url1, 'contains Bedrooms');
  url1 && url1.includes('anne arundel') ? pass('no address → locationFilter applied') : fail('locationFilter', url1, 'contains county');
}
{
  const base = "StateOrProvince eq 'MD' and MlsStatus in ('ACTIVE-BRIGHT') and DaysOnMarket le 365 and ";
  const loc  = "County in ('anne arundel-md')";

  // address present → skip locationFilter, use contains
  const url2 = buildAIObjectURL(base, loc, { address: '123 Main St', bedrooms: 2, category: 'sale' }, 'Residential');
  url2 && url2.includes("contains(UnparsedAddress, '123 Main St')") ? pass('address → contains(UnparsedAddress)') : fail('address contains', url2, 'contains UnparsedAddress');
  url2 && !url2.includes('anne arundel') ? pass('address present → county filter skipped') : fail('county skipped', url2, 'no county');
}
{
  // null / empty object → returns null
  const url3 = buildAIObjectURL('base', 'loc', null, 'Residential');
  url3 === null ? pass('null aiObject → null URL') : fail('null aiObject', url3, null);

  const url4 = buildAIObjectURL('base', 'loc', { category: 'sale', price: -1, bedrooms: -1 }, 'Residential');
  url4 === null ? pass('no useful data → null URL') : fail('no useful data', url4, null);
}
{
  // sqft filter
  const base = "StateOrProvince eq 'MD' and MlsStatus in ('ACTIVE-BRIGHT') and DaysOnMarket le 365 and ";
  const loc  = "County in ('anne arundel-md')";
  const url5 = buildAIObjectURL(base, loc, { sqft: 2000, price: 400000, category: 'sale' }, 'Residential');
  url5 && url5.includes('LivingArea ge 2000') ? pass('sqft → LivingArea ge 2000') : fail('sqft filter', url5, 'LivingArea present');
}

section('6. mergeByListingKey — parallel result deduplication');
{
  const direct = [{ ListingKey: 'A1' }, { ListingKey: 'B2' }];
  const ai     = [{ ListingKey: 'B2' }, { ListingKey: 'C3' }];
  const merged = mergeByListingKey(direct, ai);
  merged.length === 3 ? pass('direct[2] + ai[2] (1 dup) → merged[3]') : fail('merge count', merged.length, 3);
  merged[0].ListingKey === 'A1' ? pass('direct results come first') : fail('order', merged[0].ListingKey, 'A1');
}
{
  // Both empty
  const merged = mergeByListingKey([], []);
  merged.length === 0 ? pass('both empty → merged empty') : fail('both empty', merged.length, 0);
}
{
  // AI-only results (direct empty)
  const ai = [{ ListingKey: 'X1' }, { ListingKey: 'X2' }];
  const merged = mergeByListingKey([], ai);
  merged.length === 2 ? pass('direct empty, ai[2] → merged[2]') : fail('ai-only merge', merged.length, 2);
}

section('7. detectQueryType — edge cases');
{
  // Address with "MD" state abbr should still be address type
  const t = detectQueryType('123 Oak Ln Annapolis MD');
  t.type === 'address' ? pass('"123 Oak Ln Annapolis MD" → address') : fail('address with state', t.type, 'address');
}
{
  // Listing ID with lowercase should match (no spaces)
  const t = detectQueryType('mdaa2140244');
  t.type === 'listing_id' ? pass('"mdaa2140244" lowercase → listing_id') : fail('lowercase listing id', t.type, 'listing_id');
}
{
  // Rent query
  const t = detectQueryType('2 bedroom apartment for rent in Columbia');
  t.type === 'natural_language' ? pass('"2 bedroom apartment for rent" → natural_language') : fail('rent query', t.type, 'natural_language');
}
{
  // Property name without number → mixed
  const t = detectQueryType('Chesapeake Bay waterfront estate');
  t.type === 'mixed' ? pass('"Chesapeake Bay waterfront estate" → mixed') : fail('named property', t.type, 'mixed');
}
{
  // REGRESSION: "homes in 21401" must NOT match listing_id (has spaces)
  const t = detectQueryType('homes in 21401');
  t.type !== 'listing_id' ? pass('"homes in 21401" → NOT listing_id (has spaces)') : fail('homes in 21401 false-positive', t.type, 'NOT listing_id');
}
{
  // REGRESSION: long query with numbers must NOT match listing_id
  const t = detectQueryType('Investment property near Baltimore under 150k');
  t.type !== 'listing_id' ? pass('"Investment property near Baltimore under 150k" → NOT listing_id') : fail('long query false listing_id', t.type, 'natural_language');
  t.type === 'natural_language' ? pass('correctly → natural_language (hasPrice)') : fail('long query type', t.type, 'natural_language');
}
{
  // REGRESSION: condo without explicit in/near should still be natural_language (hasType)
  const t = detectQueryType('pet friendly condo downtown Annapolis');
  t.type === 'natural_language' ? pass('"pet friendly condo downtown Annapolis" → natural_language') : fail('condo no location keyword', t.type, 'natural_language');
}
{
  // ZIP-only query (no type, no price) → mixed
  const t = detectQueryType('21401');
  t.type === 'mixed' ? pass('"21401" zip-only → mixed') : fail('zip-only', t.type, 'mixed');
}
{
  // Zip with "homes in" prefix → NOT listing_id, not address
  const t = detectQueryType('homes in 21401');
  t.type === 'mixed' ? pass('"homes in 21401" → mixed') : fail('"homes in 21401" type', t.type, 'mixed');
}

section('8. parseNaturalLanguageQuery — more formats');
{
  // "2 br" shorthand
  const f = parseNaturalLanguageQuery('2 br condo under $300k');
  f.bedrooms === 2 ? pass('"2 br" → bedrooms 2') : fail('"2 br"', f.bedrooms, 2);
  f.price === 300_000 ? pass('"$300k" → price 300000') : fail('"$300k"', f.price, 300_000);
}
{
  // City extraction with trailing comma
  const f = parseNaturalLanguageQuery('house in Annapolis, MD');
  f.city === 'Annapolis' ? pass('"in Annapolis," → city Annapolis') : fail('city trailing comma', f.city, 'Annapolis');
}
{
  // "near" keyword
  const f = parseNaturalLanguageQuery('condos near Baltimore under 500k');
  f.city === 'Baltimore' ? pass('"near Baltimore" → city Baltimore') : fail('"near" city', f.city, 'Baltimore');
  f.price === 500_000 ? pass('"500k" → price 500000') : fail('"500k"', f.price, 500_000);
}

console.log(`\n${'─'.repeat(60)}`);
const total = passed + failed;
const color = failed === 0 ? '\x1b[32m' : '\x1b[31m';
console.log(`${color}\x1b[1m${passed}/${total} tests passed\x1b[0m`);
if (failed > 0) process.exit(1);

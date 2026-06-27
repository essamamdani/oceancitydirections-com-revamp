/**
 * BrightMLS Slug Diagnostic Test
 * Verifies: UnparsedAddress already has full address for normal listings.
 * Fix: slug = UnparsedAddress + county (county is what was missing).
 * For broken listings where UnparsedAddress = "MD,ANNE ARUNDEL", fall back to structured fields.
 *
 * Run: node test-mls-slug.js
 */

require('dotenv').config({ path: '.env-local' });
const slugify = require('slugify');

const MLS_BASE_URL = process.env.BRIGHT_MLS_BASE_URL;
const OKTA_URL     = process.env.OKTA_BASE_URL;
const OKTA_ID      = process.env.OKTA_CLIENT_ID;
const OKTA_SECRET  = process.env.OKTA_CLIENT_SECRET;

const BAD_LISTING_ID  = 'MDAA2139590';  // UnparsedAddress = "MD,ANNE ARUNDEL" (broken)
const GOOD_LISTING_ID = 'MDKE2005786';  // Normal listing

let passed = 0, failed = 0;
function pass(label) { passed++; console.log(`  \x1b[32m✔\x1b[0m ${label}`); }
function fail(label, reason) { failed++; console.log(`  \x1b[31m✘\x1b[0m ${label}\n    \x1b[33m→ ${reason}\x1b[0m`); }
function section(t) { console.log(`\n\x1b[36m━━━ ${t} ━━━\x1b[0m`); }

async function getToken() {
  const res = await fetch(OKTA_URL, {
    method: 'POST',
    body: new URLSearchParams({ client_id: OKTA_ID, client_secret: OKTA_SECRET, grant_type: 'client_credentials' }),
    headers: { accept: 'application/json', 'content-type': 'application/x-www-form-urlencoded' },
  });
  const d = await res.json();
  if (!d.access_token) throw new Error('Auth failed: ' + JSON.stringify(d));
  return d.access_token;
}

async function fetchMLS(token, path) {
  const res = await fetch(`${MLS_BASE_URL}/${path}`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`MLS ${res.status}: ${await res.text()}`);
  return res.json();
}

// ─── New slug logic: UnparsedAddress + county ─────────────────────────────────
// UnparsedAddress already has street+city+state+zip for most listings.
// County is what's missing — append it.
// For broken listings (no street number in UnparsedAddress), fall back to structured fields.
function extractCountyName(County, StateOrProvince) {
  if (!County) return '';
  if (StateOrProvince) return County.replace(new RegExp(`-${StateOrProvince.toLowerCase()}$`, 'i'), '').trim();
  return County.replace(/-[a-z]{2}$/i, '').trim();
}

function realtySlug(property) {
  const { ListingKey, ListingId, UnparsedAddress, FullStreetAddress, City, StateOrProvince, PostalCode, County } = property;

  let addressStr;
  // BrightMLS UnparsedAddress already includes county — use directly when it has a street number
  if (UnparsedAddress && /\d/.test(UnparsedAddress) && UnparsedAddress.replace(/,/g,'').trim().length > 10) {
    addressStr = UnparsedAddress;
  } else {
    // Broken UnparsedAddress — build from structured fields + county
    const parts = [FullStreetAddress, City, StateOrProvince, PostalCode].filter(Boolean);
    const countyName = extractCountyName(County, StateOrProvince);
    if (countyName) parts.push(countyName);
    addressStr = parts.length > 0 ? parts.join(' ') : (UnparsedAddress || 'unknown');
  }

  return `/realty/${ListingKey}--${slugify(addressStr.replace(/,/g, ' '), { lower: true, strict: true })}-${ListingId}`;
}

function getDisplayAddress(property) {
  if (!property) return '';
  const { UnparsedAddress, FullStreetAddress, City, StateOrProvince, PostalCode } = property;
  const unparsed = UnparsedAddress || '';
  if (unparsed && /\d/.test(unparsed) && unparsed.replace(/,/g,'').trim().length > 10) {
    return unparsed;
  }
  return [FullStreetAddress, City, StateOrProvince, PostalCode].filter(Boolean).join(', ') || unparsed;
}

const NEW_SELECT = 'ListingKey,UnparsedAddress,ListingId,ModificationTimestamp,FullStreetAddress,City,StateOrProvince,PostalCode,County';

(async () => {
  try {
    const token = await getToken();
    console.log('\x1b[32m[Auth] BrightMLS token obtained\x1b[0m');

    // ═══════════════════════════════════════════════════════════════
    section('1. Inspect UnparsedAddress for bad listing (MDAA2139590)');
    // ═══════════════════════════════════════════════════════════════
    const r1 = await fetchMLS(token, `BrightProperties?$format=json&$select=${NEW_SELECT}&$filter=ListingId eq '${BAD_LISTING_ID}'`);
    const p1 = r1.value?.[0];
    if (!p1) { fail('Listing found', 'Not returned'); }
    else {
      console.log(`    UnparsedAddress  = \x1b[31m"${p1.UnparsedAddress}"\x1b[0m  ← broken (no street number)`);
      console.log(`    FullStreetAddress= \x1b[32m"${p1.FullStreetAddress}"\x1b[0m`);
      console.log(`    County           = "${p1.County}"`);
      const slug = realtySlug(p1);
      console.log(`    Slug             = \x1b[33m${slug}\x1b[0m`);
      const bad = slug.includes('--md-anne-arundel') || slug.includes('unknown');
      if (!bad) pass('Bad listing: fallback to structured fields, slug is clean');
      else fail('Bad listing: slug still broken', slug);

      const disp = getDisplayAddress(p1);
      console.log(`    getDisplayAddress = \x1b[32m"${disp}"\x1b[0m`);
      if (/\d/.test(disp)) pass('Bad listing: getDisplayAddress returns full address');
      else fail('Bad listing: getDisplayAddress still broken', disp);
    }

    // ═══════════════════════════════════════════════════════════════
    section('2. Inspect UnparsedAddress for normal listing (MDKE2005786)');
    // ═══════════════════════════════════════════════════════════════
    const r2 = await fetchMLS(token, `BrightProperties?$format=json&$select=${NEW_SELECT}&$filter=ListingId eq '${GOOD_LISTING_ID}'`);
    const p2 = r2.value?.[0];
    if (!p2) { fail('Good listing found', 'Not returned'); }
    else {
      console.log(`    UnparsedAddress  = \x1b[32m"${p2.UnparsedAddress}"\x1b[0m`);
      console.log(`    FullStreetAddress= "${p2.FullStreetAddress}"`);
      console.log(`    City             = "${p2.City}", State = "${p2.StateOrProvince}", Zip = "${p2.PostalCode}"`);
      console.log(`    County           = "${p2.County}"`);
      const slug = realtySlug(p2);
      console.log(`    Slug             = \x1b[33m${slug}\x1b[0m`);
      const hasStreet = /--[a-z]/.test(slug);
      const noDoubleCounty = !slug.includes('-kent-kent-') && !slug.includes('-anne-arundel-anne-arundel-');
      if (hasStreet) pass('Normal listing: slug uses UnparsedAddress');
      else fail('Normal listing: slug missing street address', slug);
      if (noDoubleCounty) pass('Normal listing: no duplicate county in slug');
      else fail('Normal listing: county duplicated', slug);
    }

    // ═══════════════════════════════════════════════════════════════
    section('3. Bulk fetch 10 Anne Arundel listings — check all slugs');
    // ═══════════════════════════════════════════════════════════════
    const r3 = await fetchMLS(token,
      `BrightProperties?$format=json&$top=10&$select=${NEW_SELECT}&$filter=StateOrProvince eq 'MD' and MlsStatus in ('ACTIVE-BRIGHT','COMING SOON-BRIGHT') and County in ('anne arundel-md') and DaysOnMarket le 180`
    );
    const listings3 = r3.value || [];
    console.log(`    Fetched ${listings3.length} listings`);
    let allGood = true;
    for (const l of listings3) {
      const s = realtySlug(l);
      const disp = getDisplayAddress(l);
      const bad = !(/\d/.test(s)) || s.includes('--md-');
      if (bad) { allGood = false; console.log(`    \x1b[31m✘\x1b[0m slug: ${s}  |  display: "${disp}"`); }
      else console.log(`    \x1b[32m✔\x1b[0m ${s}`);
    }
    if (allGood && listings3.length > 0) pass('All 10 Anne Arundel slugs clean');
    else if (!allGood) fail('Some slugs still broken', 'see above');

    // ═══════════════════════════════════════════════════════════════
    section('4. Test getDisplayAddress vs UnparsedAddress for bulk listings');
    // ═══════════════════════════════════════════════════════════════
    let dispAllGood = true;
    for (const l of listings3) {
      const disp = getDisplayAddress(l);
      if (!/\d/.test(disp)) {
        dispAllGood = false;
        console.log(`    \x1b[31m✘\x1b[0m ListingId=${l.ListingId}: "${disp}"`);
      }
    }
    if (dispAllGood && listings3.length > 0) pass('All getDisplayAddress values contain street number');
    else if (!dispAllGood) fail('Some display addresses missing street number', 'see above');

    // ═══════════════════════════════════════════════════════════════
    section('5. Title test for bad listing using getDisplayAddress');
    // ═══════════════════════════════════════════════════════════════
    if (p1) {
      const disp = getDisplayAddress(p1);
      const title = `$${p1.ListPrice}, ${disp} MLS: ${p1.ListingId}`;
      console.log(`    UnparsedAddress  = \x1b[31m"${p1.UnparsedAddress}"\x1b[0m`);
      console.log(`    Title            = \x1b[32m"${title}"\x1b[0m`);
      if (/\d/.test(disp)) pass('Title uses full address, not "MD,ANNE ARUNDEL"');
      else fail('Title still bad', title);
    }

    // ─── Summary ─────────────────────────────────────────────────
    console.log(`\n${'─'.repeat(60)}`);
    const total = passed + failed;
    const color = failed === 0 ? '\x1b[32m' : '\x1b[31m';
    console.log(`${color}\x1b[1m${passed}/${total} tests passed\x1b[0m`);
    if (failed > 0) process.exit(1);
  } catch (e) {
    console.error('\x1b[31mFatal error:\x1b[0m', e.message);
    process.exit(1);
  }
})();

#!/usr/bin/env node
/**
 * Property Search Test Script
 * Tests natural language queries for real estate search
 * Run: node test-property-search.js
 */

const BASE_URL = 'https://www.annapolisdirections.com';

// Test cases - Natural language queries (not just addresses)
const testCases = [
  // Direct address queries
  { query: '12304 Welford Manor Drive', type: 'direct_address', expect: 'exact_match' },
  { query: '12304 Welford Manor Dr', type: 'abbreviated_address', expect: 'exact_match' },
  { query: '23105 Roberts Tavern Dr', type: 'direct_address', expect: 'exact_match' },
  
  // Price + type + location
  { query: '$100000 flat in 20602', type: 'price_type_zip', expect: 'filter_results' },
  { query: 'homes under $300000 in Annapolis', type: 'price_city', expect: 'filter_results' },
  { query: 'condos for sale in 21401 under $200000', type: 'type_zip_price', expect: 'filter_results' },
  
  // Feature-based
  { query: '3 bedroom house with pool in Prince Georges County', type: 'features_county', expect: 'filter_results' },
  { query: 'pet friendly apartments near downtown', type: 'features_location', expect: 'filter_results' },
  { query: 'waterfront property in Anne Arundel', type: 'feature_county', expect: 'filter_results' },
  
  // Natural language
  { query: 'Looking for a family home with backyard in Severna Park', type: 'natural', expect: 'filter_results' },
  { query: 'Investment property near Baltimore under 150k', type: 'natural_investment', expect: 'filter_results' },
  { query: 'New construction in Howard County', type: 'natural_new', expect: 'filter_results' },
  
  // Partial/typo
  { query: '12304 Welford', type: 'partial_address', expect: 'exact_match' },
  { query: 'Welford Manor', type: 'partial_address', expect: 'exact_match' },
  
  // City/county only
  { query: 'houses in Baltimore', type: 'city_only', expect: 'filter_results' },
  { query: 'properties in Montgomery County', type: 'county_only', expect: 'filter_results' },
  
  // Rent
  { query: 'apartments for rent under $1500', type: 'rent_price', expect: 'filter_results' },
  { query: '2 bedroom rental in Columbia', type: 'rent_bedrooms_city', expect: 'filter_results' }
];

// Test execution
async function testSearch(query, type) {
  const askUrl = `${BASE_URL}/realty?ask=${encodeURIComponent(query)}`;
  const qUrl = `${BASE_URL}/realty?q=${encodeURIComponent(query)}`;
  
  console.log(`\n📝 Testing: "${query}" (${type})`);
  console.log(`   Ask URL: ${askUrl}`);
  console.log(`   Q URL: ${qUrl}`);
  
  try {
    // Test both endpoints
    const [askRes, qRes] = await Promise.all([
      fetch(askUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }).then(r => ({
        status: r.status,
        hasResults: r.ok
      })).catch(e => ({ status: 'error', error: e.message })),
      
      fetch(qUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }).then(r => ({
        status: r.status,
        hasResults: r.ok
      })).catch(e => ({ status: 'error', error: e.message }))
    ]);
    
    console.log(`   Ask Result: ${askRes.status} ${askRes.hasResults ? '✅' : '❌'}`);
    console.log(`   Q Result: ${qRes.status} ${qRes.hasResults ? '✅' : '❌'}`);
    
    return {
      query,
      type,
      ask: askRes,
      q: qRes,
      success: askRes.hasResults || qRes.hasResults
    };
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    return { query, type, error: err.message, success: false };
  }
}

// Main test runner
async function runTests() {
  console.log('🏠 Property Search Test Suite');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Tests: ${testCases.length}`);
  console.log('='.repeat(60));
  
  const results = [];
  
  for (const testCase of testCases) {
    const result = await testSearch(testCase.query, testCase.type);
    results.push({ ...result, expect: testCase.expect });
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`Total: ${results.length}`);
  console.log(`Passed: ${passed.length} ✅`);
  console.log(`Failed: ${failed.length} ❌`);
  console.log(`Success Rate: ${((passed.length / results.length) * 100).toFixed(1)}%`);
  
  if (failed.length > 0) {
    console.log('\n❌ Failed Queries:');
    failed.forEach(r => console.log(`   - "${r.query}" (${r.type})`));
  }
  
  // Results by type
  console.log('\n📈 Results by Query Type:');
  const byType = {};
  results.forEach(r => {
    if (!byType[r.type]) byType[r.type] = { total: 0, passed: 0 };
    byType[r.type].total++;
    if (r.success) byType[r.type].passed++;
  });
  
  Object.entries(byType).forEach(([type, stats]) => {
    const rate = ((stats.passed / stats.total) * 100).toFixed(0);
    console.log(`   ${type}: ${stats.passed}/${stats.total} (${rate}%)`);
  });
  
  return results;
}

// Run tests
runTests().then(results => {
  console.log('\n✅ Test run complete');
  process.exit(0);
}).catch(err => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});

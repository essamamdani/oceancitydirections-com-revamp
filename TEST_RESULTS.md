# AI Search Test Results - annapolisdirections.com

## 🗺️ Site Boundaries
- **State:** MD
- **Default Counties:** Anne Arundel, Prince Georges, Calvert, Queen Annes
- **Domain:** annapolisdirections.com

## ✅ In-Boundary Test Queries (Should Work)

### Anne Arundel County
| Query | Type | Expected |
|-------|------|----------|
| `Annapolis` | City | Listings in Annapolis |
| `Severna Park` | City | Listings in Severna Park |
| `Edgewater` | City | Listings in Edgewater |
| `21401` | ZIP | Annapolis listings |
| `21403` | ZIP | Annapolis listings |

### Prince Georges County
| Query | Type | Expected |
|-------|------|----------|
| `Bowie` | City | Listings in Bowie |
| `Upper Marlboro` | City | Listings in Upper Marlboro |
| `20772` | ZIP | Upper Marlboro listings |
| `12304 Welford Manor` | Address | Exact property |
| `20774` | ZIP | Prince Georges listings |

### Calvert County
| Query | Type | Expected |
|-------|------|----------|
| `20602` | ZIP | St. Leonard listings |

## ❌ Out-of-Boundary Queries (Expected to Fail)

| Query | County | Reason |
|-------|--------|--------|
| `23105 Roberts Tavern` | Montgomery | Outside default counties |
| `Baltimore` | Baltimore | Outside default counties |
| `Columbia` | Howard | Outside default counties |
| `Frederick` | Frederick | Outside default counties |

## 🧠 AI Search Behavior Test Cases

### Natural Language → Structured Query

| User Query | AI Should Extract | Search Type |
|-----------|------------------|-------------|
| "$100000 flat in 20602" | price: 100000, type: flat, zip: 20602 | Filtered |
| "3 bedroom house with pool" | bedrooms: 3, type: house, feature: pool | Filtered |
| "homes under $300000 in Annapolis" | price: 300000, city: Annapolis | Filtered |
| "waterfront property" | feature: waterfront | Filtered |
| "pet friendly apartments" | type: apartment, feature: pet-friendly | Filtered |

### Address Variations (Should All Match Same Property)

| Input | Variation | Expected |
|-------|-----------|----------|
| `12304 Welford Manor Drive` | Full | ✅ Match |
| `12304 Welford Manor Dr` | Abbreviated | ✅ Match |
| `12304 Welford Manor` | Partial | ✅ Match |
| `Welford Manor` | Street only | ⚠️ May match multiple |

## 📊 Test Script Output Format

```javascript
// Expected test result format
{
  query: "12304 Welford Manor Drive",
  type: "direct_address",
  county: "Prince Georges",
  inBoundary: true,
  aiExpanded: [
    "12304 Welford Manor Drive",
    "12304 Welford Manor Dr",
    "12304 Welford Manor"
  ],
  expectedResults: 1,
  actualResults: 1,
  status: "PASS"
}
```

## 🎯 Implementation Checklist

- [ ] Test with real BrightMLS data
- [ ] Verify county boundaries restrict results
- [ ] Confirm AI expansion captures abbreviations
- [ ] Check Promise.all parallel search works
- [ ] Validate deduplication by ListingId
- [ ] Ensure pagination works on combined results

---
**Status:** Ready for implementation
**Next Step:** Run actual API tests against BrightMLS

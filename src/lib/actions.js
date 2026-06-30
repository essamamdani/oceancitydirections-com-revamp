// Data fetching utilities - NOT Server Actions
// Use regular async functions for data fetching
import logger from '@/lib/logger'
import { getSourceDb } from '@/lib/source-db';
// import Redis from 'ioredis';
import { GoogleGenAI } from '@google/genai';
import { fetchCategories, fetchMLSStatus, supabase, baseUrl, env, decodeAndLowercase, toGeoJSONPoints, toGeoJSONPointsRealty, convertOrder, ITEMS_PER_PAGE, videohomes, ucwords, distanceMiles, transformRealtyCounty } from './helper';
import { supabaseAdmin } from '@/utils/supabase/admin';

const enhanceBusinessesWithClaimStatus = async (businesses) => {
    if (!businesses || businesses.length === 0) return businesses;
    try {
        const { query } = await import('@/lib/db');
        const businessIds = businesses.map(b => b.id).filter(Boolean);
        if (businessIds.length > 0) {
            const claimRes = await query(`
                SELECT business_id, claimer_user_id 
                FROM claim_businesses 
                WHERE business_id = ANY($1) AND status = 'approved'
            `, [businessIds]);
            
            const claimedMap = {};
            claimRes.rows.forEach(r => claimedMap[r.business_id] = r.claimer_user_id);
            
            businesses.forEach(b => {
                if (claimedMap[b.id]) {
                    b.is_claimed = true;
                    b.claimed_approval = true;
                    b.claimed_by = claimedMap[b.id];
                } else {
                    b.is_claimed = false;
                    b.claimed_approval = false;
                    b.claimed_by = null;
                }
            });
        }
    } catch (dbErr) {
        console.error('Error fetching auth db claim status for businesses list:', dbErr);
    }
    return businesses;
};

// ─── Gemini AI Helper ──────────────────────────────────────────────────────
const getGeminiClient = () => new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

// Timeout wrapper for AI calls
async function withTimeout(promise, ms = 3000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('AI timeout')), ms))
  ]);
}

// ─── Helper: Build Location Filter ─────────────────────────────────────────
function buildLocationFilter(site, county, city, zip, defaultShortState) {
    let locationFilter = '';
    if (county || city || zip) {
        if (county) locationFilter += `County eq '${transformRealtyCounty(county)}-${defaultShortState}'`
        if (city) locationFilter += ` and City eq '${city}'`
        if (zip) locationFilter += ` and PostalCode eq '${zip}'`
    } else {
        const counties = site.DefaultCounties;
        const countyList = counties.map(e => `'${transformRealtyCounty(e)}-${defaultShortState}'`).join(', ');
        locationFilter += `County in (${countyList})`;
    }
    return locationFilter;
}

// ─── Helper: Extract street-only portion with Gemini ─────────────────────────
async function extractStreetPartWithAI(query) {
  const ai = getGeminiClient();
  const prompt = `Extract ONLY the street address portion from this real estate search query. Return JUST the house number + street name + street type + directional suffix if part of street. Strip city, state, ZIP code, country. Return ONLY the address string, no explanation, no quotes.

Examples:
"304 3rd Ave SE Glen Burnie, MD 21061" → 304 3rd Ave SE
"123 Main Street Baltimore MD 21201" → 123 Main Street
"456 Ocean City Blvd, Ocean City, MD 21842" → 456 Ocean City Blvd
"789 N Charles Street, Baltimore, Maryland 21201" → 789 N Charles Street

Input: "${query}"
Output:`;
  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });
  return (response.text || '').trim().replace(/^["']|["']$/g, '').trim();
}

// Regex fallback: grab house# + street name + type + optional direction suffix
function extractStreetPartRegex(query) {
  const beforeComma = query.includes(',') ? query.split(',')[0].trim() : query;
  const m = beforeComma.match(
    /^(\d+\s+(?:\S+\s+)*?(?:avenue|ave|street|st|drive|dr|road|rd|lane|ln|court|ct|place|pl|circle|cir|terrace|ter|highway|hwy|parkway|pkwy|boulevard|blvd|way)\b(?:\s+(?:northeast|northwest|southeast|southwest|ne|nw|se|sw|north|south|east|west|n|s|e|w)\b)?)/i
  );
  return m ? m[1].trim() : beforeComma;
}

// ─── Helper: AI-Expanded Search ──────────────────────────────────────────────
async function performAIExpandedSearch(site, searchTerm, baseFilter, locationFilter, fetchCategory) {
    try {
        const expandedTerms = await withTimeout(expandSearchTermsWithAI(searchTerm), 3000);
        logger.log('[performAIExpandedSearch] Terms:', expandedTerms);
        
        // MLS rejects AND + OR in same filter — one query per term, deduplicate
        const locationPart = locationFilter ? ` and ${locationFilter}` : '';
        const cappedTerms = expandedTerms.slice(0, 2);
        const results = await Promise.all(
            cappedTerms.map(term => {
                const url = `BrightProperties?$format=json&$top=100&$count=true&$filter=${baseFilter}PropertyType eq '${fetchCategory}'${locationPart} and contains(FullStreetAddress, '${term.toUpperCase()}')`;
                return fetchMLS(site, url).catch(() => ({ value: [] }));
            })
        );
        const seen = new Set();
        const merged = [];
        for (const r of results) {
            for (const p of (r.value || [])) {
                if (!seen.has(p.ListingKey)) { seen.add(p.ListingKey); merged.push(p); }
            }
        }
        logger.log('[performAIExpandedSearch] Found:', merged.length);
        return { value: merged, '@odata.count': merged.length };
    } catch (err) {
        console.error('[performAIExpandedSearch] Error:', err.message || err);
        return { value: [], '@odata.count': 0 };
    }
}

// ─── Helper: Direct Search with Variants ────────────────────────────────────
async function performDirectSearch(site, searchTerm, baseFilter, locationFilter, fetchCategory) {
    try {
        // Check if searchTerm looks like a ListingId (e.g., MDAA2140244)
        const trimmedTerm = searchTerm.trim();
        const looksLikeListingId = /^[A-Z]{2,}[A-Z0-9]+$/i.test(trimmedTerm);
        if (looksLikeListingId) {
            logger.log('[performDirectSearch] Trying ListingId search:', trimmedTerm);
            const locationPart = locationFilter ? ` and ${locationFilter}` : '';
            const url = `BrightProperties?$format=json&$top=100&$count=true&$filter=${baseFilter}PropertyType eq '${fetchCategory}'${locationPart} and ListingId eq '${trimmedTerm}'`;
            const result = await fetchMLS(site, url).catch(() => ({ value: [] }));
            if (result?.value?.length > 0) {
                logger.log('[performDirectSearch] ListingId found:', result.value.length);
                return { value: result.value, '@odata.count': result.value.length };
            }
        }
        
        const variants = new Set([searchTerm, ucwords(searchTerm)]);

        const mlsAbbreviations = [
            [/\bDrive\b/gi, 'Dr'], [/\bDr\b/gi, 'Drive'],
            [/\bStreet\b/gi, 'St'], [/\bSt\b/gi, 'Street'],
            [/\bAvenue\b/gi, 'Ave'], [/\bAve\b/gi, 'Avenue'],
            [/\bBoulevard\b/gi, 'Blvd'], [/\bBlvd\b/gi, 'Boulevard'],
            [/\bRoad\b/gi, 'Rd'], [/\bRd\b/gi, 'Road'],
            [/\bLane\b/gi, 'Ln'], [/\bLn\b/gi, 'Lane'],
            [/\bCourt\b/gi, 'Ct'], [/\bCt\b/gi, 'Court'],
            [/\bPlace\b/gi, 'Pl'], [/\bPl\b/gi, 'Place'],
            [/\bCircle\b/gi, 'Cir'], [/\bCir\b/gi, 'Circle'],
            [/\bTerrace\b/gi, 'Ter'], [/\bTer\b/gi, 'Terrace'],
            [/\bHighway\b/gi, 'Hwy'], [/\bHwy\b/gi, 'Highway'],
            [/\bParkway\b/gi, 'Pkwy'], [/\bPkwy\b/gi, 'Parkway'],
            [/\bNorth\b/gi, 'N'], [/\bSouth\b/gi, 'S'],
            [/\bEast\b/gi, 'E'], [/\bWest\b/gi, 'W'],
        ];

        for (const [pattern, replacement] of mlsAbbreviations) {
            const variant = searchTerm.replace(pattern, replacement);
            if (variant !== searchTerm) {
                variants.add(variant);
                variants.add(ucwords(variant));
            }
        }

        // MLS does not allow AND + OR in the same filter ("2 OR levels" error).
        // Solution: one query per variant (each is a simple AND), then deduplicate.
        const locationPart = locationFilter ? ` and ${locationFilter}` : '';
        const allVariants = Array.from(variants).slice(0, 2);
        const results = await Promise.all(
            allVariants.map(term => {
                const url = `BrightProperties?$format=json&$top=100&$count=true&$filter=${baseFilter}PropertyType eq '${fetchCategory}'${locationPart} and contains(FullStreetAddress, '${term.toUpperCase()}')`;
                return fetchMLS(site, url).catch(() => ({ value: [] }));
            })
        );

        const seen = new Set();
        const merged = [];
        for (const r of results) {
            for (const p of (r.value || [])) {
                if (!seen.has(p.ListingKey)) { seen.add(p.ListingKey); merged.push(p); }
            }
        }

        logger.log('[performDirectSearch] Found:', merged.length);
        return { value: merged, '@odata.count': merged.length };
    } catch (err) {
        console.error('[performDirectSearch] Error:', err);
        return { value: [], '@odata.count': 0 };
    }
}

async function expandSearchTermsWithAI(searchTerm) {
  try {
    const ai = getGeminiClient();
    const model = 'gemini-3.5-flash';
    
    const prompt = `You are a real estate address normalization expert. Given a search query, generate ALL possible variations of the address that someone might use or that might appear in a database.

Rules:
1. Expand ALL abbreviations (St → Street, Dr → Drive, Ave → Avenue, Rd → Road, Ln → Lane, Ct → Court, Pl → Place, Cir → Circle, Ter → Terrace, Hwy → Highway, Pkwy → Parkway, Blvd → Boulevard, N → North, S → South, E → East, W → West, NE → Northeast, NW → Northwest, SE → Southeast, SW → Southwest, Apt → Apartment, Ste → Suite, Fl → Floor, Bldg → Building, etc.)
2. Also provide the abbreviated forms (Street → St, Drive → Dr, etc.)
3. Include title case and lowercase variations
4. If the query contains a city/state, also provide versions without city/state
5. Return ONLY a JSON array of strings, no explanations
6. Each variation should be a complete address string

Examples:
Input: "12304 Welford Manor Drive"
Output: ["12304 Welford Manor Drive", "12304 Welford Manor Dr", "12304 Welford Manor drive", "12304 Welford manor drive"]

Input: "123 Main St, Baltimore, MD"
Output: ["123 Main St", "123 Main Street", "123 main street", "123 Main st"]

Input: "${searchTerm}"
Output:`;

    const response = await withTimeout(
      ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      }),
      3000 // 3 second timeout
    );
    
    const text = response.text || '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return [...new Set(parsed)];
      }
    }
    return [searchTerm];
  } catch (err) {
    console.error('[expandSearchTermsWithAI] Error:', err);
    return [searchTerm];
  }
}

export const getSubcategoriesByIDs = async (subcategoriesIds) => {
    try {
        if (!subcategoriesIds || subcategoriesIds.length === 0) {
            return [];
        }

        const { data, error } = await (await (await import('@/utils/supabase/admin')).getSupabaseAdmin()).from('subcategories')
            .select('*')
            .in('id', subcategoriesIds);

        if (error) throw error;

        logger.log('getSubcategoriesByIDs Query Executed at:', new Date().toISOString());
        return data;
    } catch (err) {
        console.error('Error fetching subcategories by IDs:', err);
        return [];
    }
};

export const getBusiness = async (site, slug) => {
    const defaultState = [site.State.toLowerCase(),site.ShortState].map((state) => `state_lower.eq.${state.toLowerCase()}`).join(',')
    const defaultCounties = site.DefaultCounties
    const countyFilters = defaultCounties?.map((county) => `county_lower.eq.${county.toLowerCase()}`).join(',');
    
    const baseFilter = (query) =>
        query
            .or(defaultState)
            // .or(countyFilters)
            .eq('status', true)
            .limit(1)
            .maybeSingle();

    // Normalize the slug once
    const normalizedSlug = slug.toLowerCase();
    // Try both fields in one query using OR
    const adminClient = await (await import('@/utils/supabase/admin')).getSupabaseAdmin();
    let { data, error } = await baseFilter(
        adminClient
            .from('businesses')
            .select(`*, categories(*), update_slug`)
            .or(`update_slug.eq.${normalizedSlug},slug.eq.${normalizedSlug}`)
            .is('deleted_at', null)
    );
    
    if (error) {
        const fallback = await baseFilter(
            adminClient
                .from('businesses')
                .select(`*, categories(*), update_slug`)
                .or(`update_slug.eq.${normalizedSlug},slug.eq.${normalizedSlug}`)
        );
        data = fallback.data;
        error = fallback.error;
    }

    if (error || !data) {
        return null;
    }

    // Enhance business object with Auth DB claim status
    try {
        const { query } = await import('@/lib/db');
        const claimRes = await query(`
            SELECT claimer_user_id 
            FROM claim_businesses 
            WHERE business_id = $1 AND status = 'approved'
            LIMIT 1
        `, [data.id]);

        if (claimRes.rows.length > 0) {
            data.is_claimed = true;
            data.claimed_approval = true;
            data.claimed_by = claimRes.rows[0].claimer_user_id;
        } else {
            data.is_claimed = false;
            data.claimed_approval = false;
            data.claimed_by = null;
        }
    } catch (dbErr) {
        console.error('Error fetching auth db claim status for business:', dbErr);
    }

    return data;
};

export const getVerifiedBusinesses = async (site, limit = 100) => {
    try {
        const { query } = await import('@/lib/db');
        const claimRes = await query(`
            SELECT business_id 
            FROM claim_businesses 
            WHERE status = 'approved'
        `);
        const approvedIds = claimRes.rows.map(r => r.business_id).filter(Boolean);
        
        const adminClient = await (await import('@/utils/supabase/admin')).getSupabaseAdmin();

        // --- Attempt 1: Claimed businesses with CDN images ---
        if (approvedIds.length > 0) {
            let q = adminClient
                .from('businesses')
                .select('*, categories(name)')
                .eq('state_lower', site.StateLowerCase)
                .in('county_lower', site.DefaultCounties)
                .in('id', approvedIds);

            const { data: claimedData, error: claimedErr } = await q.limit(limit);

            if (!claimedErr && claimedData) {
                // Filter to CDN images only first
                const cdnOnly = claimedData.filter(b =>
                    b.main_image && (
                        b.main_image.startsWith('https://cdn.') ||
                        b.main_image.startsWith('https://cdnlogos.') ||
                        b.main_image.includes('cdn.')
                    )
                );

                if (cdnOnly.length > 0) {
                    const formatted = cdnOnly.map(item => ({
                        ...item,
                        categories: item.categories ? (Array.isArray(item.categories) ? item.categories.map(c => c.name) : [item.categories.name]) : [],
                        is_claimed: true,
                        claimed_approval: true,
                    }));
                    logger.log('getVerifiedBusinesses → CDN claimed results:', formatted.length);
                    return formatted;
                }

                // CDN filter returned nothing — return all claimed businesses with any image
                const anyImg = claimedData.filter(b => b.main_image);
                if (anyImg.length > 0) {
                    const formatted = anyImg.map(item => ({
                        ...item,
                        categories: item.categories ? (Array.isArray(item.categories) ? item.categories.map(c => c.name) : [item.categories.name]) : [],
                        is_claimed: true,
                        claimed_approval: true,
                    }));
                    logger.log('getVerifiedBusinesses → Claimed (no CDN filter) results:', formatted.length);
                    return formatted;
                }
            }
        }

        // --- Fallback: Top businesses in the area with any main_image ---
        const { data: fallbackData, error: fallbackErr } = await adminClient
            .from('businesses')
            .select('*, categories(name)')
            .eq('state_lower', site.StateLowerCase)
            .in('county_lower', site.DefaultCounties)
            .not('main_image', 'is', null)
            .neq('main_image', '')
            .order('id', { ascending: false })
            .limit(limit);

        if (fallbackErr) throw fallbackErr;

        const formatted = (fallbackData || []).map(item => ({
            ...item,
            categories: item.categories ? (Array.isArray(item.categories) ? item.categories.map(c => c.name) : [item.categories.name]) : [],
            is_claimed: false,
            claimed_approval: false,
        }));

        logger.log('getVerifiedBusinesses → Area fallback results:', formatted.length);
        logger.log('getVerifiedBusinesses Executed at:', new Date().toISOString());
        return formatted;
    } catch (err) {
        console.error('Error fetching verified businesses:', err);
        return [];
    }
};

export const getRecentClaimedBusinesses = async (site, limit = 3) => {
    try {
        const { query } = await import('@/lib/db');
        const claimRes = await query(`
            SELECT business_id 
            FROM claim_businesses 
            WHERE status = 'approved'
            ORDER BY id DESC
            LIMIT $1
        `, [limit]);
        const approvedIds = claimRes.rows.map(r => r.business_id).filter(Boolean);
        
        const adminClient = await (await import('@/utils/supabase/admin')).getSupabaseAdmin();

        let claimedBusinesses = [];
        if (approvedIds.length > 0) {
            const { data, error } = await adminClient
                .from('businesses')
                .select('*, categories(name)')
                .eq('state_lower', site.StateLowerCase)
                .in('county_lower', site.DefaultCounties)
                .in('id', approvedIds);

            if (!error && data) {
                claimedBusinesses = data.map(item => ({
                    ...item,
                    categories: item.categories ? (Array.isArray(item.categories) ? item.categories.map(c => c.name) : [item.categories.name]) : [],
                    is_claimed: true,
                    claimed_approval: true,
                })).sort((a, b) => approvedIds.indexOf(a.id) - approvedIds.indexOf(b.id));
            }
        }

        if (claimedBusinesses.length < limit) {
            const needed = limit - claimedBusinesses.length;
            const existingIds = claimedBusinesses.map(b => b.id);
            
            let builder = adminClient
                .from('businesses')
                .select('*, categories(name)')
                .eq('state_lower', site.StateLowerCase)
                .in('county_lower', site.DefaultCounties)
                .not('main_image', 'is', null)
                .neq('main_image', '');

            if (existingIds.length > 0) {
                builder = builder.not('id', 'in', `(${existingIds.join(',')})`);
            }

            const { data: fallbackData, error: fallbackErr } = await builder
                .order('id', { ascending: false })
                .limit(needed);

            if (!fallbackErr && fallbackData) {
                const formattedFallback = fallbackData.map(item => ({
                    ...item,
                    categories: item.categories ? (Array.isArray(item.categories) ? item.categories.map(c => c.name) : [item.categories.name]) : [],
                    is_claimed: false,
                    claimed_approval: false,
                }));
                claimedBusinesses = [...claimedBusinesses, ...formattedFallback];
            }
        }

        logger.log('getRecentClaimedBusinesses → count:', claimedBusinesses.length);
        return claimedBusinesses.slice(0, limit);
    } catch (err) {
        console.error('Error in getRecentClaimedBusinesses:', err);
        return [];
    }
};

export const getBestRatedBusiness = async (site, cat_name = false, rating_value = "4.8") => {
    try {
        const adminClient = await (await import('@/utils/supabase/admin')).getSupabaseAdmin();
        
        let selectQuery = '*';
        if (cat_name) {
            selectQuery = '*, categories!inner(name)';
        } else {
            selectQuery = '*, categories(name)';
        }
        
        let query = adminClient
            .from('businesses')
            .select(selectQuery)
            .eq('state_lower', site.StateLowerCase)
            .gte('rating_value', rating_value)
            .in('county_lower', site.DefaultCounties)
            .order('rating_value', { ascending: false });

        if (cat_name) {
            query = query.ilike('categories.name', `%${cat_name}%`);
        }
        
        const { data, error } = await query.limit(6);

        if (error) throw error;
        
        // Transform categories object into array of strings to match expected API response
        let formattedData = data.map(item => ({
             ...item,
             categories: item.categories ? (Array.isArray(item.categories) ? item.categories.map(c => c.name) : [item.categories.name]) : []
        }));

        formattedData = await enhanceBusinessesWithClaimStatus(formattedData);

        logger.log('getBestRatedBusiness (QueryBuilder) Executed at:', new Date().toISOString());
        return formattedData;
    } catch (err) {
        console.error('Error fetching best-rated businesses:', err);
        return [];
    }
};

export const getBusinessesNew = async (site, filters) =>
    safeAsync(async () => {
        let {
            county,
            city,
            zip,
            category,
            subcategory,
            page: currentPage = 1,
            q,
            ask,
            lat,
            long,
        } = filters;

        // If a question/query is provided, delegate to getAnswer
        if (q || ask) {
            return getAnswer(site, { ask, q, lat, long, currentPage });
        }

        // Prepare params for RPC calls
        const defaultState = site.StateLowerCase;
        const defaultCounties = site.DefaultCounties;

        const params = {
            p_state: defaultState,
            p_county: county ? [decodeAndLowercase(county)] : defaultCounties,
            p_category_name: category ? decodeURIComponent(category) : null,
            p_subcategory_name: subcategory ? decodeURIComponent(subcategory) : null,
            p_city: city ? decodeAndLowercase(city) : null,
            p_zip: zip || null,
        };

        const host = site.domain || site.URL.replace("https://www.", "");

        // Fetch featured videos and database queries concurrently


        const adminClient = await (await import('@/utils/supabase/admin')).getSupabaseAdmin();
        const businessesPromise = adminClient.rpc("get_businesses_extra", {
            ...params,
            p_page: currentPage,
            p_limit: ITEMS_PER_PAGE // We'll adjust after fetching featured videos
        });
        logger.log({
            ...params,
            p_page: currentPage,
            p_limit: ITEMS_PER_PAGE // We'll adjust after fetching featured videos
        });
        const countPromise = adminClient.rpc("count_businesses_extra", params);

        // Run all promises in parallel
        const [featured_videos, businessResponse, countResponse] = await Promise.all([
            videohomes(host, true, "business"),
            businessesPromise,
            countPromise,
        ]);

        // Adjust the limit if featured videos exist
        const businessData = businessResponse.data || [];
        const limitAdjustment = featured_videos.length > 0 ? ITEMS_PER_PAGE - featured_videos.length : ITEMS_PER_PAGE;

        // Re-fetch businesses if limit was adjusted
        let businesses = businessData;
        if (businessData.length !== limitAdjustment) {
            const adminClient = await (await import('@/utils/supabase/admin')).getSupabaseAdmin();
            const adjustedBusinessResponse = await adminClient.rpc("get_businesses_extra", {
                ...params,
                p_page: currentPage,
                p_limit: limitAdjustment
            });
            businesses = adjustedBusinessResponse.data || [];
        }

        businesses = await enhanceBusinessesWithClaimStatus(businesses);

        // Sort: claimed businesses first
        businesses.sort((a, b) => (b.claimed_approval ? 1 : 0) - (a.claimed_approval ? 1 : 0));

        const totalRecords = countResponse.data || 50;

        return {
            totalRecords,
            businesses,
            geoJson: toGeoJSONPoints(businesses),
            featured_videos: featured_videos || [],
        };
    }, { businesses: [], totalRecords: 0 });


export const getLocationNew = async (site, props = {}) => {
    try {
        const { county = null, city = null, zip = null, categoryPage = null, category = null, subcategory = null, minimum = 5 } = props;
        const defaultState = site.StateLowerCase;
        const defaultCounties = site.DefaultCounties
        // DisplayCounties = canonical names only (no "County" suffix variants) — prevents duplicate sidebar entries
        const displayCounties = (site.DisplayCounties && site.DisplayCounties.length > 0) ? site.DisplayCounties : defaultCounties;
        let function_name, parameters;
        if (!county && (!category || categoryPage)) {
            function_name = 'get_total_records_by_county';
            parameters = {
                p_state: defaultState,
                p_county: displayCounties
            }
        } else {
            function_name = 'get_businesses_extra_type';
            parameters = {
                p_state: defaultState,
                p_county: county ? [decodeAndLowercase(county)] : defaultCounties,
                p_type: 'location',
                p_category_name: category ? decodeAndLowercase(category) : null,
                p_subcategory_name: subcategory ? decodeAndLowercase(subcategory) : null,
                p_city: city ? decodeAndLowercase(city) : null,
                p_zip: zip || null,
                p_minimum: minimum
            }
        }

        const adminClient = await (await import('@/utils/supabase/admin')).getSupabaseAdmin();
        logger.log('[getLocationNew] Calling RPC:', function_name, 'with params:', JSON.stringify(parameters));
        const { data, error } = await adminClient.rpc(function_name, parameters);
        
        if (error) {
            console.error("Error fetching locations:", error);
            return [];
        }
        logger.log('[getLocationNew] Results:', data?.length || 0);
        return data || [];
    } catch (err) {
        console.error("Error in getLocationNew:", err);
        return [];
    }
};

export const getCategoriesNew = async (site, props = {}) => {
    try {
        const { county = null, city = null, zip = null, category = null, subcategory = null, minimum = 5 } = props;
        const defaultState = site.StateLowerCase
        const defaultCounties = site.DefaultCounties
        
        const adminClient = await (await import('@/utils/supabase/admin')).getSupabaseAdmin();
        const { data, error } = await adminClient.rpc('get_businesses_extra_type', {
            p_state: defaultState,
            p_county: county ? [decodeAndLowercase(county)] : defaultCounties,
            p_type: 'category',
            p_category_name: category ? decodeAndLowercase(category) : null,
            p_subcategory_name: subcategory ? decodeAndLowercase(subcategory) : null,
            p_city: city ? decodeAndLowercase(city) : null,
            p_zip: zip || null,
            p_minimum: minimum
        });
        
        if (error) {
            console.error("Error fetching categories:", error);
            return [];
        }
        return data || [];
    } catch (err) {
        console.error("Error in getCategoriesNew:", err);
        return [];
    }
};


export const homePageListing = async (site) => {
    const defaultShortState = site.ShortState.toLowerCase();
    const counties = site.DefaultCounties;
    const countyList = counties.map(e => `'${transformRealtyCounty(e)}-${defaultShortState}'`).join(', '); // Ensures each county name is wrapped in single quotes
    const select = 'ListingKey,UnparsedAddress,ListingId,ModificationTimestamp,ListPictureURL,ListPrice,FullStreetAddress,City,StateOrProvince,PostalCode,County,BedroomsTotal,BathroomsFull,BathroomsHalf,AreaTotal,ListOfficeName';
    let url = `BrightProperties?$format=json&$top=6&$select=${select}&$filter=StateOrProvince eq '${defaultShortState}' and PropertyType eq 'Residential' and MlsStatus in (${fetchMLSStatus['default']}) and DaysOnMarket le 90 and ListPrice ge 400000 and County in (${countyList})&$orderby=${convertOrder('')}`;
    return await fetchMLS(site, url);

}

export const getNearbyProperties = async (site, { lat, long, price, listingId }) => {
    if (!lat || !long) return [];

    const defaultShortState = site.ShortState.toLowerCase();

    const select =
        "ListingKey,UnparsedAddress,ListingId,ModificationTimestamp,ListPictureURL,ListPrice,FullStreetAddress,City,StateOrProvince,PostalCode,County,BedroomsTotal,BathroomsFull,BathroomsHalf,AreaTotal,ListOfficeName,Latitude,Longitude,MlsStatus,PropertyType";

    // ---------- 1. DYNAMIC BOUNDING BOX ----------
    const RADIUS_KM = 5; // Increased from 0.5km to 5km for more nearby properties
    const latDelta = RADIUS_KM / 111;
    const lngDelta = RADIUS_KM / (111 * Math.cos((lat * Math.PI) / 180));

    const minLat = lat - latDelta;
    const maxLat = lat + latDelta;
    const minLng = long - lngDelta;
    const maxLng = long + lngDelta;

    // ---------- 2. PRICE FILTER ----------
    // Show properties within ±30% price range instead of only higher priced
    const priceFilter = price ? `and ListPrice ge ${Math.floor(price * 0.7)} and ListPrice le ${Math.ceil(price * 1.3)}` : "";

    // ---------- 3. BRIGHT MLS QUERY ----------
    const url = `BrightProperties?$format=json&$top=50&$select=${select}&$orderby=${convertOrder('')}&$filter=
      StateOrProvince eq '${defaultShortState}' and
      PropertyType eq 'Residential' and
      MlsStatus in (${fetchMLSStatus["default"]}) and
      ListingId ne '${listingId}' and
      Latitude ge ${minLat} and Latitude le ${maxLat} and
      Longitude ge ${minLng} and Longitude le ${maxLng}
      ${priceFilter}
  `.replace(/\s+/g, " ");

    //   logger.log({ url });

    const response = await fetchMLS(site, url);
    let listings = response?.value || [];

    if (listings.length === 0) return [];

    // ---------- 4. ADD DISTANCE + PRICE DIFF ----------
    listings = listings.map((item) => {
        const dist = getDistanceFromLatLonInKm(lat, long, item.Latitude, item.Longitude);
        const priceDiff = Math.abs((item.ListPrice || 0) - (price || 0));

        return { ...item, dist, priceDiff };
    });

    // ---------- 5. SORT BY DISTANCE ----------
    listings.sort((a, b) => a.dist - b.dist);

    // Get 10 closest
    const nearest = listings.slice(0, 10);

    // ---------- 6. SORT THOSE BY PRICE DIFFERENCE ----------
    nearest.sort((a, b) => a.priceDiff - b.priceDiff);

    // Return top 3
    return nearest.slice(0, 3);
};

export const getNearbyRestaurants = async (site, { lat, long }) => {
    if (!lat || !long) return [];

    const RADIUS_KM = 16; // Approx 10 miles
    const latDelta = RADIUS_KM / 111;
    const lngDelta = RADIUS_KM / (111 * Math.cos((lat * Math.PI) / 180));

    const minLat = lat - latDelta;
    const maxLat = lat + latDelta;
    const minLng = long - lngDelta;
    const maxLng = long + lngDelta;

    const { data: businesses, error } = await (await (await import('@/utils/supabase/admin')).getSupabaseAdmin()).from('businesses')
        .select('*, categories!inner(name)')
        .eq('state_lower', site.StateLowerCase)
        .eq('status', true)
        .gte('latitude', minLat)
        .lte('latitude', maxLat)
        .gte('longitude', minLng)
        .lte('longitude', maxLng)
        .ilike('categories.name', '%restaurant%')
        .limit(20);

    if (error) {
        console.error("Error fetching nearby restaurants:", error);
        return { businesses: [] };
    }

    // Sort by distance
    const businessesWithDist = businesses.map(b => ({
        ...b,
        dist: getDistanceFromLatLonInKm(lat, long, b.latitude, b.longitude)
    }));
    
    businessesWithDist.sort((a, b) => a.dist - b.dist);

    return {
        businesses: businessesWithDist,
        totalRecords: businessesWithDist.length,
        geoJson: toGeoJSONPoints(businessesWithDist)
    };
};

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}



export const fetchListing4Sitemap = async (site) => {
    const defaultShortState = site.ShortState.toLowerCase();
    const counties = site.DefaultCounties;
    const countyList = counties.map(e => `'${transformRealtyCounty(e)}-${defaultShortState}'`).join(', '); // Ensures each county name is wrapped in single quotes
    const select = 'ListingKey,UnparsedAddress,ListingId,ModificationTimestamp,FullStreetAddress,City,StateOrProvince,PostalCode,County';
    let url = `BrightProperties?$format=json&$top=10000&$select=${select}&$filter=StateOrProvince eq '${defaultShortState}' and MlsStatus in (${fetchMLSStatus['default']}) and DaysOnMarket le 180 and County in (${countyList})`;
    const result = await fetchMLS(site, url);
    return result?.value || [];
}

export const fetchListing4Related = async (site, { city, zip }) => {

    if (!site.IncludeRealty) {
        return []
    }
    const defaultShortState = site.ShortState.toLowerCase();
    const counties = site.DefaultCounties;
    const countyList = counties.map(e => `'${transformRealtyCounty(e)}-${defaultShortState}'`).join(', '); // Ensures each county name is wrapped in single quotes
    const select = 'ListingId,ListingKey,UnparsedAddress,ListPictureURL,ListPrice,FullStreetAddress,City,StateOrProvince,PostalCode,County,BedroomsTotal,BathroomsFull,BathroomsHalf,AreaTotal,ListOfficeName';
    let url = `BrightProperties?$format=json&$top=3&$select=${select}&$filter=StateOrProvince eq '${defaultShortState}' and PropertyType eq 'Residential' and County in (${countyList}) and PostalCode eq '${zip}' and City eq '${city}' and MlsStatus in (${fetchMLSStatus['default']}) and DaysOnMarket le 3&$orderby=${convertOrder('price_desc')}`;
    const result = await fetchMLS(site, url);
    return result?.value || [];
}
export const getListingLinks = async () => {

    const adminClient = await (await import('@/utils/supabase/admin')).getSupabaseAdmin();
    const { data, error } = await adminClient.from('search_cache')
        .select('question,slug')
        .eq('site_slug', process.env.NEXT_PUBLIC_SLUG)
        .eq('type', 'realty')
        .is('listing_pages', true)
    logger.log('getListingLinks Query Executed at:', new Date().toISOString());
    if (error) {
        console.error('Error fetching listing links:', error);
        return [];
    }
    return data;
}
export const getRealtyObjectFromDB = async (slug) => {
    // logger.log('Supabase Query Executed at:', new Date().toISOString());
    const { getSupabaseAdmin } = await import('@/utils/supabase/admin')
    const supabase = await getSupabaseAdmin()
    const { data, error } = await supabase
        .from('search_cache')
        .select('extract_object,question')
        .ilike('slug', slug)
        .eq('site_slug', process.env.NEXT_PUBLIC_SLUG)
        .eq('type', 'realty')
        .is('listing_pages', true)
        .single();
    logger.log('getRealtyObjectFromDB Query Executed at:', new Date().toISOString());
    if (error) {
        console.error('Error fetching realty object:', error);
        return null
    }
    return data;
}
export const fetchListings = async (site, filters) => {

    let { county, city, zip, category = 'sale', status = 'default', page: currentPage = 1, orderBy, ask, q, lat, long, default_object = false } = filters;
    const defaultShortState = site.ShortState
    const host = site.domain || site.URL.replace("https://www.", "");
    const featured_videos = await videohomes(host, true, 'property') || [];
    const limitAdjustment = featured_videos.length > 0 ? ITEMS_PER_PAGE - featured_videos.length : ITEMS_PER_PAGE;
    const skip = (currentPage - 1) * limitAdjustment;

    let MlsStatus = fetchMLSStatus[status];
    let baseFilter = `StateOrProvince eq '${defaultShortState}' and MlsStatus in (${MlsStatus}) and DaysOnMarket le 365 and `;
    let fetchCategory = fetchCategories[category];

    // Unified search term - support both ?ask= and ?q= identically
    const searchTerm = ask || q || '';
    logger.log('[fetchListings] searchTerm:', searchTerm, 'filters:', JSON.stringify({county, city, zip, category, status}));
    
    if (!searchTerm) {
        // No search - standard listing query
        let url = `BrightProperties?$format=json&$top=${limitAdjustment}&$skip=${skip}&$count=true&$filter=${baseFilter}`;
        url += `PropertyType eq '${fetchCategory}' and `
        if (county || city || zip) {
            if (county) url += `County eq '${transformRealtyCounty(county)}-${defaultShortState}'`
            if (city) url += ` and City eq '${city}'`
            if (zip) url += ` and PostalCode eq '${zip}'`
        } else {
            const counties = site.DefaultCounties;
            const countyList = counties.map(e => `'${transformRealtyCounty(e)}-${defaultShortState}'`).join(', ');
            url += `County in (${countyList})`;
        }
        url += `&$orderby=${convertOrder(orderBy)}`
        const result = await fetchMLS(site, url);
        return { ...result, geoJson: toGeoJSONPointsRealty(result.value), category, featured_videos };
    }

    // ─── Parallel Search Strategy ───────────────────────────────────────────
    const queryType = detectQueryType(searchTerm);
    logger.log('[fetchListings] Query type:', queryType.type, 'Features:', queryType.features);

    const locationFilter = buildLocationFilter(site, county, city, zip, defaultShortState);

    let combinedProperties = [];
    let totalCount = 0;

    if (queryType.type === 'listing_id') {
      // Exact match — skip county/status/DaysOnMarket to find any listing statewide
      const listingId = queryType.features.listingId;
      logger.log('[fetchListings] ListingId search:', listingId);
      const url = `BrightProperties?$format=json&$top=10&$count=true&$filter=StateOrProvince eq '${defaultShortState}' and ListingId eq '${listingId}'`;
      const result = await fetchMLS(site, url);
      combinedProperties = result?.value || [];
      totalCount = result?.['@odata.count'] || combinedProperties.length;
      logger.log('[fetchListings] ListingId found:', totalCount);

    } else if (queryType.type === 'natural_language') {
      // PARALLEL: regex NL parse + Gemini AI structured extract simultaneously
      const regexUrl = buildNLFilterURL(baseFilter, locationFilter, parseNaturalLanguageQuery(searchTerm), fetchCategory);
      const [regexResult, aiObject] = await Promise.all([
        fetchMLS(site, regexUrl).catch(() => ({ value: [] })),
        withTimeout(getAnswerRealtyObject({ ask: searchTerm, lat, long }), 6000).catch(() => null),
      ]);
      logger.log('[fetchListings] NL parallel — regex:', regexResult?.value?.length || 0, '| AI object:', JSON.stringify(aiObject));

      let aiResult = { value: [] };
      const aiUrl = buildAIObjectURL(baseFilter, locationFilter, aiObject, fetchCategory);
      if (aiUrl) aiResult = await fetchMLS(site, aiUrl).catch(() => ({ value: [] }));
      logger.log('[fetchListings] NL AI MLS found:', aiResult?.value?.length || 0);

      // Merge: regex first (predictable), then AI-unique results
      const seen = new Set();
      for (const p of [...(regexResult?.value || []), ...(aiResult?.value || [])]) {
        if (!seen.has(p.ListingKey)) { seen.add(p.ListingKey); combinedProperties.push(p); }
      }
      totalCount = combinedProperties.length;

    } else if (queryType.type === 'address') {
      // Step 1: extract just the street portion (strip city/state/zip) via Gemini
      let streetTerm = searchTerm;
      try {
        const aiStreet = await withTimeout(extractStreetPartWithAI(searchTerm), 5000);
        if (aiStreet && aiStreet.trim().length > 0) streetTerm = aiStreet.trim();
        else streetTerm = extractStreetPartRegex(searchTerm);
      } catch {
        streetTerm = extractStreetPartRegex(searchTerm);
      }
      logger.log('[fetchListings] Address — extracted street term:', streetTerm);

      // Step 2: search with extracted street + site county filter (keeps queries fast)
      // Include CLOSED so user can find any specific property
      const addressAllStatuses = `${MlsStatus},'CLOSED-BRIGHT'`;
      const addressBaseFilter = `StateOrProvince eq '${defaultShortState}' and MlsStatus in (${addressAllStatuses}) and `;

      const directResult = await performDirectSearch(site, streetTerm, addressBaseFilter, locationFilter, fetchCategory);
      logger.log('[fetchListings] Address — results:', directResult?.value?.length || 0);

      combinedProperties = directResult?.value || [];
      totalCount = combinedProperties.length;

    } else {
      // Mixed: PARALLEL direct + Gemini AI NL extraction
      logger.log('[fetchListings] Mixed — parallel direct + AI NL');
      const [directResult, aiObject] = await Promise.all([
        performDirectSearch(site, searchTerm, baseFilter, locationFilter, fetchCategory),
        withTimeout(getAnswerRealtyObject({ ask: searchTerm, lat, long }), 6000).catch(() => null),
      ]);
      logger.log('[fetchListings] Mixed parallel — direct:', directResult?.value?.length || 0, '| AI object:', JSON.stringify(aiObject));

      combinedProperties = directResult?.value || [];

      const aiUrl = buildAIObjectURL(baseFilter, locationFilter, aiObject, fetchCategory);
      if (aiUrl) {
        const aiResult = await fetchMLS(site, aiUrl).catch(() => ({ value: [] }));
        logger.log('[fetchListings] Mixed AI MLS found:', aiResult?.value?.length || 0);
        const seen = new Set(combinedProperties.map(p => p.ListingKey));
        for (const p of (aiResult?.value || [])) {
          if (!seen.has(p.ListingKey)) { seen.add(p.ListingKey); combinedProperties.push(p); }
        }
      }

      // Fallback: regex NL if still empty
      if (combinedProperties.length === 0) {
        const nlFilters = parseNaturalLanguageQuery(searchTerm);
        if (Object.keys(nlFilters).length > 0) {
          const nlResult = await fetchMLS(site, buildNLFilterURL(baseFilter, locationFilter, nlFilters, fetchCategory)).catch(() => ({ value: [] }));
          combinedProperties = nlResult?.value || [];
          logger.log('[fetchListings] Mixed NL fallback found:', combinedProperties.length);
        }
      }
      totalCount = combinedProperties.length;
    }

    // Paginate combined results
    const paginatedProperties = combinedProperties.slice(skip, skip + limitAdjustment);

    return {
      value: paginatedProperties,
      '@odata.count': totalCount,
      geoJson: toGeoJSONPointsRealty(paginatedProperties),
      category,
      featured_videos
    };
};

// ─── Helper: Detect Query Type ─────────────────────────────────────────────
function detectQueryType(query) {
  // ListingId pattern: e.g. MDAA2140244 — must start with 2+ letters, contain at least one digit, no spaces
  const hasListingId = !query.includes(' ') && /^[A-Z]{2,}[A-Z0-9]*\d[A-Z0-9]*$/i.test(query.trim());
  if (hasListingId) {
    return { type: 'listing_id', features: { listingId: query.trim() } };
  }

  // Price pattern: $100000, $100k, 1 million, 1.5m, 500k (with or without $)
  const hasPrice = /\$\d+/.test(query)
    || /\d+\s*(k|thousand)\b/i.test(query)
    || /\d+(\.\d+)?\s*million\b/i.test(query)
    || /\$?\d+(\.\d+)?\s*m\b/i.test(query);

  // ZIP pattern: 5 digits
  const hasZip = /\b\d{5}\b/.test(query);

  // Bedroom pattern: 3 bedroom, 2 bed
  const hasBedrooms = /\d+\s*(bed|bedroom|br)/i.test(query);

  // Property type: house, condo, apartment, flat
  const hasType = /\b(house|condo|apartment|flat|townhome|duplex)\b/i.test(query);

  // Location: "in/near/at city", or query contains a zip code
  const hasLocation = /\b(in|near|at)\s+[\w\d]+/.test(query) || hasZip;

  // If it has price, bedrooms, or property type → Natural Language
  if (hasPrice || hasBedrooms || hasType) {
    return { type: 'natural_language', features: { hasPrice, hasZip, hasBedrooms, hasType } };
  }

  // Street type word present → classify as address even if it has a ZIP
  const hasStreetType = /\b(avenue|ave|street|st|drive|dr|road|rd|lane|ln|court|ct|place|pl|circle|cir|terrace|ter|highway|hwy|parkway|pkwy|boulevard|blvd|way)\b/i.test(query);

  // If it starts with a house number and has a street type → Address (with or without ZIP)
  if (/^\d+/.test(query) && !hasType && (hasStreetType || !hasZip)) {
    return { type: 'address', features: { hasPrice, hasZip, hasBedrooms, hasType, hasStreetType } };
  }

  // Default: try both
  return { type: 'mixed', features: { hasPrice, hasZip, hasBedrooms, hasType } };
}

// ─── Helper: Parse Natural Language Query ──────────────────────────────────
function parseNaturalLanguageQuery(query) {
  const filters = {};
  
  // Extract price: $100000, $100k, under $200000, 1 million, 1.5m, 500k
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
  
  // Extract bedrooms: 3 bedroom, 2 bed
  const bedMatch = query.match(/(\d+)\s*(?:bed|bedroom|br)/i);
  if (bedMatch) {
    filters.bedrooms = parseInt(bedMatch[1]);
  }
  
  // Extract ZIP: 5 digits
  const zipMatch = query.match(/\b(\d{5})\b/);
  if (zipMatch) {
    filters.zip = zipMatch[1];
  }
  
  // Extract property type
  const typeMap = {
    'house': 'Residential',
    'condo': 'Residential',
    'apartment': 'Residential',
    'flat': 'Residential',
    'townhome': 'Residential',
    'duplex': 'Residential'
  };
  
  for (const [keyword, type] of Object.entries(typeMap)) {
    if (query.toLowerCase().includes(keyword)) {
      filters.propertyType = type;
      break;
    }
  }
  
  // Extract city (word after "in" or "near") — stop before digits, commas, or stop-words
  const cityMatch = query.match(/(?:in|near)\s+([a-zA-Z][a-zA-Z\s]*?)(?=\s*,|\s+\d|\s+(?:under|over|with|and|for|near|the)\b|$)/i);
  if (cityMatch) {
    filters.city = cityMatch[1].trim();
  }
  
  return filters;
}

// ─── Helper: Build NL Filter URL ───────────────────────────────────────────
function buildNLFilterURL(baseFilter, locationFilter, filters, fetchCategory) {
  let url = `BrightProperties?$format=json&$top=100&$count=true&$filter=${baseFilter}`;

  url += `PropertyType eq '${fetchCategory}' and `;

  // When zip is specified in the query, skip the default county location filter —
  // the zip may be in a different county from the site's defaults (e.g. 20602 is Charles County)
  if (!filters.zip) {
    url += locationFilter + ' and ';
  }

  if (filters.price) {
    url += `ListPrice le ${filters.price} and `;
  }

  if (filters.bedrooms) {
    url += `BedroomsTotal ge ${filters.bedrooms} and `;
  }

  if (filters.zip) {
    url += `PostalCode eq '${filters.zip}' and `;
  }

  if (filters.city) {
    url += `City eq '${filters.city}' and `;
  }

  // Remove trailing ' and '
  url = url.replace(/ and $/, '');

  return url;
}

// ─── Helper: Build MLS URL from AI-parsed object ───────────────────────────
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
    // Specific address: skip county filter, do contains search
    url += `contains(FullStreetAddress, '${aiObject.address.replace(/'/g, "''").trim().toUpperCase()}')`;
  } else {
    url += locationFilter;
  }

  if (aiObject.price && aiObject.price > 0) url += ` and ListPrice le ${aiObject.price}`;
  if (aiObject.bedrooms && aiObject.bedrooms > 0) url += ` and BedroomsTotal ge ${aiObject.bedrooms}`;
  if (aiObject.sqft && aiObject.sqft > 0) url += ` and LivingArea ge ${aiObject.sqft}`;

  return url;
}

export const fetchSingleListing = async (site, listingKey) => {
    return await fetchMLS(site, `BrightProperties(${listingKey})`);
};
export const fetchSingleListingId = async (site, listingId, select = '*') => {
    let url = `BrightProperties?$select=${select}&$format=json&$filter=ListingId eq '${listingId}'`
    const response = await fetchMLS(site, url);
    logger.log(response, url)
    return response?.value?.[0] || null;
};
export const fetchSingleListingJugar = async (site, listingKey) => {
    const select = ''
    let url = `BrightProperties?$format=json&$filter=ListingSourceRecordKey eq '${listingKey}'`
    const response = await fetchMLS(site, url);
    logger.log({ response, url })
    return response?.value?.[0] || null;
};
export const fetchCities = async (site, county) => {
    const defaultShortState = site.ShortState
    let url = `City?$select=CtyCityName&$format=json&$filter=CtyCountyState eq '${defaultShortState}' and CtyCityCounty eq '${transformRealtyCounty(county)}-${defaultShortState}'`
    const result = await fetchMLS(url);
    return result.value.map((item) => ({ name: item.CtyCityName }));
}
export const fetchZip = async (site, county, city) => {
    const defaultShortState = site.ShortState
    let url = `${baseUrl}/CityZipCode?$select=CityZipCodeZip&$format=json&$filter=CityZipCodeState eq '${defaultShortState}' and CityZipCodeCounty eq '${transformRealtyCounty(county)}-${defaultShortState}' and CityZipCodeCityName eq '${city}'`
    const result = await fetchMLS(url);
    return result.value.map((item) => ({ name: item.CityZipCodeZip }));
}
export const fetchLocation = async (site, county = null, city = null, zip = null) => {
    // logger.log({county,city,zip})
    if (county && city && zip) {
        return site.DefaultCounties.map((county) => ({ name: county }))
    }
    if (county && city) {
        return await fetchZip(county, city)
    } else if (county) {
        return await fetchCities(county)
    }
    return site.DefaultCounties.map((county) => ({ name: county }))
}

export async function getVideo(id, type = 'property') {
    const { query } = await import('@/lib/db');
    const approvedFilter = type === 'business' ? 'AND is_video_approved = true' : '';
    const sql = `SELECT video_id, title, description, thumbnail, created_at
                 FROM videos
                 WHERE embeded_for = $1 AND p_id_b_slug = $2 ${approvedFilter}
                 ORDER BY created_at DESC LIMIT 1`;
    try {
        const result = await query(sql, [type, id]);
        return result.rows?.[0] ?? null;
    } catch (err) {
        logger.error('[getVideo] DB error', err);
        return null;
    }
}

// Expand street type abbreviations to full words (Google Places uses full words)
function expandAddressAbbreviations(addr) {
    if (!addr) return addr;
    return addr
        .replace(/\bDr\b/gi, 'Drive')
        .replace(/\bSt\b(?!\s*\w+eet)/gi, 'Street') // St → Street (not Saint)
        .replace(/\bAve\b/gi, 'Avenue')
        .replace(/\bBlvd\b/gi, 'Boulevard')
        .replace(/\bRd\b/gi, 'Road')
        .replace(/\bLn\b/gi, 'Lane')
        .replace(/\bCt\b/gi, 'Court')
        .replace(/\bPl\b/gi, 'Place')
        .replace(/\bCir\b/gi, 'Circle')
        .replace(/\bTer\b/gi, 'Terrace')
        .replace(/\bHwy\b/gi, 'Highway')
        .replace(/\bPkwy\b/gi, 'Parkway')
        .replace(/\bFwy\b/gi, 'Freeway')
        .replace(/\bTpke\b/gi, 'Turnpike')
        .replace(/\bExpy\b/gi, 'Expressway')
        .replace(/\bN\b(?=\s+\w)/gi, 'North')
        .replace(/\bS\b(?=\s+\w)/gi, 'South')
        .replace(/\bE\b(?=\s+\w)/gi, 'East')
        .replace(/\bW\b(?=\s+\w)/gi, 'West');
}

async function searchBusinesses(site, {
    search_text = null,
    search_address = null,
    lat = null,
    long = null,
}) {
    const defaultState = site.StateLowerCase
    const defaultCounties = site.DefaultCounties
    // Expand address abbreviations so they match Google Places full-word format
    const normalizedAddress = expandAddressAbbreviations(search_address);
    const { data: businesses, count: totalRecords, error } = await (await (await import('@/utils/supabase/admin')).getSupabaseAdmin()).rpc('search_businesses', {
        p_state: defaultState,
        p_county: defaultCounties,
        p_search_text: search_text,
        p_search_address: normalizedAddress,
        p_lat: lat,
        p_long: long
    }, {
        count: "exact"
    }).limit(ITEMS_PER_PAGE)
    logger.log('searchBusinesses Query Executed at:', new Date().toISOString());
    if (error) {
        console.error('Error:', error);
        return {
            businesses: [],
            totalRecords: 0,
            geoJson: toGeoJSONPoints([]),
        }
    }

    const enhancedBusinesses = await enhanceBusinessesWithClaimStatus(businesses || []);

    return {
        businesses: enhancedBusinesses,
        totalRecords,
        geoJson: toGeoJSONPoints(enhancedBusinesses),
    };
}

export const retriveSearchCache = async (question, type = 'business') => {

    const { getSupabaseAdmin } = await import('@/utils/supabase/admin')
    const supabase = await getSupabaseAdmin()
    const { data, error } = await supabase
        .from('search_cache')
        .select('extract_object')
        .eq('question', question.trim())
        .eq('type', type)
        .single()

    logger.log('retriveSearchCache Query Executed at:', new Date().toISOString());
    if (error) {
        // console.error('RetriveSearchCache Error:', error);
        return null;
    }
    return data;
}

export const saveSearchCache = async (question, extract_object, type = 'business') => {

    const { getSupabaseAdmin } = await import('@/utils/supabase/admin')
    const supabase = await getSupabaseAdmin()
    const { data, error } = await supabase
        .from('search_cache')
        .insert([{ question: question.trim(), extract_object, type }])
    logger.log('saveSearchCache Query Executed at:', new Date().toISOString());
    if (error) {
        console.error('saveSearchCache Error:', error.message, error.code, error.details, error.hint);
        return null;
    }
    return data;
}

export const getAnswer = async (site, { ask: question = null, q, lat, long }) => {
    if (q) {
        return searchBusinesses(site, {
            search_text: q,
        })
    }
    const key = `${question}${lat ? `(${lat}` : ''}${long ? `,${long})` : ''}`

    const check = await retriveSearchCache(key)
    if (check) {
        return searchBusinesses(site, check.extract_object)
    }

    const prompt = `You are an intelligent assistant responsible for understanding the user’s query and returning a response in JSON format according to the provided schema.

${lat && long ? `Handling Location-Based Queries:
    • If the user asks for results "near me," "nearby," or any location-based query, use their latitude and longitude from headers:
    • Latitude: ${lat}
    • Longitude: ${long}` : ''}

Handling Search Parameters:
    • Any text-based query, like business name, beverages, food, pizza, bakery, etc., will be mapped to the "search_text" field.

Address-Based Queries:
    • Any address query like street name, city, zip code, landmark, etc. (excluding state or country) will be mapped to the "search_address" field.

Ensure that your JSON response is well-structured, includes only relevant fields, and follows the expected schema.

Here is the user query: ${question}`;

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: 'OBJECT',
                    properties: {
                        search_text: { type: 'STRING', description: 'anything search like business name, beverages, food, pizza, bakery, etc' },
                        search_address: { type: 'STRING', description: 'anything about address like street name, city, zip code, landmark, etc' },
                        lat: { type: 'NUMBER', description: 'only latitude' },
                        long: { type: 'NUMBER', description: 'only longitude' },
                    }
                }
            }
        });

        const object = JSON.parse(response.text);

        await saveSearchCache(key, object)
        return searchBusinesses(site, object)
    } catch (error) {
        console.error('[getAnswer] AI Error:', error);
        return searchBusinesses(site, { search_text: question }); // Fallback to direct search
    }
}

export const getAnswerRealtyObject = async ({ ask: question, lat, long }) => {
    const key = `${question}${lat ? `(${lat}` : ''}${long ? `,${long})` : ''}`
    logger.log({
        "getAnserRealtyObject": key
    })
    const check = await retriveSearchCache(key, "realty")
    if (check) {
        return check.extract_object;
    }
    
    const prompt = `User query would be for real estate data finder. like "looking for a buying house in 2.5k in riverview with three bedrooms" sometime it would be only few things, so if there is nothing to add in value just pass null or -1. Answer in json only nothing else. 
        Strucutre Mapping values: 'sale' cateogry match these words (buy, sale, purcahse, get), 'rent' category match these words (rent, lease), 'land' category match these words (land, plot), 'multi' category match these words (multi, duplex, triplex), 'commercial' category match these words (commercial, office, shop), 'commercial-lease' category match these words (commercial-lease, office-lease, shop-lease)
        About Address: some would type "area", "place", "city", "county", "state", "country" or "zip" so you have to find the address from these words, not include these words in address
        Style: some would type "flat", "banglow", "house", "villa", "condo", "traditional", "split level", "colonial", "contemporary", "modern", "ranch", "cottage", "victorian", "mediterranean", "craftsman"
        Mapped Style: 'flat' match these words (flat, apartment), 'banglow' match these words (banglow, house), 'villa' match these words (villa, mansion), 'condo' match these words (condo, condominium), 'traditional' match these words (traditional, classic), 'split level' match these words (split level, split-level), 'colonial' match these words (colonial, colonial-style), 'contemporary' match these words (contemporary, modern), 'ranch' match these words (ranch, ranch-style), 'cottage' match these words (cottage, cottage-style), 'victorian' match these words (victorian, victorian-style), 'mediterranean' match these words (mediterranean, mediterranean-style), 'craftsman' match these words (craftsman, craftsman-style)
        Latitude and Longitude: if user provide latitude and longitude then use latitude and longitude, and skip all addresses
        

Query: ${question}` + (lat && long ? ` Latitude:(${lat}, Longitude: ${long})` : '');

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: 'OBJECT',
                    properties: {
                        category: { type: 'STRING', enum: ['sale', 'rent', 'land', 'multi', 'commercial', 'commercial-lease'] },
                        address: { type: 'STRING' },
                        price: { type: 'INTEGER' },
                        bedrooms: { type: 'INTEGER' },
                        style: { type: 'STRING', enum: ['flat', 'banglow', 'villa', 'condo', 'traditional', 'split level', 'colonial', 'contemporary', 'modern', 'ranch', 'cottage', 'victorian', 'mediterranean', 'craftsman'] },
                        sqft: { type: 'INTEGER' },
                        lat: { type: 'NUMBER' },
                        long: { type: 'NUMBER' }
                    }
                }
            }
        });

        const object = JSON.parse(response.text);

        // Apply default for category as in zod
        if (!object.category) object.category = 'sale';

        await saveSearchCache(key, object, "realty")
        return object
    } catch (error) {
        console.error('[getAnswerRealtyObject] AI Error:', error);
        return { category: 'sale', price: -1, bedrooms: -1, sqft: -1, lat: -1, long: -1 }; // Safe fallback
    }
}
let cachedMlsToken = null;
let cachedMlsTokenExpiry = null;

export const getMLSApiToken = async (force = false) => {

    // Check in-memory cache first
    const now = Date.now();
    if (!force && cachedMlsToken && cachedMlsTokenExpiry && now < cachedMlsTokenExpiry) {
        // logger.log("[API] Using cached MLS token");
        return { access_token: cachedMlsToken, expires_in: Math.floor((cachedMlsTokenExpiry - now) / 1000) };
    }

    logger.log("[API] Fetching new MLS token...");

    const urlencoded = new URLSearchParams({
        client_id: process.env.OKTA_CLIENT_ID,
        client_secret: process.env.OKTA_CLIENT_SECRET,
        grant_type: "client_credentials",
    });

    const response = await fetch(process.env.OKTA_BASE_URL, {
        method: "POST",
        body: urlencoded,
        headers: {
            accept: "application/json",
            "content-type": "application/x-www-form-urlencoded",
        },
        // 30 mins 
        next: { revalidate: force ? 0 : 1800 }, // Cache for 30 minutes
    });

    if (!response.ok) {
        if (!force) return await getMLSApiToken(true); // Retry if failed
        // If already forced and failed, might want to throw or return null, but sticking to existing pattern roughly
        console.error("[API] Failed to fetch token even after retry");
        return { access_token: null, expires_in: 0 };
    }

    const { access_token, expires_in } = await response.json();
    if (!access_token) {
        if (!force) return await getMLSApiToken(true); // Retry if no token received
        return { access_token: null, expires_in: 0 };
    }

    // Update in-memory cache
    cachedMlsToken = access_token;
    // Set expiry with a 5-minute buffer
    cachedMlsTokenExpiry = now + ((expires_in || 3600) * 1000) - (5 * 60 * 1000);

    return { access_token, expires_in: expires_in || 3600 }; // Return token with expiry
};
const safeAsync = async (fn, fallback = null) => {
    try {
        return await fn();
    } catch (err) {
        console.error(`[safeAsync] ${fn.name} failed:`, err);
        return fallback;
    }
};
export const fetchMLS = async (site, url, retry = true) => {
    try {
        if (!site.IncludeRealty) return { value: [] };

        let { access_token, expires_in } = await getMLSApiToken();
        if (!access_token) throw new Error("No MLS token available");

        const cacheBusterUrl = url.includes('?') ? `${url}&_v=4` : `${url}?_v=4`;

        logger.log('[fetchMLS] Request URL:', `${baseUrl}/${cacheBusterUrl}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        let response;
        try {
            response = await fetch(`${baseUrl}/${cacheBusterUrl}`, {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${access_token}`,
                },
                next: { revalidate: expires_in },
                signal: controller.signal,
            });
        } finally {
            clearTimeout(timeoutId);
        }

        if (response.status === 429) {
            // Rate limited — wait 1s and retry once
            logger.warn("[API] Rate limited (429), retrying after 1s...");
            await new Promise(r => setTimeout(r, 1000));
            const rlController = new AbortController();
            const rlTimeoutId = setTimeout(() => rlController.abort(), 12000);
            try {
                response = await fetch(`${baseUrl}/${cacheBusterUrl}`, {
                    headers: { accept: "application/json", Authorization: `Bearer ${access_token}` },
                    next: { revalidate: expires_in },
                    signal: rlController.signal,
                });
            } finally {
                clearTimeout(rlTimeoutId);
            }
        } else if (response.status === 401 && retry) {
            logger.warn("[API] Token expired, retrying...");
            const fresh = await getMLSApiToken(true);
            access_token = fresh.access_token;
            expires_in = fresh.expires_in;
            const retryController = new AbortController();
            const retryTimeoutId = setTimeout(() => retryController.abort(), 12000);
            try {
                response = await fetch(`${baseUrl}/${cacheBusterUrl}`, {
                    headers: {
                        accept: "application/json",
                        Authorization: `Bearer ${access_token}`,
                    },
                    next: { revalidate: expires_in },
                    signal: retryController.signal,
                });
            } finally {
                clearTimeout(retryTimeoutId);
            }
        }

        if (!response.ok) throw new Error(`MLS fetch failed: ${response.status}`);

        const json = await response.json();

        // Only fetch images for single-property responses (has ListingKey, not a list)
        if (json.ListingKey) {
            const imagesRes = await fetch(
                `${baseUrl}/BrightMedia?$format=json&$filter=ListingSourceRecordKey eq '${json.ListingKey}'&$select=MediaURLHiRes`,
                {
                    headers: {
                        accept: "application/json",
                        Authorization: `Bearer ${access_token}`,
                    },
                    next: { revalidate: expires_in },
                }
            );
            const imagesJson = imagesRes.ok ? await imagesRes.json() : { value: [] };
            json.ListImages = imagesJson.value?.map((e) => e.MediaURLHiRes).filter(Boolean) || [];
        }

        return json;
    } catch (err) {
        if (err.name === 'AbortError') {
            console.error("[fetchMLS] Request timed out");
        } else {
            console.error("[fetchMLS] Error:", err);
        }
        return { value: [] };
    }
};

import { verifyTurnstileToken } from './turnstile';

export const postData = async (body) => {
    // --- SECURITY: Turnstile Verification ---
    const isHuman = await verifyTurnstileToken(body.cf_token);
    if (!isHuman) {
        return { data: "Security verification failed. Please try again.", status: 403 };
    }

    const newBody = body?.meeting
        ? {
            ...body,
            start_date: new Date().toString(),
            //   add 7 days
            end_date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toString(),
            subject: `${body.firstname} is interested in meeting for tour a property`,
            body: `Hey Joe,

      I would like to make a tour of ${body.address} this property at ${new Date().toLocaleString()}. 
      
      Information is below:
      Address of property: ${body.address} 
      Site: ${body.site_name || 'Realty Directions'}
      
      
      Contact me on phone or email:
      phone: ${body.phone}
      email: ${body.email}
      
      Thanks
      ${body.firstname} ${body.lastname}`,
        }
        : {
            ...body,
            subject: `Need more information about this property `,
            body: `Hey Joe,

      I would like to get more information about this property.

      Contact me on phone or email:
      phone: ${body.phone}
      email: ${body.email}
      address: ${body.address}
      Site: ${body.site_name || 'Realty Directions'}
      
      Thanks
      ${body.firstname} ${body.lastname}`,
        }
    const post = {
        properties: {
            email: body.email,
            firstname: body.firstname,
            lastname: body.lastname,
            phone: body.phone,
        },
        // Custom properties that don't exist as standard HubSpot fields
        // are sent in the metadata object
        metadata: {
            lead_source: 'Property Inquiry',
            site_domain: body.site_name || 'Realty Directions'
        }
    }

    const data = await apiHubSpotNewContact(body.email, post)

    if (data.hasOwnProperty("status") && data.status === "error") {
        return { data: data.message, status: 400 }
    }

    try {
        const { query } = await import('@/lib/db');
        const { getLiveSiteId } = await import('@/lib/getLiveSiteId');
        const headersList = await import('next/headers').then(m => m.headers());
        const host = typeof request !== 'undefined' && request.headers ? request.headers.get('host') : (typeof headersList !== 'undefined' ? headersList.get('host') : null);
        const sourceDb = await getSourceDb(host);
        
        // host already defined
        const liveSiteId = await getLiveSiteId(host);

        await query(`
            INSERT INTO property_leads (
                name, email, phone, site_name, source_db, source_state, live_site_id, created_at, full_url
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)
        `, [
            `${body.firstname} ${body.lastname}`,
            body.email,
            body.phone,
            body.site_name || 'Realty Directions',
            sourceDb,
            host,
            liveSiteId,
            body.full_url || null
        ]);
    } catch (dbErr) {
        console.error('Error saving property lead to Auth DB:', dbErr);
    }

    if (body.hasOwnProperty("task") && body.task) {
        logger.log("Task");
        const e = await apiHubSpotCreateTask(data.id, newBody)
        logger.log("Task data", e);
    }
    if (body.hasOwnProperty("meeting") && body.meeting) {
        logger.log("Meeting");
        const d = await apiHubSpotCreateMeeting(data.id, newBody)
        logger.log("Meeting data", d);
    }
    return { data: `Request Sent!`, status: 200 }
}

export const pushRegisteredLead = async ({ email, full_name, phone, site_name }) => {
    const [firstname = '', lastname = ''] = (full_name || '').split(' ')
    const post = {
        properties: {
            email,
            firstname,
            lastname,
            phone,
        },
        metadata: {
            lead_source: 'Sign Up / Registration',
            site_domain: site_name || 'Realty Directions'
        }
    }
    const data = await apiHubSpotNewContact(email, post)
    if (data.hasOwnProperty("status") && data.status === "error") {
        return { data: data.message, status: 400 }
    }
    const task = {
        subject: `New Registration: ${full_name}`,
        body: `New registered lead\nSite: ${site_name || 'Realty Directions'}\nName: ${full_name}\nEmail: ${email}\nPhone: ${phone}`,
    }
    await apiHubSpotCreateTask(data.id, task)
    return { data: 'Registered lead pushed', status: 200, id: data.id }
}

export const pushClaimLead = async ({ email, full_name, phone, site_name, business_title, business_address }) => {
    const [firstname = '', lastname = ''] = (full_name || '').split(' ')
    const post = {
        properties: {
            email,
            firstname,
            lastname,
            phone,
        },
        metadata: {
            lead_source: 'Business Claim',
            site_domain: site_name
        }
    }
    const data = await apiHubSpotNewContact(email, post)
    if (data.hasOwnProperty("status") && data.status === "error") {
        return { data: data.message, status: 400 }
    }
    const task = {
        subject: `Business Claim: ${business_title || 'Unknown Business'}`,
        body: `Business claim lead\nSite: ${site_name || 'Realty Directions'}\nClaimer: ${full_name}\nEmail: ${email}\nPhone: ${phone}\nBusiness: ${business_title || ''}\nAddress: ${business_address || ''}`,
    }
    await apiHubSpotCreateTask(data.id, task)
    return { data: 'Claim lead pushed', status: 200, id: data.id }
}

export const pushBusinessSubmissionLead = async ({ email, full_name, phone, site_name, business_title, business_address, submission_data = {} }) => {
    const [firstname = '', lastname = ''] = (full_name || '').split(' ')
    const post = {
        properties: {
            email,
            firstname,
            lastname,
            phone,
        },
        metadata: {
            lead_source: 'New Business Submission',
            site_domain: site_name
        }
    }
    const data = await apiHubSpotNewContact(email, post)
    if (data.hasOwnProperty("status") && data.status === "error") {
        return { data: data.message, status: 400 }
    }
    const task = {
        subject: `New Business Submission: ${business_title || 'Unknown Business'}`,
        body: `New business submission lead\nSite: ${site_name || 'Realty Directions'}\nSubmitted by: ${full_name}\nEmail: ${email}\nPhone: ${phone}\nBusiness: ${business_title || ''}\nAddress: ${business_address || ''}\n\nSubmission Data: ${JSON.stringify(submission_data, null, 2)}`,
    }
    await apiHubSpotCreateTask(data.id, task)
    return { data: 'Business submission lead pushed', status: 200, id: data.id }
}

const apiHubSpotUpdateContact = async (id, properties) => {
    const options = {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
            , "Authorization": `Bearer ${env("HUBSPOT_API_KEY")}`
        },
        body: JSON.stringify({ ...properties }),
        redirect: "follow",
    }
    // logger.log(options)
    const response = await fetch(
        `https://api.hubapi.com/crm/v3/objects/contacts/${id}`,
        options
    )
    return await response.json()
}
const apiHubSpotNewContact = async (email, postData) => {
    const checkExisting = await apiHubSpotExistContact(email)
    if (checkExisting !== false) {
        // logger.log("Milgaya, ", checkExisting)
        return await apiHubSpotUpdateContact(checkExisting, postData)
    }
    const url = `https://api.hubapi.com/crm/v3/objects/contacts`
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${env("HUBSPOT_API_KEY")}`
        },
        body: JSON.stringify(postData),
    }

    const response = await fetch(url, options)
    return await response.json()
}
const apiHubSpotExistContact = async (query) => {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
            , "Authorization": `Bearer ${env("HUBSPOT_API_KEY")}`
        },
        body: JSON.stringify({
            query,
        }),
        redirect: "follow",
    }

    const res = await fetch(
        `https://api.hubapi.com/crm/v3/objects/contacts/search`,
        options
    )
    const result = await res.json()
    if (result.total > 0) {
        return result.results[0].id
    }
    return false
}

const apiHubSpotOwnerId = async () => {
    try {
        const options = {
            headers: {
                "Content-Type": "application/json"
                , "Authorization": `Bearer ${env("HUBSPOT_API_KEY")}`
            },
        }
        const res = await fetch(
            `https://api.hubapi.com/crm/v3/owners/?limit=100&archived=false`,
            options
        )

        const data = await res.json()
        if (!data || !data.results) {
            console.error('[HubSpot] Invalid response from owners API:', data);
            return null;
        }

        const { results } = data;
        const owner = results.find((e) => e.email && e.email.match("info@baltimoredirections.com"))
        return owner ? owner.id : (results[0]?.id || null)
    } catch (e) {
        console.error('[HubSpot] Error fetching owner ID:', e);
        return null;
    }
}

const apiHubSpotCreateTask = async (contactId, task) => {
    const ownerId = await apiHubSpotOwnerId();
    const properties = {
        hs_timestamp: new Date(),
        hs_task_body: task.body,
        hs_task_subject: task.subject,
        hs_task_status: "WAITING",
        hs_task_priority: "HIGH",
    };

    if (ownerId) {
        properties.hubspot_owner_id = ownerId;
    }

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
            , "Authorization": `Bearer ${env("HUBSPOT_API_KEY")}`
        },
        body: JSON.stringify({
            properties
        }),
        redirect: "follow",
    }

    const res = await fetch(
        `https://api.hubapi.com/crm/v3/objects/tasks`,
        options
    )

    const data = await res.json()
    const id = data.id

    if (!id) {
        console.error('[HubSpot] Failed to create task:', data);
        return data;
    }

    const result = await fetch(
        `https://api.hubapi.com/crm/v3/objects/tasks/${id}/associations/contact/${contactId}/task_to_contact`,
        {
            method: "PUT",
            redirect: "follow",
            headers: {
                "Content-Type": "application/json"
                , "Authorization": `Bearer ${env("HUBSPOT_API_KEY")}`
            },
        }
    )

    return await result.json()
}

const apiHubSpotCreateMeeting = async (contactId, meeting) => {
    const ownerId = await apiHubSpotOwnerId();
    const properties = {
        hs_timestamp: new Date(),
        hs_meeting_title: meeting.subject,
        hs_meeting_body: meeting.body,
        hs_internal_meeting_notes: meeting.remarks,
        hs_meeting_external_url: "",
        hs_meeting_location: "OnSite",
        hs_meeting_start_time: meeting.start,
        hs_meeting_end_time: meeting.end,
        hs_meeting_outcome: "SCHEDULED",
    };

    if (ownerId) {
        properties.hubspot_owner_id = ownerId;
    }

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
            , "Authorization": `Bearer ${env("HUBSPOT_API_KEY")}`
        },
        body: JSON.stringify({
            properties
        }),
        redirect: "follow",
    }

    const res = await fetch(
        `https://api.hubapi.com/crm/v3/objects/meetings`,
        options
    )

    const data = await res.json()
    const id = data.id

    if (!id) {
        console.error('[HubSpot] Failed to create meeting:', data);
        return data;
    }

    const result = await fetch(
        `https://api.hubapi.com/crm/v3/objects/meetings/${id}/associations/contact/${contactId}/meeting_event_to_contact`,
        {
            method: "PUT",
            redirect: "follow",
            headers: {
                "Content-Type": "application/json"
                , "Authorization": `Bearer ${env("HUBSPOT_API_KEY")}`
            },
        }
    )

    return await result.json()
}

export async function getBlogPosts(site, page = 1, limit = 10) {
    try {
        if (!site || !site.id) return { posts: [], total: 0, totalPages: 0 };
        const { query } = await import('@/lib/db');
        const offset = (page - 1) * limit;
        
        const res = await query(
            `SELECT title, slug, created_at FROM posts WHERE live_site_id = $1 AND status = true ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
            [site.id, limit, offset]
        );
        const countRes = await query(
            `SELECT COUNT(*) FROM posts WHERE live_site_id = $1 AND status = true`,
            [site.id]
        );
        
        const total = parseInt(countRes.rows[0].count, 10);
        return {
            posts: res.rows || [],
            total,
            totalPages: Math.ceil(total / limit)
        };
    } catch (error) {
        console.error('Error fetching all posts:', error);
        return { posts: [], total: 0, totalPages: 0 };
    }
}

export async function getSingleBlogPost(site, slug) {
    try {
        if (!site || !site.id) return null;
        const { query } = await import('@/lib/db');
        const res = await query(
            `SELECT * FROM posts WHERE live_site_id = $1 AND slug = $2 AND status = true LIMIT 1`,
            [site.id, slug]
        );
        
        if (!res.rows || res.rows.length === 0) {
            return null;
        }
        return res.rows[0];
    } catch (error) {
        console.error('Error fetching single post:', error);
        return null;
    }
}

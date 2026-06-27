
'use server';
// import Redis from 'ioredis';
import { generateObject } from 'ai';
import logger from '@/lib/logger'

import { groq } from '@ai-sdk/groq';
import { z } from 'zod';
import { fetchCategories, fetchMLSStatus, supabase, baseUrl, env, decodeAndLowercase, toGeoJSONPoints, toGeoJSONPointsRealty, convertOrder, ITEMS_PER_PAGE, videohomes, ucwords, distanceMiles } from './helper-test.js';


export const getSubcategoriesByIDs = async (subcategoriesIds) => {
    try {
        if (!subcategoriesIds || subcategoriesIds.length === 0) {
            return [];
        }

        const { data, error } = await supabase
            .from('subcategories')
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

export const getBusiness = async (site,slug) => {
  const defaultState = site.StateLowerCase
    const defaultCounties = site.DefaultCounties
  const countyFilters = defaultCounties?.map((county) => `county_lower.eq.${county.toLowerCase()}`).join(',');
  const baseFilter = (query) =>
    query
      .eq('state_lower', defaultState)
      .or(countyFilters)
      .eq('status', true)
      .limit(1)
      .maybeSingle();

  // Normalize the slug once
  const normalizedSlug = slug.toLowerCase();

  // Try both fields in one query using OR
  let { data, error } = await baseFilter(
    supabase
      .from('businesses')
      .select(`*, categories(*), update_slug`)
      .or(`update_slug.eq.${normalizedSlug},slug.eq.${normalizedSlug}`)
      .is('deleted_at', null)
  );

  if (error) {
    const fallback = await baseFilter(
      supabase
        .from('businesses')
        .select(`*, categories(*), update_slug`)
        .or(`update_slug.eq.${normalizedSlug},slug.eq.${normalizedSlug}`)
    );
    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    console.error('Error fetching business:', error);
    return null;
  }

  return data;
};

export const getBestRatedBusiness = async (site, cat_name = false, rating_value = "4.8") => {
    try {
        const { data, error } = await supabase.rpc('get_best_rated_business', {
            p_cat_name: cat_name || null,
            p_rating_value: rating_value,
            p_default_state: site.StateLowerCase,
            p_county_filters: site.DefaultCounties
        });

        if (error) throw error;

        logger.log('getBestRatedBusiness Query Executed at:', new Date().toISOString());
        return data;
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

    const host = site?.domain || (site?.URL ? site.URL.replace(/^https?:\/\//, '').replace(/^www\./, '') : 'oceancitydirections.com');
    
    // Fetch featured videos and database queries concurrently
    

    const businessesPromise = supabase.rpc("get_businesses_sorted", {
      ...params,
      p_page: currentPage,
      p_limit: ITEMS_PER_PAGE, // We'll adjust after fetching featured videos
    });

    const countPromise = supabase.rpc("count_businesses_extra", params);

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
      const adjustedBusinessResponse = await supabase.rpc("get_businesses_sorted", {
        ...params,
        p_page: currentPage,
        p_limit: limitAdjustment,
      });
      businesses = adjustedBusinessResponse.data || [];
    }

    const totalRecords = countResponse.data || 50;

    return {
      totalRecords,
      businesses,
      geoJson: toGeoJSONPoints(businesses),
      featured_videos: featured_videos || [],
    };
  }, { businesses: [], totalRecords: 0 });


export const getLocationNew = async (site,props = {}) => {
    const { county = null, city = null, zip = null, categoryPage = null, category = null, subcategory = null, minimum = 5 } = props;
    const defaultState = site.StateLowerCase;
    const defaultCounties = site.DefaultCounties
    let function_name, parameters;
    if (!county && (!category || categoryPage)) {
        function_name = 'get_total_records_by_county';
        parameters = {
            p_state: defaultState,
            p_county: defaultCounties
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
            p_minimum: minimum // ✅ Explicitly passing p_minimum
        }
    }


    const { data, error } = await supabase.rpc(function_name, parameters);
    logger.log(function_name + ' Query Executed at:', new Date().toISOString());
    if (error) {
        console.error("Error fetching locations:", error);
    }
    return data;
};

export const getCategoriesNew = async (site,props = {}) => {  // ✅ Default to an empty object
    const { county = null, city = null, zip = null, category = null, subcategory = null, minimum = 5 } = props;
    const defaultState = site.StateLowerCase
    const defaultCounties = site.DefaultCounties
    // logger.log('Supabase Query Executed at:', new Date().toISOString());
    const { data, error } = await supabase
        .rpc('get_businesses_extra_type', {
            p_state: defaultState,
            p_county: county ? [decodeAndLowercase(county)] : defaultCounties,
            p_type: 'category',
            p_category_name: category ? decodeAndLowercase(category) : null,
            p_subcategory_name: subcategory ? decodeAndLowercase(subcategory) : null,
            p_city: city ? decodeAndLowercase(city) : null,
            p_zip: zip || null,
            p_minimum: minimum
        });
    logger.log('get_businesses_extra_type Query Executed at:', new Date().toISOString());
    if (error) {
        console.error("Error fetching categories:", error);
    }
    return data;
};


export const homePageListing = async (site) => {
    const defaultShortState = site.ShortState.toLowerCase();
    const counties = site.DefaultCounties;
    const countyList = counties.map(e => `'${e}-${defaultShortState}'`).join(', '); // Ensures each county name is wrapped in single quotes
    const select = 'ListingKey,UnparsedAddress,ListingId,ModificationTimestamp,ListPictureURL,ListPrice,FullStreetAddress,City,PostalCode,BedroomsTotal,BathroomsFull,BathroomsHalf,AreaTotal,ListOfficeName';
    let url = `BrightProperties?$format=json&$top=6&$select=${select}&$filter=StateOrProvince eq '${defaultShortState}' and PropertyType eq 'Residential' and MlsStatus in (${fetchMLSStatus['default']}) and DaysOnMarket le 2 and ListPrice ge 400000 and County in (${countyList})&$orderby=${convertOrder('')}`;
    return await fetchMLS(site,url);

}

export const getNearbyProperties = async (site, { lat, long, price, listingId }) => {
  if (!lat || !long) return [];

  const defaultShortState = site.ShortState.toLowerCase();

  const select =
    "ListingKey,UnparsedAddress,ListingId,ModificationTimestamp,ListPictureURL,ListPrice,FullStreetAddress,City,PostalCode,BedroomsTotal,BathroomsFull,BathroomsHalf,AreaTotal,ListOfficeName,Latitude,Longitude,MlsStatus,PropertyType";

  // ---------- 1. DYNAMIC BOUNDING BOX ----------
  const RADIUS_KM = 0.5;
  const latDelta = RADIUS_KM / 111;
  const lngDelta = RADIUS_KM / (111 * Math.cos((lat * Math.PI) / 180));

  const minLat = lat - latDelta;
  const maxLat = lat + latDelta;
  const minLng = long - lngDelta;
  const maxLng = long + lngDelta;

  // ---------- 2. PRICE FILTER ----------
  // Only properties priced higher than or equal to "price"
  const priceFilter = price ? `and ListPrice ge ${price}` : "";

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
    return await searchBusinesses(site, {
        search_text: 'Restaurant',
        lat,
        long
    });
};

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}



export const fetchListing4Sitemap = async (site) => {
    const defaultShortState = site.ShortState.toLowerCase();
    const counties = site.DefaultCounties;
    const countyList = counties.map(e => `'${e}-${defaultShortState}'`).join(', '); // Ensures each county name is wrapped in single quotes
    const select = 'ListingKey,UnparsedAddress,ListingId,ModificationTimestamp';
    let url = `BrightProperties?$format=json&$top=10000&$select=${select}&$filter=StateOrProvince eq '${defaultShortState}' and MlsStatus in (${fetchMLSStatus['default']}) and DaysOnMarket le 180 and County in (${countyList})`;
    const result = await fetchMLS(site,url);
    return result?.value || [];
}

export const fetchListing4Related = async (site,{ city, zip }) => {

    if (!site.IncludeRealty) {
        return []
    }
    const defaultShortState = site.ShortState.toLowerCase();
    const counties = site.DefaultCounties;
    const countyList = counties.map(e => `'${e}-${defaultShortState}'`).join(', '); // Ensures each county name is wrapped in single quotes
    const select = 'ListingId,ListingKey,UnparsedAddress,ListPictureURL,ListPrice,FullStreetAddress,City,PostalCode,BedroomsTotal,BathroomsFull,BathroomsHalf,AreaTotal,ListOfficeName';
    let url = `BrightProperties?$format=json&$top=3&$select=${select}&$filter=StateOrProvince eq '${defaultShortState}' and PropertyType eq 'Residential' and County in (${countyList}) and PostalCode eq '${zip}' and City eq '${city}' and MlsStatus eq 'ACTIVE-BRIGHT' and DaysOnMarket le 3&$orderby=${convertOrder('price_desc')}`;
    const result = await fetchMLS(site,url);
    return result?.value || [];
}
export const getListingLinks = async () => {

    const { data, error } = await (await import('@/utils/supabase/admin')).getSupabaseAdmin().then(s => s.from('search_cache'))
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
    const { data, error } = await (await import('@/utils/supabase/admin')).getSupabaseAdmin().then(s => s.from('search_cache'))
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
export const fetchListings = async (site,filters) => {

    let { county, city, zip, category = 'sale', status = 'default', page: currentPage = 1, orderBy, ask, q, lat, long, default_object = false } = filters;
    const defaultShortState = site.ShortState
    const skip = (currentPage - 1) * ITEMS_PER_PAGE;
    // logger.log(skip,currentPage)
    
    // Alias q to ask if ask is missing
    if (ask && !q) {
        q = ask;
    }

    let MlsStatus = fetchMLSStatus[status];
    let baseFilter = `StateOrProvince eq '${defaultShortState}' and MlsStatus in (${MlsStatus}) and DaysOnMarket le 365 and `;
    let url = `BrightProperties?$format=json&$top=${ITEMS_PER_PAGE}&$skip=${skip}&$count=true&$filter=${baseFilter}`;
    let fetchCategory = fetchCategories[category];

    // Get featured videos for realty
    

    if (ask) {
        // Try direct search first
        let useDirectSearch = false;
        let aiObject = null;
        let successfulSearchTerm = null;

        // Build location filter part
        let locationFilter = '';
        if (county || city || zip) {
            if (county) locationFilter += `County eq '${county.toLowerCase()}-${defaultShortState}'`
            if (city) locationFilter += ` and City eq '${city}'`
            if (zip) locationFilter += ` and PostalCode eq '${zip}'`
        } else {
             const counties = site.DefaultCounties;
             const countyList = counties.map(e => `'${e}-${defaultShortState}'`).join(', ');
             locationFilter += `County in (${countyList})`;
        }

        // Check 1: Original ask
        let checkUrl = `BrightProperties?$format=json&$top=1&$filter=${baseFilter}PropertyType eq '${fetchCategory}' and ${locationFilter} and contains(UnparsedAddress, '${ask}')`;
        let checkResult = await fetchMLS(site, checkUrl);
        
        if (checkResult.value && checkResult.value.length > 0) {
            useDirectSearch = true;
            successfulSearchTerm = ask;
        } else {
            // Check 2: Title Case ask
            const askTitle = ucwords(ask);
            if (ask !== askTitle) {
                checkUrl = `BrightProperties?$format=json&$top=1&$filter=${baseFilter}PropertyType eq '${fetchCategory}' and ${locationFilter} and contains(UnparsedAddress, '${askTitle}')`;
                checkResult = await fetchMLS(site, checkUrl);
                if (checkResult.value && checkResult.value.length > 0) {
                    useDirectSearch = true;
                    successfulSearchTerm = askTitle;
                }
            }
        }

        if (!useDirectSearch) {
             aiObject = default_object === false ? await getAnswerRealtyObject({ ...filters, ask }) : default_object;
        }

        if (useDirectSearch) {
             url += `contains(UnparsedAddress, '${successfulSearchTerm}') and `;
        } else if (aiObject) {
            const object = aiObject;
            if (object?.address) {
                url += `contains(UnparsedAddress, '${object.address}') and `
            }
            if (object?.price && object.price > 0) {
                url += `ListPrice le ${object.price} and `
            }
            if (object?.bedrooms && object.bedrooms > 0) {
                url += `BedroomsTotal le ${object.bedrooms} and `
            }
            // if (object?.style) {
            //   url += `contains(ArchitecturalStyle, '${object.style}') and `
            // }
            if (object?.lat && object?.long) {
                url += `geo.distance(Location, 'POINT(${long} ${lat})') le 3000 and `;
            }
            if (object.sqft) {
                url += `LotSizeSquareFeet ge ${object.sqft} and `
            }
            if (object?.category) {
                fetchCategory = fetchCategories[object.category];
                category = object.category;
            }
            logger.log({ ask, default_object })
        }
    }
    url += `PropertyType eq '${fetchCategory}' and `
    if (county || city || zip) {
        if (county) {
            url += `County eq '${county.toLowerCase()}-${defaultShortState}'`
        }
        if (city) {
            url += ` and City eq '${city}'`
        }
        if (zip) {
            url += ` and PostalCode eq '${zip}'`
        }
    } else {
        const counties = site.DefaultCounties;
        const countyList = counties.map(e => `'${e}-${defaultShortState}'`).join(', '); // Ensures each county name is wrapped in single quotes
        url += `County in (${countyList})`;
    }
    url += `&$orderby=${convertOrder(orderBy)}`
    // logger.log({url})
    const host = site?.domain || (site?.URL ? site.URL.replace(/^https?:\/\//, '').replace(/^www\./, '') : 'oceancitydirections.com');
    const [featured_videos,result] = await Promise.all([
        videohomes(host,true,'property'),fetchMLS(site,url)
    ])
    
    return { ...result, geoJson: toGeoJSONPointsRealty(result.value), category, featured_videos: featured_videos || [] };
};

export const fetchSingleListing = async (site,listingKey) => {
    return await fetchMLS(site,`BrightProperties(${listingKey})`);
};
export const fetchSingleListingId = async (site,listingId,select = '*') => {
    let url = `BrightProperties?$select=${select}&$format=json&$filter=ListingId eq '${listingId}'`
    const response = await fetchMLS(site,url);
    logger.log(response,url)
    return response?.value?.[0] || null;
};
export const fetchSingleListingJugar = async (site,listingKey) => {
    const select = ''    
    let url = `BrightProperties?$format=json&$filter=ListingSourceRecordKey eq '${listingKey}'`
    const response = await fetchMLS(site,url);
    logger.log({response,url})
    return response?.value?.[0] || null;
};
export const fetchCities = async (site,county) => {
    const defaultShortState = site.ShortState
    let url = `City?$select=CtyCityName&$format=json&$filter=CtyCountyState eq '${defaultShortState}' and CtyCityCounty eq '${county}-${defaultShortState}'`
    const result = await fetchMLS(url);
    return result.value.map((item) => ({ name: item.CtyCityName }));
}
export const fetchZip = async (site,county, city) => {
    const defaultShortState = site.ShortState
    let url = `${baseUrl}/CityZipCode?$select=CityZipCodeZip&$format=json&$filter=CityZipCodeState eq '${defaultShortState}' and CityZipCodeCounty eq '${county}-${defaultShortState}' and CityZipCodeCityName eq '${city}'`
    const result = await fetchMLS(url);
    return result.value.map((item) => ({ name: item.CityZipCodeZip }));
}
export const fetchLocation = async (site,county = null, city = null, zip = null) => {
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

export async function getVideo(id,type='property') {
    logger.log('Fetching get video',`${process.env.NEXT_PUBLIC_VIDEO_HOME_URL}/api/${type}/${id}`)
    const response = await fetch(`${process.env.NEXT_PUBLIC_VIDEO_HOME_URL}/api/${type}/${id}`,{
        revalidate: 600
    });
    const result = await response.json();
    return result;
}

async function searchBusinesses(site,{
    search_text = null,
    search_address = null,
    lat = null,
    long = null,
}) {
    const defaultState = site.StateLowerCase
    const defaultCounties = site.DefaultCounties
    const { data: businesses, count: totalRecords, error } = await supabase.rpc('search_businesses', {
        p_state: defaultState,
        p_county: defaultCounties,
        p_search_text: search_text,
        p_search_address: search_address,
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

    return {
        businesses,
        totalRecords,
        geoJson: toGeoJSONPoints(businesses),
    };
}

export const retriveSearchCache = async (question, type = 'business') => {

    const { data, error } = await (await import('@/utils/supabase/admin')).getSupabaseAdmin().then(s => s.from('search_cache'))
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

    const { data, error } = await (await import('@/utils/supabase/admin')).getSupabaseAdmin().then(s => s.from('search_cache'))
        .insert([{ question: question.trim(), extract_object, type }])
    logger.log('saveSearchCache Query Executed at:', new Date().toISOString());
    if (error) {
        console.error('saveSearchCache Error:', error);
        return null;
    }
    return data;
}

export const getAnswer = async (site,{ ask: question = null, q, lat, long }) => {
    if (q) {
        return searchBusinesses(site,{
            search_text: q,
        })
    }
    const key = `${question}${lat ? `(${lat}` : ''}${long ? `,${long})` : ''}`

    const check = await retriveSearchCache(key)
    if (check) {
        return searchBusinesses(site,check.extract_object)
    }

    const prompt = `You are an intelligent assistant responsible for understanding the user’s query and returning a response in JSON format according to the provided schema.

${lat && long && `Handling Location-Based Queries:
    • If the user asks for results “near me,” “nearby,” or any location-based query, use their latitude and longitude from headers:
    • Latitude: ${lat}
    • Longitude: ${long}`}

Handling Search Parameters:
    • Any text-based query, like business name, beverages, food, pizza, bakery, etc., will be mapped to the "search_text" field.

Address-Based Queries:
    • Any address query like street name, city, zip code, landmark, etc. (excluding state or country) will be mapped to the "search_address" field.

Ensure that your JSON response is well-structured, includes only relevant fields, and follows the expected schema.

Here is the user query: ${question}`

    const { object } = await generateObject({
        prompt: prompt,
        model: groq('openai/gpt-oss-20b'),
        schema: z.object({
            search_text: z.string().optional().describe('anything search like business name, beverages, food, pizza, bakery, etc'),
            search_address: z.string().optional().describe('anything about address like street name, city, zip code, landmark, etc'),
            lat: z.number().optional().describe('only latitude'),
            long: z.number().optional().describe('only longitude'),
        }),

    })

    await saveSearchCache(key, object)
    return searchBusinesses(object)


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
    const { object } = await generateObject({
        model: groq('openai/gpt-oss-20b'),
        system: `User query would be for real estate data finder. like "looking for a buying house in 2.5k in riverview with three bedrooms" sometime it would be only few things, so if there is nothing to add in value just pass null or -1. Answer in json only nothing else. 
        Strucutre Mapping values: 'sale' cateogry match these words (buy, sale, purcahse, get), 'rent' category match these words (rent, lease), 'land' category match these words (land, plot), 'multi' category match these words (multi, duplex, triplex), 'commercial' category match these words (commercial, office, shop), 'commercial-lease' category match these words (commercial-lease, office-lease, shop-lease)
        About Address: some would type "area", "place", "city", "county", "state", "country" or "zip" so you have to find the address from these words, not include these words in address
        Style: some would type "flat", "banglow", "house", "villa", "condo", "traditional", "split level", "colonial", "contemporary", "modern", "ranch", "cottage", "victorian", "mediterranean", "craftsman"
        Mapped Style: 'flat' match these words (flat, apartment), 'banglow' match these words (banglow, house), 'villa' match these words (villa, mansion), 'condo' match these words (condo, condominium), 'traditional' match these words (traditional, classic), 'split level' match these words (split level, split-level), 'colonial' match these words (colonial, colonial-style), 'contemporary' match these words (contemporary, modern), 'ranch' match these words (ranch, ranch-style), 'cottage' match these words (cottage, cottage-style), 'victorian' match these words (victorian, victorian-style), 'mediterranean' match these words (mediterranean, mediterranean-style), 'craftsman' match these words (craftsman, craftsman-style)
        Latitude and Longitude: if user provide latitude and longitude then use latitude and longitude, and skip all addresses
        `,
        schema: z.object({
            category: z.enum(['sale', 'rent', 'land', 'multi', 'commercial', 'commercial-lease']).default('sale'),
            address: z.string().optional().nullable(),
            price: z.number().int().optional().nullable(),
            bedrooms: z.number().int().optional().nullable(),
            style: z.enum(['flat', 'banglow', 'villa', 'condo', 'traditional', 'split level', 'colonial', 'contemporary', 'modern', 'ranch', 'cottage', 'victorian', 'mediterranean', 'craftsman']).optional().nullable(),
            sqft: z.number().int().optional().nullable(),
            lat: z.number().optional().nullable(),
            long: z.number().optional().nullable(),
        }),
        prompt: question + (lat && long ? ` Latitude:(${lat}, Longitude: ${long})` : '')
    })
    // logger.log(object)
    await saveSearchCache(key, object, "realty")
    return object
}
export const getMLSApiToken = async (force = false) => {

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
        return await getMLSApiToken(true); // Retry if failed
    }

    const { access_token, expires_in } = await response.json();
    if (!access_token) {
        return await getMLSApiToken(true); // Retry if no token received
    }

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

        let response = await fetch(`${baseUrl}/${url}`, {
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${access_token}`,
            },
            next: { revalidate: expires_in },
        });

        if (response.status === 401 && retry) {
            logger.warn("[API] Token expired, retrying...");
            const fresh = await getMLSApiToken(true);
            access_token = fresh.access_token;
            expires_in = fresh.expires_in;
            response = await fetch(`${baseUrl}/${url}`, {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${access_token}`,
                },
                next: { revalidate: expires_in },
            });
        }

        if (!response.ok) throw new Error(`MLS fetch failed: ${response.status}`);

        const json = await response.json();

        // Fetch images
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

        return json;
    } catch (err) {
        console.error("[fetchMLS] Error:", err);
        return { value: [] };
    }
};

export const postData = async (body) => {
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
      
      Thanks
      ${body.firstname} ${body.lastname}`,
        }
    const post = {
        properties: {
            email: body.email,
            firstname: body.firstname,
            lastname: body.lastname,
            phone: body.phone
        },
    }

    const data = await apiHubSpotNewContact(body.email, post)

    if (data.hasOwnProperty("status") && data.status === "error") {
        return { data: data.message, status: 400 }
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

    const { results } = await res.json()

    return results.find((e) => e.email.match("info@baltimoredirections.com")).id
}
const apiHubSpotCreateTask = async (contactId, task) => {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
            , "Authorization": `Bearer ${env("HUBSPOT_API_KEY")}`
        },
        body: JSON.stringify({
            properties: {
                hs_timestamp: new Date(),
                hs_task_body: task.body,
                hubspot_owner_id: await apiHubSpotOwnerId(),
                hs_task_subject: task.subject,
                hs_task_status: "WAITING",
                hs_task_priority: "HIGH",
            },
        }),
        redirect: "follow",
    }

    const res = await fetch(
        `https://api.hubapi.com/crm/v3/objects/tasks`,
        options
    )

    const { id } = await res.json()

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
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
            , "Authorization": `Bearer ${env("HUBSPOT_API_KEY")}`
        },
        body: JSON.stringify({
            properties: {
                hs_timestamp: new Date(),
                hubspot_owner_id: await apiHubSpotOwnerId(),
                hs_meeting_title: meeting.subject,
                hs_meeting_body: meeting.body,
                hs_internal_meeting_notes: meeting.remarks,
                hs_meeting_external_url: "",
                hs_meeting_location: "OnSite",
                hs_meeting_start_time: meeting.start,
                hs_meeting_end_time: meeting.end,
                hs_meeting_outcome: "SCHEDULED",
            },
        }),
        redirect: "follow",
    }

    const res = await fetch(
        `https://api.hubapi.com/crm/v3/objects/meetings`,
        options
    )

    const { id } = await res.json()
    // logger.log(
    //     "meeting put",
    //     `https://api.hubapi.com/crm/v3/objects/meetings/${id}/associations/contact/${contactId}/meetings_to_contact`
    // )
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

export async function getBlogPosts(){
    const { data, error } = await supabase
        .from('posts')
        .select('title,slug,created_at')    
        .eq('site', process.env.NEXT_PUBLIC_SLUG)
        .eq('status', true)
    // logger.log('getAllPosts Query Executed at:', new Date().toISOString());
    if (error) {
        console.error('Error fetching all posts:', error);
        return [];
    }
    return data;
}

export async function getSingleBlogPost(slug){
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('site', process.env.NEXT_PUBLIC_SLUG)
        .eq('slug', slug)
        .eq('status', true)
        .single()
    // logger.log('getSinglePost Query Executed at:', new Date().toISOString());
    if (error) {
        console.error('Error fetching single post:', error);
        return null;
    }
    return data;

}

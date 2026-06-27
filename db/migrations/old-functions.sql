CREATE OR REPLACE FUNCTION public.business_category(p_state text, p_counties text[], p_category_id integer, p_items_per_page integer, p_page integer DEFAULT 1)
 RETURNS TABLE(id bigint, slug text, title text, description text, address text, address_info jsonb, city text, county text, state text, zip text, latitude double precision, longitude double precision, rating jsonb, rating_value numeric, main_image text, domain text, phone text, logo text, url text, total_photos integer, snippet text, categories text[], subcategories text[])
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.slug,
        b.title,
        b.description,
        b.address,
        b.address_info,
        b.city,
        b.county,
        b.state,
        b.zip,
        b.latitude,
        b.longitude,
        b.rating,
        CASE 
            WHEN b.rating IS NULL OR b.rating->>'value' IS NULL THEN 0
            ELSE (b.rating->>'value')::NUMERIC
        END AS rating_value,
        b.main_image,
        b.domain,
        b.phone,
        b.logo,
        b.url,
        b.total_photos,
        b.snippet,
        array_agg(c.name) AS categories,
        array_agg(sc.name) AS subcategories
    FROM 
        public.businesses b
    LEFT JOIN 
        public.categories c ON c.id = b.category_id
    LEFT JOIN 
        public.subcategories sc ON sc.id = ANY(b.subcategories_id)
    WHERE 
        b.category_id = p_category_id
        AND LOWER(b.state) = LOWER(p_state)
        AND LOWER(b.county) = ANY(p_counties)
    GROUP BY 
        b.id
    ORDER BY 
        rating_value DESC  
    LIMIT p_items_per_page OFFSET (p_page - 1) * p_items_per_page;
END;
$function$

CREATE OR REPLACE FUNCTION public.business_category_count(p_state text, p_counties text[], p_category_id integer)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.businesses b
    WHERE b.category_id = p_category_id
      AND LOWER(b.state) = LOWER(p_state)
      AND LOWER(b.county) = ANY(p_counties)  -- Correct array comparison
  );
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
CREATE OR REPLACE FUNCTION public.business_location(p_state text, p_counties text[], p_city text DEFAULT NULL::text, p_zip text DEFAULT NULL::text, p_items_per_page integer DEFAULT 20, p_page integer DEFAULT 1)
 RETURNS TABLE(id bigint, slug text, title text, description text, address text, address_info jsonb, city text, county text, state text, zip text, latitude double precision, longitude double precision, rating jsonb, rating_value numeric, main_image text, domain text, phone text, logo text, url text, total_photos integer, snippet text, categories text[], subcategories text[])
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.slug,
    b.title,
    b.description,
    b.address,
    b.address_info,
    b.city,
    b.county,
    b.state,
    b.zip,
    b.latitude,
    b.longitude,
    b.rating,
    CASE 
      WHEN b.rating IS NULL OR b.rating->>'value' IS NULL THEN 0
      ELSE (b.rating->>'value')::NUMERIC
    END AS rating_value,
    b.main_image,
    b.domain,
    b.phone,
    b.logo,
    b.url,
    b.total_photos,
    b.snippet,
    array_agg(DISTINCT c.name) AS categories,
    array_agg(DISTINCT sc.name) AS subcategories
  FROM 
    public.businesses b
  LEFT JOIN public.categories c ON c.id = b.category_id
  LEFT JOIN public.subcategories sc ON sc.id = ANY(b.subcategories_id)
  WHERE 
    b.state_lower = p_state
    AND b.county_lower = ANY(p_counties)
    AND (p_city IS NULL OR b.city_lower = p_city)
    AND (p_zip IS NULL OR b.zip = p_zip)
  GROUP BY b.id
  ORDER BY rating_value DESC
  LIMIT p_items_per_page
  OFFSET (p_page - 1) * p_items_per_page;
END;
$function$
                                                                                        
CREATE OR REPLACE FUNCTION public.business_location_count(p_state text, p_counties text[], p_city text DEFAULT NULL::text, p_zip text DEFAULT NULL::text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.businesses b
    WHERE 
      b.state_lower = p_state
      AND b.county_lower = ANY(p_counties)
      AND (p_city IS NULL OR b.city_lower = p_city)
      AND (p_zip IS NULL OR b.zip = p_zip)
  );
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
CREATE OR REPLACE FUNCTION public.business_location_sitemap(p_state text, p_counties text[], p_items_per_page integer DEFAULT 1000, p_page integer DEFAULT 1)
 RETURNS TABLE(id bigint, slug text, title text, rating_value numeric)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.slug,
    b.title,
    b.rating_value
  FROM businesses b
  WHERE b.state_lower = lower(p_state)
    AND b.county_lower = ANY(p_counties)
  ORDER BY b.rating_value DESC
  LIMIT p_items_per_page OFFSET (p_page - 1) * p_items_per_page;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
CREATE OR REPLACE FUNCTION public.business_subcategories(p_state text, p_counties text[], p_subcategory_id integer, p_items_per_page integer, p_page integer DEFAULT 1)
 RETURNS TABLE(id bigint, slug text, title text, description text, address text, address_info jsonb, city text, county text, state text, zip text, latitude double precision, longitude double precision, rating jsonb, rating_value numeric, main_image text, domain text, phone text, logo text, url text, total_photos integer, snippet text, categories text[], subcategories text[])
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.slug,
        b.title,
        b.description,
        b.address,
        b.address_info,
        b.city,
        b.county,
        b.state,
        b.zip,
        b.latitude,
        b.longitude,
        b.rating,  -- Return the full rating as JSONB
        -- Extract and convert the rating value to NUMERIC, with default 0 if NULL
        CASE 
            WHEN b.rating IS NULL OR b.rating->>'value' IS NULL THEN 0  -- If rating or value is NULL, return 0
            ELSE (b.rating->>'value')::NUMERIC  -- Otherwise, extract and cast to NUMERIC
        END AS rating_value,
        b.main_image,
        b.domain,
        b.phone,
        b.logo,
        b.url,
        b.total_photos,
        b.snippet,
        array_agg(c.name) AS categories,
        array_agg(sc.name) AS subcategories
    FROM 
        public.businesses b
    LEFT JOIN 
        public.categories c ON c.id = b.category_id
    LEFT JOIN 
        public.subcategories sc ON sc.id = ANY(b.subcategories_id)
    WHERE 
        b.subcategories_id @> ARRAY[p_subcategory_id]
        AND LOWER(b.state) = LOWER(p_state)
        AND LOWER(b.county) = ANY(p_counties)
    GROUP BY 
        b.id
    ORDER BY 
        rating_value DESC  -- Order by the numeric rating value
    LIMIT p_items_per_page OFFSET (p_page - 1) * p_items_per_page;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
CREATE OR REPLACE FUNCTION public.business_subcategories_count(p_state text, p_counties text[], p_subcategory_id integer)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.businesses b
    WHERE b.subcategories_id @> ARRAY[p_subcategory_id]
      AND LOWER(b.state) = LOWER(p_state)
      AND LOWER(b.county) = ANY(p_counties)  -- Correct array comparison
  );
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
CREATE OR REPLACE FUNCTION public.count_businesses_extra(p_state text, p_county text[], p_category_name text DEFAULT NULL::text, p_subcategory_name text DEFAULT NULL::text, p_city text DEFAULT NULL::text, p_zip text DEFAULT NULL::text)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_cache_key text;
  v_cached_count integer;
  v_last_updated timestamptz;
  v_count integer;
BEGIN
  -- Create a unique cache key from params (concatenating them)
  v_cache_key := p_state || '|' || array_to_string(p_county, ',') || '|' ||
                 COALESCE(p_category_name, '') || '|' ||
                 COALESCE(p_subcategory_name, '') || '|' ||
                 COALESCE(p_city, '') || '|' ||
                 COALESCE(p_zip, '');

  -- Check cache table
  SELECT total_count, last_updated
  INTO v_cached_count, v_last_updated
  FROM business_count_cache_table
  WHERE cache_key = v_cache_key;

  -- If cache exists and is fresh (less than 7 days old), return it
  IF FOUND AND v_last_updated > NOW() - INTERVAL '7 days' THEN
    RETURN v_cached_count;
  END IF;

  -- Else — run fresh count query
  SELECT COUNT(*)
  INTO v_count
  FROM public.businesses b
  LEFT JOIN public.categories c ON b.category_id = c.id
  LEFT JOIN public.subcategories s ON s.id = ANY(b.subcategories_id)
  WHERE b.state_lower = p_state
    AND b.county_lower = ANY(p_county)
    AND (p_category_name IS NULL OR LOWER(c.name) = p_category_name)
    AND (p_city IS NULL OR b.city_lower = p_city)
    AND (p_zip IS NULL OR b.zip = p_zip)
    AND (p_subcategory_name IS NULL OR LOWER(s.name) = p_subcategory_name);

  -- Insert/update cache table
  INSERT INTO business_count_cache_table (cache_key, total_count, last_updated)
  VALUES (v_cache_key, v_count, NOW())
  ON CONFLICT (cache_key) DO UPDATE
  SET total_count = EXCLUDED.total_count,
      last_updated = EXCLUDED.last_updated;

  -- Return fresh count
  RETURN v_count;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
CREATE OR REPLACE FUNCTION public.get_best_rated_business(p_cat_name text DEFAULT NULL::text, p_rating_value numeric DEFAULT 4.8, p_default_state text DEFAULT 'maryland'::text, p_county_filters text[] DEFAULT NULL::text[])
 RETURNS TABLE(id bigint, slug text, title text, description text, address text, address_info jsonb, city text, county text, state text, zip text, latitude double precision, longitude double precision, rating jsonb, rating_value numeric, main_image text, domain text, phone text, logo text, url text, total_photos integer, snippet text, categories text[])
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.slug,
    b.title,
    b.description,
    b.address,
    b.address_info,
    b.city,
    b.county,
    b.state,
    b.zip,
    b.latitude,
    b.longitude,
    b.rating,
    b.rating_value,  -- ✅ Now using the numeric rating_value column
    b.main_image,
    b.domain,
    b.phone,
    b.logo,
    b.url,
    b.total_photos,
    b.snippet,
    array_agg(c.name) AS categories
  FROM 
    public.businesses b
  LEFT JOIN 
    public.categories c ON c.id = b.category_id
  WHERE 
    LOWER(b.state) = LOWER(p_default_state)
    AND b.county IS NOT NULL
    AND b.category_id IS NOT NULL
    AND b.rating_value >= p_rating_value  -- ✅ Using numeric field directly
    AND (p_cat_name IS NULL OR LOWER(c.name) LIKE LOWER('%' || p_cat_name || '%'))
    AND (p_county_filters IS NULL OR LOWER(b.county) = ANY(ARRAY(SELECT unnest(p_county_filters))))
  GROUP BY 
    b.id
  ORDER BY 
    b.rating_value DESC,  -- ✅ Corrected order by numeric field
    (b.rating->>'votes_count')::int DESC  -- ✅ Ordering by votes count
  LIMIT 6;
END;
$function$

CREATE OR REPLACE FUNCTION public.get_businesses_extra(p_state text, p_county text[], p_category_name text DEFAULT NULL::text, p_subcategory_name text DEFAULT NULL::text, p_city text DEFAULT NULL::text, p_zip text DEFAULT NULL::text, p_page integer DEFAULT 1, p_limit integer DEFAULT 21)
 RETURNS TABLE(id bigint, title text, description text, slug text, category text, subcategories text[], address text, city text, state text, county text, zip text, latitude double precision, longitude double precision, rating jsonb, rating_value numeric, main_image text, domain text, phone text, logo text, url text, total_photos integer, snippet text)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  WITH filtered_businesses AS (
    SELECT 
      b.*
    FROM public.businesses b
    LEFT JOIN public.categories c ON b.category_id = c.id
    WHERE b.state_lower = p_state
      AND b.county_lower = ANY(p_county)
      AND (p_category_name IS NULL OR LOWER(c.name) = p_category_name)
      AND (p_city IS NULL OR b.city_lower = p_city)
      AND (p_zip IS NULL OR b.zip = p_zip)
    ORDER BY b.rating_value DESC
    OFFSET (p_page - 1) * p_limit
    LIMIT p_limit
  )
  SELECT
    fb.id,
    fb.title,
    fb.description,
    fb.slug,
    c.name AS category,
    COALESCE(sub.subcategories, '{}') AS subcategories,
    fb.address,
    fb.city,
    fb.state,
    fb.county,
    fb.zip,
    fb.latitude,
    fb.longitude,
    fb.rating,
    fb.rating_value,
    fb.main_image,
    fb.domain,
    fb.phone,
    fb.logo,
    fb.url,
    fb.total_photos,
    fb.snippet
  FROM filtered_businesses fb
  LEFT JOIN public.categories c ON fb.category_id = c.id
  LEFT JOIN LATERAL (
    SELECT ARRAY_AGG(DISTINCT s.name) AS subcategories
    FROM public.subcategories s
    WHERE s.id = ANY(fb.subcategories_id)
      AND (p_subcategory_name IS NULL OR LOWER(s.name) = p_subcategory_name)
  ) sub ON TRUE;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
CREATE OR REPLACE FUNCTION public.get_businesses_extra_type(p_state text, p_county text[], p_type text, p_category_name text DEFAULT NULL::text, p_subcategory_name text DEFAULT NULL::text, p_city text DEFAULT NULL::text, p_zip text DEFAULT NULL::text, p_minimum integer DEFAULT 5)
 RETURNS TABLE(name text, total_records integer, featured boolean)
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_state text := LOWER(p_state);
    v_city text := LOWER(p_city);
    v_category text := LOWER(p_category_name);
    v_subcategory text := LOWER(p_subcategory_name);
BEGIN
    -- ✅ Location-based queries
    IF p_type = 'location' THEN
        -- ✅ Get unique city names
        IF p_city IS NULL THEN
            RETURN QUERY 
            SELECT 
                LOWER(b.city) AS name, 
                COUNT(DISTINCT b.id)::INT AS total_records,  
                NULL::boolean AS featured
            FROM public.businesses b
            LEFT JOIN public.categories c ON b.category_id = c.id
            WHERE LOWER(b.state) = v_state
                AND LOWER(b.county) = ANY(p_county)
                AND b.city IS NOT NULL
                AND (p_category_name IS NULL OR LOWER(c.name) = v_category) 
                AND (p_subcategory_name IS NULL OR EXISTS (
                    SELECT 1 FROM public.subcategories s 
                    WHERE s.id = ANY(b.subcategories_id) 
                    AND LOWER(s.name) = v_subcategory
                ))
            GROUP BY b.city
            HAVING COUNT(DISTINCT b.id) > p_minimum  
            ORDER BY total_records DESC;

        -- ✅ Get unique zip codes
        ELSIF p_city IS NOT NULL AND p_zip IS NULL THEN
            RETURN QUERY 
            SELECT 
                b.zip AS name, 
                COUNT(DISTINCT b.id)::INT AS total_records,  
                NULL::boolean AS featured
            FROM public.businesses b
            LEFT JOIN public.categories c ON b.category_id = c.id
            WHERE LOWER(b.state) = v_state
                AND LOWER(b.county) = ANY(p_county)
                AND LOWER(b.city) = v_city 
                AND b.zip IS NOT NULL
                AND (p_category_name IS NULL OR LOWER(c.name) = v_category) 
                AND (p_subcategory_name IS NULL OR EXISTS (
                    SELECT 1 FROM public.subcategories s 
                    WHERE s.id = ANY(b.subcategories_id) 
                    AND LOWER(s.name) = v_subcategory
                ))
            GROUP BY b.zip
            HAVING COUNT(DISTINCT b.id) > p_minimum  
            ORDER BY total_records DESC;
        END IF;

    -- ✅ Category-based queries
    ELSIF p_type = 'category' THEN
        -- ✅ Get unique category names
        IF p_category_name IS NULL THEN
            RETURN QUERY 
            SELECT 
                LOWER(c.name) AS name, 
                COUNT(DISTINCT b.id)::INT AS total_records,  
                c.featured AS featured
            FROM public.businesses b
            LEFT JOIN public.categories c ON b.category_id = c.id
            WHERE LOWER(b.state) = v_state
                AND LOWER(b.county) = ANY(p_county)
                AND c.name IS NOT NULL
                AND (p_city IS NULL OR LOWER(b.city) = v_city) 
                AND (p_zip IS NULL OR b.zip = p_zip) 
            GROUP BY c.name, c.featured
            HAVING COUNT(DISTINCT b.id) > p_minimum
            ORDER BY 
                c.featured DESC NULLS LAST,  
                total_records DESC;

        -- ✅ Get unique subcategory names
        ELSIF p_category_name IS NOT NULL THEN
            RETURN QUERY 
            SELECT 
                LOWER(s.name) AS name, 
                COUNT(DISTINCT b.id)::INT AS total_records,  
                NULL::boolean AS featured
            FROM public.businesses b
            JOIN public.subcategories s ON s.id = ANY(b.subcategories_id)
            LEFT JOIN public.categories c ON b.category_id = c.id
            WHERE LOWER(b.state) = v_state
                AND LOWER(b.county) = ANY(p_county)
                AND LOWER(c.name) = v_category
                AND s.name IS NOT NULL
                AND (p_city IS NULL OR LOWER(b.city) = v_city) 
                AND (p_zip IS NULL OR b.zip = p_zip) 
            GROUP BY s.name
            HAVING COUNT(DISTINCT b.id) > p_minimum
            ORDER BY total_records DESC;
        END IF;
    END IF;
END;
$function$

CREATE OR REPLACE FUNCTION public.search_businesses(p_state text, p_county text[], p_search_text text DEFAULT NULL::text, p_search_address text DEFAULT NULL::text, p_lat double precision DEFAULT NULL::double precision, p_long double precision DEFAULT NULL::double precision)
 RETURNS TABLE(id bigint, slug text, title text, description text, category_name text, subcategories text[], address text, city text, state text, county text, zip text, latitude double precision, longitude double precision, rating jsonb, rating_value numeric, main_image text, domain text, phone text, logo text, url text, total_photos integer, snippet text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY 
  SELECT 
    b.id, b.slug, b.title, b.description, 
    c.name AS category_name,
    ARRAY(
      SELECT s.name 
      FROM public.subcategories s 
      WHERE s.id = ANY(b.subcategories_id)
    ) AS subcategories,
    b.address, 
    b.city, 
    b.state, 
    b.county, 
    b.zip, 
    b.latitude, 
    b.longitude, 
    b.rating, 
    b.rating_value, 
    b.main_image, 
    b.domain, 
    b.phone, 
    b.logo, 
    b.url, 
    b.total_photos, 
    b.snippet
  FROM public.businesses b
  LEFT JOIN public.categories c ON b.category_id = c.id
  WHERE 
    b.state_lower = p_state
    AND b.county_lower = ANY(p_county)
    AND (
      -- Full-text search on precomputed `slug_tsv`
      (p_search_text IS NOT NULL AND b.slug_tsv @@ plainto_tsquery('english', p_search_text))
      OR
      -- Address, city_lower, zip search via ILIKE / trigram
      (p_search_address IS NOT NULL AND (
        b.address ILIKE '%' || p_search_address || '%' 
        OR b.city_lower ILIKE '%' || p_search_address || '%' 
        OR b.zip ILIKE '%' || p_search_address || '%'
      ))
      OR
      -- Geolocation search using PostGIS (if lat & long provided)
      (p_lat IS NOT NULL AND p_long IS NOT NULL AND
        ST_DWithin(
          b.geo_point::geography,
          ST_SetSRID(ST_MakePoint(p_long, p_lat), 4326)::geography,
          2000 -- meters
        )
      )
    )
  ORDER BY b.rating_value DESC
  LIMIT 100;
END;
$function$
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
CREATE OR REPLACE FUNCTION public.search_businesses2(p_state text, p_county text[], p_search_text text DEFAULT NULL::text, p_search_address text DEFAULT NULL::text, p_lat double precision DEFAULT NULL::double precision, p_long double precision DEFAULT NULL::double precision)
 RETURNS TABLE(id bigint, slug text, title text, description text, category_name text, subcategories text[], address text, city text, state text, county text, zip text, latitude double precision, longitude double precision, rating jsonb, rating_value numeric, main_image text, domain text, phone text, logo text, url text, total_photos integer, snippet text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY 
  SELECT 
    b.id, b.slug, b.title, b.description, 
    c.name AS category_name,
    ARRAY(
      SELECT s.name 
      FROM public.subcategories s 
      WHERE s.id = ANY(b.subcategories_id)
    ) AS subcategories,
    b.address, 
    b.city, 
    b.state, 
    b.county, 
    b.zip, 
    b.latitude, 
    b.longitude, 
    b.rating, 
    b.rating_value, 
    b.main_image, 
    b.domain, 
    b.phone, 
    b.logo, 
    b.url, 
    b.total_photos, 
    b.snippet
  FROM public.businesses b
  LEFT JOIN public.categories c ON b.category_id = c.id
  WHERE 
    b.state_lower = p_state
    AND b.county_lower = ANY(p_county)
    AND (
      -- Full-text search on precomputed `slug_tsv`
      (p_search_text IS NOT NULL AND b.slug_tsv @@ plainto_tsquery('english', p_search_text))
      OR
      -- Address, city_lower, zip search via ILIKE / trigram
      (p_search_address IS NOT NULL AND (
        b.address ILIKE '%' || p_search_address || '%' 
        OR b.city_lower ILIKE '%' || p_search_address || '%' 
        OR b.zip ILIKE '%' || p_search_address || '%'
      ))
      OR
      -- Geolocation search using PostGIS (if lat & long provided)
      (p_lat IS NOT NULL AND p_long IS NOT NULL AND
        ST_DWithin(
          b.geo_point::geography,
          ST_SetSRID(ST_MakePoint(p_long, p_lat), 4326)::geography,
          2000 -- meters
        )
      )
    )
  ORDER BY b.rating_value DESC
  LIMIT 100;
END;
$function$

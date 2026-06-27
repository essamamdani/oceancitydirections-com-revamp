-- Update get_businesses_extra to prioritize claimed_approval
CREATE OR REPLACE FUNCTION get_businesses_extra(
  p_state text,
  p_county text[],
  p_category_name text DEFAULT NULL,
  p_subcategory_name text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_zip text DEFAULT NULL,
  p_page integer DEFAULT 1,
  p_limit integer DEFAULT 21
)
RETURNS TABLE(
  id bigint,
  title text,
  description text,
  slug text,
  category text,
  subcategories text[],
  address text,
  city text,
  state text,
  county text,
  zip text,
  latitude double precision,
  longitude double precision,
  rating jsonb,
  rating_value numeric,
  main_image text,
  domain text,
  phone text,
  logo text,
  url text,
  total_photos integer,
  snippet text
)
LANGUAGE plpgsql
AS $$
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
      AND b.status = true
      AND b.deleted_at IS NULL
    ORDER BY 
      COALESCE(b.claimed_approval, false) DESC,
      b.rating_value DESC NULLS LAST
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
$$;

-- Update business_category to prioritize claimed_approval
CREATE OR REPLACE FUNCTION business_category(
  p_state text,
  p_counties text[],
  p_category_id integer,
  p_items_per_page integer,
  p_page integer DEFAULT 1
)
RETURNS TABLE(
  id bigint, 
  slug text, 
  title text, 
  description text, 
  address text, 
  address_info jsonb, 
  city text, 
  county text, 
  state text, 
  zip text, 
  latitude double precision, 
  longitude double precision, 
  rating jsonb, 
  rating_value numeric, 
  main_image text, 
  domain text, 
  phone text, 
  logo text, 
  url text, 
  total_photos integer, 
  snippet text, 
  categories text[], 
  subcategories text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
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
        AND b.status = true
        AND b.deleted_at IS NULL
    GROUP BY 
        b.id
    ORDER BY 
        COALESCE(b.claimed_approval, false) DESC,
        rating_value DESC  
    LIMIT p_items_per_page OFFSET (p_page - 1) * p_items_per_page;
END;
$$;

-- Update business_location to prioritize claimed_approval
CREATE OR REPLACE FUNCTION business_location(
  p_state text,
  p_counties text[],
  p_city text DEFAULT NULL,
  p_zip text DEFAULT NULL,
  p_items_per_page integer DEFAULT 20,
  p_page integer DEFAULT 1
)
RETURNS TABLE(
  id bigint, 
  slug text, 
  title text, 
  description text, 
  address text, 
  address_info jsonb, 
  city text, 
  county text, 
  state text, 
  zip text, 
  latitude double precision, 
  longitude double precision, 
  rating jsonb, 
  rating_value numeric, 
  main_image text, 
  domain text, 
  phone text, 
  logo text, 
  url text, 
  total_photos integer, 
  snippet text, 
  categories text[], 
  subcategories text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
    AND b.status = true
    AND b.deleted_at IS NULL
  GROUP BY b.id
  ORDER BY 
    COALESCE(b.claimed_approval, false) DESC,
    rating_value DESC
  LIMIT p_items_per_page
  OFFSET (p_page - 1) * p_items_per_page;
END;
$$;

-- Update business_subcategories to prioritize claimed_approval
CREATE OR REPLACE FUNCTION business_subcategories(
  p_state text,
  p_counties text[],
  p_subcategory_id integer,
  p_items_per_page integer,
  p_page integer DEFAULT 1
)
RETURNS TABLE(
  id bigint, 
  slug text, 
  title text, 
  description text, 
  address text, 
  address_info jsonb, 
  city text, 
  county text, 
  state text, 
  zip text, 
  latitude double precision, 
  longitude double precision, 
  rating jsonb, 
  rating_value numeric, 
  main_image text, 
  domain text, 
  phone text, 
  logo text, 
  url text, 
  total_photos integer, 
  snippet text, 
  categories text[], 
  subcategories text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
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
        b.subcategories_id @> ARRAY[p_subcategory_id]
        AND LOWER(b.state) = LOWER(p_state)
        AND LOWER(b.county) = ANY(p_counties)
        AND b.status = true
        AND b.deleted_at IS NULL
    GROUP BY 
        b.id
    ORDER BY 
        COALESCE(b.claimed_approval, false) DESC,
        rating_value DESC
    LIMIT p_items_per_page OFFSET (p_page - 1) * p_items_per_page;
END;
$$;

-- Update search_businesses to prioritize claimed_approval (WITH GEO LOGIC RESTORED)
CREATE OR REPLACE FUNCTION search_businesses(
  p_state text,
  p_county text[],
  p_search_text text DEFAULT NULL,
  p_search_address text DEFAULT NULL,
  p_lat double precision DEFAULT NULL,
  p_long double precision DEFAULT NULL
)
RETURNS TABLE(
  id bigint, 
  slug text, 
  title text, 
  description text, 
  category_name text, 
  subcategories text[], 
  address text, 
  city text, 
  state text, 
  county text, 
  zip text, 
  latitude double precision, 
  longitude double precision, 
  rating jsonb, 
  rating_value numeric, 
  main_image text, 
  domain text, 
  phone text, 
  logo text, 
  url text, 
  total_photos integer, 
  snippet text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
    AND b.status = true
    AND b.deleted_at IS NULL
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
  ORDER BY 
    COALESCE(b.claimed_approval, false) DESC,
    b.rating_value DESC
  LIMIT 100;
END;
$$;

-- Update search_businesses2 (same as search_businesses)
CREATE OR REPLACE FUNCTION search_businesses2(
  p_state text,
  p_county text[],
  p_search_text text DEFAULT NULL,
  p_search_address text DEFAULT NULL,
  p_lat double precision DEFAULT NULL,
  p_long double precision DEFAULT NULL
)
RETURNS TABLE(
  id bigint, 
  slug text, 
  title text, 
  description text, 
  category_name text, 
  subcategories text[], 
  address text, 
  city text, 
  state text, 
  county text, 
  zip text, 
  latitude double precision, 
  longitude double precision, 
  rating jsonb, 
  rating_value numeric, 
  main_image text, 
  domain text, 
  phone text, 
  logo text, 
  url text, 
  total_photos integer, 
  snippet text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
    AND b.status = true
    AND b.deleted_at IS NULL
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
  ORDER BY 
    COALESCE(b.claimed_approval, false) DESC,
    b.rating_value DESC
  LIMIT 100;
END;
$$;

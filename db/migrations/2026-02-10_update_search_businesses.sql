DROP FUNCTION public.search_businesses;
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
      (p_search_text IS NOT NULL AND (
        -- Full text search (keeping original logic)
        b.slug_tsv @@ plainto_tsquery('english', p_search_text)
        OR 
        -- Partial match on title (handles wildcard and "half business" searches)
        b.title ILIKE '%' || replace(p_search_text, '*', '') || '%'
      ))
      OR
      (p_search_address IS NOT NULL AND (
        b.address ILIKE '%' || p_search_address || '%' 
        OR b.city_lower ILIKE '%' || p_search_address || '%' 
        OR b.zip ILIKE '%' || p_search_address || '%'
      ))
      OR
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

CREATE OR REPLACE FUNCTION get_businesses_sorted(
  p_state text,
  p_county text[],
  p_category_name text DEFAULT NULL,
  p_subcategory_name text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_zip text DEFAULT NULL,
  p_page int DEFAULT 1,
  p_limit int DEFAULT 20
)
RETURNS SETOF json
LANGUAGE plpgsql
AS $$
DECLARE
  v_offset int;
BEGIN
  v_offset := (p_page - 1) * p_limit;

  RETURN QUERY
  SELECT row_to_json(t)
  FROM (
    SELECT 
      b.*,
      (SELECT row_to_json(c) FROM (SELECT name FROM categories WHERE id = b.category_id) c) as categories,
      (SELECT json_agg(row_to_json(s)) FROM (SELECT name FROM subcategories WHERE id = ANY(b.subcategories_id)) s) as subcategories
    FROM businesses b
    LEFT JOIN categories cat ON b.category_id = cat.id
    WHERE b.state_lower = p_state
      AND (p_county IS NULL OR b.county_lower = ANY(p_county))
      AND (p_category_name IS NULL OR lower(cat.name) = lower(p_category_name))
      AND (
        p_subcategory_name IS NULL OR 
        EXISTS (
          SELECT 1 FROM subcategories sub 
          WHERE sub.id = ANY(b.subcategories_id) 
          AND lower(sub.name) = lower(p_subcategory_name)
        )
      )
      AND (p_city IS NULL OR b.city_lower = p_city)
      AND (p_zip IS NULL OR b.zip = p_zip)
      AND b.status = true
      AND b.deleted_at IS NULL
    ORDER BY 
      COALESCE(b.claimed_approval, false) DESC,
      b.rating_value DESC NULLS LAST,
      b.id DESC
    LIMIT p_limit
    OFFSET v_offset
  ) t;
END;
$$;

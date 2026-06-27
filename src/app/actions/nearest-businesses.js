// Data fetching utility for nearest businesses
// NOT a Server Action - called during Server Component render
import { getSupabaseAdmin } from '@/utils/supabase/admin';

export async function getNearestBusinesses(site, county, city, category, limit = 6) {
  try {
    if (!site || !site.StateLowerCase) return [];

    const adminClient = await getSupabaseAdmin();

    let query = adminClient
      .from('businesses')
      .select('id, title, slug, update_slug, address, city, state, county_lower, phone, main_image, categories(name)')
      .eq('state_lower', site.StateLowerCase)
      .eq('status', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Strict county filter: prefer the specific county, else limit to this site's counties only
    if (county) {
      query = query.eq('county_lower', decodeURIComponent(county).toLowerCase().replace(/-/g, ' '));
    } else if (site.DefaultCounties?.length > 0) {
      // Never show businesses from other counties/sites as "nearby"
      query = query.in('county_lower', site.DefaultCounties);
    }

    if (category) {
      query = query.ilike('categories.name', `%${decodeURIComponent(category)}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching nearest businesses:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Error in getNearestBusinesses:', err);
    return [];
  }
}

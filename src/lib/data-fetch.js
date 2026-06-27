// Data fetching utilities - NO 'use server'
// These can be called during Server Component render
import { getSourceDb } from '@/lib/source-db';
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
            
            const approvedClaims = new Set((claimRes.rows || []).map(r => r.business_id));
            return businesses.map(b => ({
                ...b,
                is_claimed: approvedClaims.has(b.id),
                claimed_status: approvedClaims.has(b.id) ? 'approved' : b.claimed_status || null,
            }));
        }
    } catch (err) {
        console.error('Error enhancing businesses with claim status:', err);
    }
    return businesses;
};

export const getSubcategoriesByIDs = async (subcategoriesIds) => {
    const { query } = await import('@/lib/db');
    const res = await query(
        `SELECT * FROM subcategories WHERE id = ANY($1::int[]);`,
        [subcategoriesIds]
    );
    return res.rows;
};

export const getBusiness = async (site, slug) => {
    if (!slug || !site) return null;
    
    const { supabaseAdmin } = await import('@/utils/supabase/admin');
    const adminClient = await supabaseAdmin();
    
    const defaultState = site.State.toLowerCase();
    const defaultCounties = site.DefaultCounties;
    const defaultShortState = site.ShortState;
    
    const countyFilters = defaultCounties?.map((county) => `county_lower.eq.${county.toLowerCase()}`).join(',');
    
    const baseFilter = (query) =>
        query
            .eq('state_lower', site.StateLowerCase)
            .eq('status', true)
            .is('deleted_at', null);
    
    const normalizedSlug = decodeAndLowercase(slug);
    
    try {
        const { data: claimData, error: claimError } = await adminClient
            .from('business_submissions')
            .select('*,categories(id,name,image)')
            .or(`update_slug.eq.${normalizedSlug},slug.eq.${normalizedSlug}`)
            .eq('status', true)
            .order('created_at', { ascending: false })
            .limit(1);
        
        if (claimData && claimData.length > 0) {
            return claimData[0];
        }
    } catch (e) {
        console.error('Error fetching claim business:', e);
    }
    
    try {
        const { data, error } = await baseFilter(adminClient
            .from('businesses')
            .select('*,categories(id,name,image,featured)')
            .or(`update_slug.eq.${normalizedSlug},slug.eq.${normalizedSlug}`)
            .limit(1)
        );
        
        if (data && data.length > 0) {
            const enhanced = await enhanceBusinessesWithClaimStatus(data);
            return enhanced[0];
        }
    } catch (e) {
        console.error('Error fetching business:', e);
    }
    
    return null;
};

// ... (truncated for brevity - all the data fetching functions)

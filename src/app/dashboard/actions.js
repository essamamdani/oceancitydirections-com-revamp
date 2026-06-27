'use server';

import { getSupabaseAdmin } from '@/utils/supabase/admin';
import { query } from '@/lib/db';
import { cookies, headers } from 'next/headers';
import { getSourceDb } from '@/lib/source-db';
import { validateEmail, validatePhone, formatPhoneForDb, isValidUSState } from '@/lib/validation';

import { getLiveSiteId } from '@/lib/getLiveSiteId';
import slugify from 'slugify';

function generateBusinessSlug(title, address) {
  let cleanAddress = address.replace(/,?\s*(?:USA|United States)\s*$/i, '');
  cleanAddress = cleanAddress.replace(/,\s*[^,]*\s+County,/gi, ',');
  const slugTitle = slugify(title, { lower: true, strict: true });
  const slugAddress = slugify(cleanAddress, { lower: true, strict: true });
  return `${slugTitle}--${slugAddress}`;
}

function normalizeState(state) {
  if (!state) return null;
  if (state.length === 2) {
    const US_STATES_FULL = {
      AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
      CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
      HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
      KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
      MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
      MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
      NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
      OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
      SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
      VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
      DC: 'District of Columbia'
    };
    return US_STATES_FULL[state.toUpperCase()] || state;
  }
  return state;
}

// Helper to get user in Server Actions
async function getActionUser() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('auth-token');
    const token = tokenCookie ? tokenCookie.value : null;

    if (!token) return null;

    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'https://auth.realtydirections.com';
    
    // We can extract origin from headers
    const headersList = await headers();
    const origin = headersList.get('origin') || 'https://oceancitydirections-com-private.vercel.app';

    const response = await fetch(`${authUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Origin': origin,
      },
      cache: 'no-store',
    });

    if (!response.ok) return null;

    const data = await response.json();
    // Handle both { id, email } and { user: { id, email } } response shapes
    const user = (data && data.id) ? data : (data?.user || null);
    if (!user || !user.id) return null;

    if (user.emailVerified === false || user.email_verified === false) {
        return { ...user, _blocked: true, error: 'email_not_verified' };
    }

    return user;
  } catch (error) {
    console.error('[getActionUser] Error verifying session:', error);
    return null;
  }
}

// 1. Get Business Data for Editing (Secure Server Action)
export async function getBusinessForEdit(businessId) {
    try {
        const user = await getActionUser();
        if (!user || user._blocked) {
            return { error: 'Unauthorized' };
        }

        const dynamicAdmin = await getSupabaseAdmin();
        if (!dynamicAdmin) return { error: 'Database connection failed' };

        const { data, error } = await dynamicAdmin
            .from("businesses")
            .select("*")
            .eq("id", businessId)
            .is("deleted_at", null)
            .single();

        if (error || !data) {
            return { error: 'Business not found or access denied' };
        }

        return { data };
    } catch (e) {
        console.error('getBusinessForEdit error:', e);
        return { error: 'Internal Server Error' };
    }
}

// 2. Submit Claim / Edit Business
export async function saveBusinessEditAction(payload) {
    try {
        const { business_id, proposed_data = {}, proposed_update_slug = null } = payload || {};

        if (proposed_data.email && !validateEmail(proposed_data.email)) {
            return { error: 'Invalid email address' };
        }
        if (proposed_data.phone && !validatePhone(proposed_data.phone)) {
            return { error: 'Invalid phone number. Must be 10 digits.' };
        }

        const requiredFields = ['address', 'city', 'state', 'zip', 'lat', 'long'];
        const missingFields = requiredFields.filter(field => !proposed_data[field]);

        if (missingFields.length > 0) {
            return { error: `Missing required fields: ${missingFields.join(', ')}` };
        }

        if (proposed_data.phone) {
            proposed_data.phone = formatPhoneForDb(proposed_data.phone);
        }

        const user = await getActionUser();
        if (!user || user._blocked) return { error: 'Unauthorized' };
        if (!business_id) return { error: 'Missing business_id' };

        const claimer_user_id = user.id;

        const dynamicAdmin = await getSupabaseAdmin();
        if (!dynamicAdmin) return { error: 'Database connection failed' };

        const { data: businessCheck, error: businessCheckError } = await dynamicAdmin
            .from('businesses')
            .select('*')
            .eq('id', business_id)
            .is('deleted_at', null)
            .single();

        if (businessCheckError || !businessCheck) {
            return { error: 'Failed to verify business status or business has been deleted.' };
        }

        if (businessCheck.claimed_approval && businessCheck.claimed_by && businessCheck.claimed_by !== claimer_user_id) {
            return { error: 'This business is already claimed and approved by another user.' };
        }

        // Check if user is already an approved owner (used later for sibilings logic)
        let isOwner = false;
        try {
            const ownerCheckRes = await query(`
                SELECT s.id FROM sibilings s
                JOIN claim_businesses c ON s.claim_id = c.id
                WHERE s.business_id = $1 AND c.claimer_user_id = $2 AND c.status = 'approved'
                LIMIT 1
            `, [business_id, claimer_user_id]);
            if (ownerCheckRes.rows.length > 0) {
                isOwner = true;
            }
        } catch (err) {
            console.error('Error checking ownership status:', err);
        }

        let existingClaim;
        try {
            const checkRes = await query(`
                SELECT id, status FROM claim_businesses 
                WHERE business_id = $1 AND claimer_user_id = $2 
                AND status IN ('pending', 'under_review')
                ORDER BY created_at DESC
                LIMIT 1
            `, [business_id, claimer_user_id]);
            existingClaim = checkRes.rows[0];
        } catch (sqlErr) {
            return { error: 'Failed to check existing claim' };
        }

        try {
            // ALWAYS INSERT new row - never update existing pending claim
            // This preserves edit history (each edit = new row)
            const sourceDb = await getSourceDb();
            
            const headersList = await headers();
            const host = headersList.get('host') || 'unknown';
            const liveSiteId = await getLiveSiteId(host);
            
            const claimRes = await query(`
              INSERT INTO claim_businesses (business_id, claimer_user_id, proposed_data, status, source_db, source_state, live_site_id, created_at, updated_at)
              VALUES ($1, $2, $3, 'pending', $4, $5, $6, NOW(), NOW())
              RETURNING id
            `, [business_id, claimer_user_id, JSON.stringify(proposed_data), sourceDb, host, liveSiteId || proposed_data.live_site_id || null]);
            
            const newClaimId = claimRes.rows[0]?.id;
            
            // Create Relation in sibilings table immediately (only for first-time claims, not edits by owners)
            if (newClaimId && !isOwner) {
                await query(`
                  INSERT INTO sibilings (business_id, claim_id) 
                  VALUES ($1, $2)
                  ON CONFLICT (claim_id) DO NOTHING
                `, [business_id, newClaimId]);
            }
        } catch (saveErr) {
            return { error: 'Failed to save claim to auth database' };
        }

        return { success: true };
    } catch (e) {
        console.error('saveBusinessEditAction error:', e);
        return { error: 'Internal Server Error' };
    }
}

// 3. Add New Business
export async function addBusinessAction(formData) {
    try {
        if (formData.email && !validateEmail(formData.email)) {
             return { error: 'Invalid email address' };
        }
        if (formData.phone && !validatePhone(formData.phone)) {
             return { error: 'Invalid phone number. Must be 10 digits.' };
        }

        const requiredFields = ['address', 'city', 'state', 'zip', 'lat', 'long'];
        const missingFields = requiredFields.filter(field => !formData[field]);
        
        if (missingFields.length > 0) {
            return { error: `Missing required fields: ${missingFields.join(', ')}` };
        }

        if (formData.state && !isValidUSState(formData.state)) {
             return { error: 'Invalid location. Only businesses in the USA are accepted.' };
        }

        if (formData.phone) {
            formData.phone = formatPhoneForDb(formData.phone);
        }

        const user = await getActionUser();
        if (!user || user._blocked) return { error: 'Unauthorized' };

        const sourceDb = await getSourceDb();

        try {
            const headersList = await headers();
            const host = headersList.get('host') || 'unknown';
            const liveSiteId = await getLiveSiteId(host);
            
            // 1. Insert into claim_businesses (central auth DB)
            const claimRes = await query(`
                INSERT INTO claim_businesses (claimer_user_id, status, proposed_data, source_db, source_state, live_site_id, type, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, 'new', NOW(), NOW())
                RETURNING id
            `, [user.id, 'pending', JSON.stringify(formData), sourceDb, host, liveSiteId || formData.live_site_id || null]);

            const newClaimId = claimRes.rows[0]?.id;

            // Create Relation in sibilings table (business_id is null for new businesses)
            if (newClaimId) {
                await query(`
                    INSERT INTO sibilings (business_id, claim_id) 
                    VALUES (NULL, $1)
                    ON CONFLICT (claim_id) DO NOTHING
                `, [newClaimId]);
            }

            // 2. Insert into state DB businesses table immediately with status = false
            const dynamicAdmin = await getSupabaseAdmin();
            if (!dynamicAdmin) throw new Error('Database connection failed');

            const { category, cover_image, email, website, video_url, video_id, video_thumbnail, ...restFormData } = formData;
            
            if (!restFormData.category_id && category) {
                const { data: catData } = await dynamicAdmin
                    .from('categories')
                    .select('id')
                    .ilike('name', category)
                    .single();
                if (catData) {
                    restFormData.category_id = catData.id;
                }
            }

            if (restFormData.lat) {
                restFormData.latitude = restFormData.lat;
                delete restFormData.lat;
            }
            if (restFormData.long) {
                restFormData.longitude = restFormData.long;
                delete restFormData.long;
            }

            const title = formData.title || 'Untitled Business';
            const address = formData.address || '';
            const slug = generateBusinessSlug(title, address);
            const state = normalizeState(formData.state);

            const newBusiness = {
                ...restFormData,
                url: restFormData.url || website,
                main_image: restFormData.main_image || cover_image,
                state: state,
                slug: slug,
                is_claimed: true,
                status: false
            };

            const { data: insertedBusiness, error: insertError } = await dynamicAdmin
                .from('businesses')
                .insert(newBusiness)
                .select()
                .single();

            if (insertError) {
                console.error('[addBusinessAction] State DB insert error:', insertError);
            } else if (insertedBusiness) {
                const businessId = insertedBusiness.id;
                
                // Update claim with business_id
                await query(`
                    UPDATE claim_businesses 
                    SET business_id = $1, updated_at = NOW()
                    WHERE id = $2
                `, [businessId, newClaimId]);

                // Update sibilings with business_id
                await query(`
                    UPDATE sibilings 
                    SET business_id = $1, updated_at = NOW()
                    WHERE claim_id = $2
                `, [businessId, newClaimId]);

                // 3. If video exists, update the video record with business slug + title/description/location
                if (video_url && formData.video_id) {
                    await query(`
                        UPDATE videos 
                        SET p_id_b_slug = $1, 
                            source_business_slug = $2,
                            business_db = $3, 
                            siteurl = $4,
                            embeded_for = 'business',
                            title = $6,
                            description = $7,
                            video_location = $8
                        WHERE id = $5
                    `, [slug, slug, sourceDb, host, formData.video_id, title, formData.description || '', address]);
                }
            }

            // HubSpot integration
            try {
                const { fetchSiteConfigByDomain } = await import('@/lib/site-config');
                const { getSiteName } = await import('@/lib/helper');
                const siteConfig = await fetchSiteConfigByDomain(host);
                const siteName = siteConfig ? getSiteName(siteConfig) : 'Realty Directions';
                const { pushBusinessSubmissionLead } = await import('@/lib/actions');
                
                await pushBusinessSubmissionLead({
                    email: user.email,
                    full_name: user.full_name || user.name || '',
                    phone: user.phone || formData.phone || '',
                    site_name: siteName,
                    business_title: formData.title,
                    business_address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`,
                    submission_data: formData
                });
            } catch (hsError) {
                console.error('[HubSpot] Dashboard business submission error:', hsError);
            }

        } catch (sqlError) {
            console.error('addBusinessAction sqlError:', sqlError);
            return { error: 'Failed to submit business to database' };
        }

        return { success: true };
    } catch (error) {
        console.error('addBusinessAction error:', error);
        return { error: 'Internal server error' };
    }
}

// Helper: Detect if ID is UUID format
function isUUID(id) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

// 4. Get Submission For Edit
export async function getSubmissionForEdit(submissionId) {
    try {
        const user = await getActionUser();
        if (!user || user._blocked) return { error: 'Unauthorized' };

        let res;

        if (isUUID(submissionId)) {
            // UUID = claim_businesses (new submissions)
            res = await query(`
                SELECT *, proposed_data as submission_data FROM claim_businesses 
                WHERE id = $1 AND claimer_user_id = $2 AND type = 'new'
            `, [submissionId, user.id]);
        } else {
            // Integer ID = business_submissions (legacy)
            res = await query(`
                SELECT * FROM business_submissions 
                WHERE id = $1 AND user_id = $2
            `, [submissionId, user.id]);
        }

        if (res.rows.length === 0) {
            return { error: 'Submission not found' };
        }

        return { data: res.rows[0] };
    } catch (error) {
        console.error('[getSubmissionForEdit] error:', error);
        return { error: 'Internal server error' };
    }
}

// 5. Update Submission
export async function updateSubmissionAction(submissionId, formData) {
    try {
        const user = await getActionUser();
        if (!user || user._blocked) return { error: 'Unauthorized' };

        let res;
        let isClaimBusiness = false;

        if (isUUID(submissionId)) {
            // UUID = claim_businesses (new submissions)
            res = await query(`
                SELECT *, proposed_data as submission_data FROM claim_businesses 
                WHERE id = $1 AND claimer_user_id = $2 AND type = 'new'
            `, [submissionId, user.id]);
            isClaimBusiness = true;
        } else {
            // Integer ID = business_submissions (legacy)
            res = await query(`
                SELECT * FROM business_submissions 
                WHERE id = $1 AND user_id = $2
            `, [submissionId, user.id]);
        }

        if (res.rows.length === 0) {
            return { error: 'Submission not found' };
        }

        const existing = res.rows[0];

        if (existing.status !== 'pending') {
            return { error: 'Cannot edit non-pending submission' };
        }

        if (isClaimBusiness) {
            await query(`
                UPDATE claim_businesses 
                SET proposed_data = $1, updated_at = NOW()
                WHERE id = $2
            `, [JSON.stringify(formData), submissionId]);
        } else {
            await query(`
                UPDATE business_submissions 
                SET submission_data = $1, updated_at = NOW()
                WHERE id = $2
            `, [JSON.stringify(formData), submissionId]);
        }

        return { success: true };
    } catch (error) {
        console.error('[updateSubmissionAction] error:', error);
        return { error: 'Internal server error' };
    }
}

// 6. Get User Information & Removal Requests
export async function getUserRequestsAction() {
    try {
        const user = await getActionUser();
        if (!user || user._blocked) return { error: 'Unauthorized' };

        const res = await query(`
            SELECT id, business_id, name, email, phone, remarks, status, type, created_at, source_db
            FROM business_request_info 
            WHERE user_id = $1
            ORDER BY created_at DESC
        `, [user.id]);

        const requests = res.rows || [];
        
        // Enrich with business titles from respective local DBs
        const requestsByDb = {};
        for (const req of requests) {
            const db = req.source_db || 'md';
            if (!requestsByDb[db]) requestsByDb[db] = [];
            requestsByDb[db].push(req);
        }

        let businessesMap = {};

        for (const [db, dbRequests] of Object.entries(requestsByDb)) {
            const businessIds = [...new Set(dbRequests.map(r => r.business_id).filter(Boolean))];
            if (businessIds.length === 0) continue;

            try {
                // Directly fetch the state DB credentials from Auth DB
                const dbRes = await query(`
                    SELECT supabase_url, supabase_service_key 
                    FROM state_databases 
                    WHERE LOWER(state_code) = $1 OR LOWER(state_name) = $1
                    LIMIT 1
                `, [db]);

                if (dbRes.rows.length > 0) {
                    const { createClient } = require('@supabase/supabase-js');
                    const creds = dbRes.rows[0];
                    const localClient = createClient(creds.supabase_url, creds.supabase_service_key);

                    const { data: businesses } = await localClient
                        .from('businesses')
                        .select('id, title')
                        .in('id', businessIds);

                    businesses?.forEach(b => {
                        businessesMap[b.id] = b;
                    });
                }
            } catch (err) {
                console.error(`Error fetching business details for requests in db ${db}:`, err);
            }
        }
        
        const enrichedRequests = requests.map(req => ({
            ...req,
            business: businessesMap[req.business_id] || null
        }));

        return { data: enrichedRequests };
    } catch (error) {
        console.error('[getUserRequestsAction] error:', error);
        return { error: 'Internal server error' };
    }
}

// 8. Get All Approved Businesses for User
export async function getUserApprovedBusinessesAction() {
    try {
        const user = await getActionUser();
        if (!user || user._blocked) return { error: 'Unauthorized' };

        // Get only APPROVED businesses linked via sibilings table for this user
        // Use DISTINCT ON to get the most recent approved claim per business
        const res = await query(`
            SELECT DISTINCT ON (s.business_id) s.business_id, c.* 
            FROM sibilings s
            JOIN claim_businesses c ON s.claim_id = c.id
            WHERE c.claimer_user_id = $1 AND c.status = 'approved'
            ORDER BY s.business_id, s.created_at DESC
        `, [user.id]);

        const approvedClaims = res.rows || [];
        if (approvedClaims.length === 0) return { data: [] };

        // Also fetch approved submissions (new businesses added by user)
        const subRes = await query(`
            SELECT * FROM claim_businesses
            WHERE claimer_user_id = $1 AND status = 'approved' AND type = 'new'
            ORDER BY created_at DESC
        `, [user.id]);
        
        const approvedSubmissions = subRes.rows || [];

        // Group by source_db to query respective local databases
        const claimsByDb = {};
        for (const claim of approvedClaims) {
            const db = claim.source_db || 'md';
            if (!claimsByDb[db]) claimsByDb[db] = [];
            claimsByDb[db].push(claim);
        }

        const finalBusinesses = [];
        const foundBusinessIds = new Set();
        
        for (const [db, claims] of Object.entries(claimsByDb)) {
            const businessIds = claims.map(c => c.business_id).filter(Boolean);
            if (businessIds.length === 0) continue;

            try {
                // Directly fetch the state DB credentials from Auth DB
                const dbRes = await query(`
                    SELECT supabase_url, supabase_service_key 
                    FROM state_databases 
                    WHERE LOWER(state_code) = $1 OR LOWER(state_name) = $1
                    LIMIT 1
                `, [db]);

                if (dbRes.rows.length > 0) {
                    const { createClient } = require('@supabase/supabase-js');
                    const creds = dbRes.rows[0];
                    const localClient = createClient(creds.supabase_url, creds.supabase_service_key);

                    const { data: businesses } = await localClient
                        .from('businesses')
                        .select('*')
                        .in('id', businessIds)
                        .is('deleted_at', null);

                    if (businesses) {
                        businesses.forEach(b => {
                            foundBusinessIds.add(b.id);
                            // Find the corresponding claim to determine source
                            const claim = claims.find(c => c.business_id === b.id);
                            finalBusinesses.push({
                                ...b,
                                _claim: claim // Attach claim data for source distinction
                            });
                        });
                    }
                }
            } catch (err) {
                console.error(`Error fetching businesses for db ${db}:`, err);
            }
        }

        // Fallback: For any approved claims whose business was NOT found in state DBs
        // (e.g., VideoHomes businesses), create business object from proposed_data
        for (const claim of approvedClaims) {
            if (claim.business_id && !foundBusinessIds.has(claim.business_id)) {
                const pd = claim.proposed_data || {};
                finalBusinesses.push({
                    id: claim.business_id,
                    title: pd.title || 'Untitled Business',
                    slug: pd.slug || '',
                    address: pd.address || '',
                    city: pd.city || '',
                    state: pd.state || '',
                    zip: pd.zip || '',
                    phone: pd.phone || '',
                    description: pd.description || '',
                    main_image: pd.main_image || '',
                    logo: pd.logo || '',
                    county: pd.county || '',
                    latitude: pd.lat || pd.latitude || '',
                    longitude: pd.long || pd.longitude || '',
                    _claim: claim,
                    _fallback: true // Mark as fallback data
                });
            }
        }

        // Add approved submissions (new businesses) that don't have business_id yet
        // These are pending admin approval to be inserted into state DB
        for (const sub of approvedSubmissions) {
            const pd = sub.proposed_data || {};
            // Only add if not already added via business_id
            if (sub.business_id && foundBusinessIds.has(sub.business_id)) continue;
            
            finalBusinesses.push({
                id: sub.id, // Use claim ID as business ID for submissions without business_id
                title: pd.title || 'New Business Submission',
                slug: pd.slug || '',
                address: pd.address || '',
                city: pd.city || '',
                state: pd.state || '',
                zip: pd.zip || '',
                phone: pd.phone || '',
                description: pd.description || '',
                main_image: pd.main_image || '',
                logo: pd.logo || '',
                county: pd.county || '',
                latitude: pd.lat || pd.latitude || '',
                longitude: pd.long || pd.longitude || '',
                _claim: sub,
                _fallback: true,
                _submission: true
            });
        }

        // Fetch video thumbnails from videos table by source_business_slug
        const allSlugs = finalBusinesses
            .flatMap(b => [b.slug, b.update_slug].filter(Boolean));

        if (allSlugs.length > 0) {
            try {
                const videoRes = await query(
                    `SELECT DISTINCT ON (source_business_slug) source_business_slug, thumbnail, video_url, video_id, is_video_approved
                     FROM videos
                     WHERE source_business_slug = ANY($1)
                     ORDER BY source_business_slug, created_at DESC`,
                    [allSlugs]
                );
                const videoMap = {};
                for (const v of videoRes.rows) {
                    videoMap[v.source_business_slug] = v;
                }
                finalBusinesses.forEach(b => {
                    const vid = videoMap[b.update_slug] || videoMap[b.slug];
                    if (vid) b._video = vid;
                });
            } catch (err) {
                console.error('[getUserApprovedBusinessesAction] video fetch error:', err);
            }
        }

        return { data: finalBusinesses };
    } catch (error) {
        console.error('[getUserApprovedBusinessesAction] error:', error);
        return { error: 'Internal server error' };
    }
}

// 7. Submit Pending Info/Removal Request

export async function submitPendingRequestAction(payload) {
    try {
        const user = await getActionUser();
        if (!user || user._blocked) return { error: 'Unauthorized' };

        const { businessId, type, name, email, phone, remarks, reason } = payload;
        
        if (!businessId || !type) return { error: 'Missing required fields' };

        const sourceDb = await getSourceDb();
        
        const headersList = await headers();
        const host = headersList.get('host') || 'unknown';
        const liveSiteId = await getLiveSiteId(host);

        await query(`
            INSERT INTO business_request_info (
                business_id, name, email, phone, remarks, status, type, source_db, source_state, user_id, live_site_id, created_at
            ) VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7, $8, $9, $10, NOW())
        `, [
            businessId, 
            name, 
            email, 
            phone, 
            remarks || reason || '', 
            type,
            sourceDb,
            host,
            user.id,
            liveSiteId
        ]);

        return { success: true };
    } catch (error) {
        console.error('[submitPendingRequestAction] error:', error);
        return { error: 'Internal server error' };
    }
}


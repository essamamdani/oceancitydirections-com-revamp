import { createClient } from '@supabase/supabase-js'
import { getSupabaseAdmin as getDynamicAdmin } from '@/lib/helper'

export async function getSupabaseAdmin() {
  try {
      const admin = await getDynamicAdmin();
      if (!admin) throw new Error('Supabase admin dynamic lookup failed');
      return admin;
  } catch (e) {
      console.error('[SupabaseAdmin] Dynamic lookup failed:', e.message);
      throw e;
  }
}

// Proxy for sync-like access
export const supabaseAdmin = new Proxy({}, {
  get(_, prop) {
     throw new Error('Supabase admin sync proxy is deprecated due to multi-tenant async requirement. Use await getSupabaseAdmin() instead.');
  }
});

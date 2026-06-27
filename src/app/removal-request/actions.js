"use server";

import { createClient } from "@supabase/supabase-js";

export async function fetchBusinessForRemoval(id, site) {
  if (!id || !site?.db?.url || !site?.db?.anon_key) {
    return { error: "Missing required parameters" };
  }

  const supabase = createClient(site.db.url, site.db.anon_key);
  const { data, error } = await supabase
    .from("businesses")
    .select("id, title, city, state")
    .eq("id", id)
    .single();

  if (error || !data) {
    return { error: "Business not found" };
  }

  return { data };
}

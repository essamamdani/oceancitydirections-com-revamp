import { NextResponse } from 'next/server'
import logger from '@/lib/logger'
import { getSourceDb } from '@/lib/source-db'
import { query } from '@/lib/db'
import { verifyTurnstileToken } from '@/lib/turnstile'
import { fetchSiteConfigByDomain } from '@/lib/site-config'

export async function POST(request) {
  try {
    const body = await request.json()
    const { 
      firstname, 
      lastname, 
      email, 
      phone, 
      address, 
      remarks, 
      site_name, 
      full_url, 
      cf_token,
      task,
      meeting
    } = body || {}

    // --- SECURITY: Turnstile Verification ---
    const host = request.headers.get('host') || 'unknown'
    let siteConfig = null;
    try {
      siteConfig = await fetchSiteConfigByDomain(host)
    } catch (configErr) {
      logger.warn('Could not fetch site config for Turnstile, using default:', configErr)
    }
    
    const turnstileSecret = siteConfig?.turnstile_secret_key || process.env.TURNSTILE_SECRET_KEY
    const isHuman = await verifyTurnstileToken(cf_token, turnstileSecret)
    if (!isHuman) {
      return NextResponse.json({ error: "Security verification failed. Please try again." }, { status: 403 })
    }

    // Validate required fields
    if (!firstname || !lastname || !email) {
      return NextResponse.json({ error: 'First name, last name, and email are required.' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    // Validate phone (if provided) - must be 10 digits
    let cleanedPhone = null
    if (phone) {
      cleanedPhone = phone.replace(/\D/g, '')
      if (cleanedPhone.length !== 10) {
        return NextResponse.json({ error: 'Please enter a valid 10-digit US phone number.' }, { status: 400 })
      }
    }

    const fullName = `${firstname} ${lastname}`.trim()
    const sourceDb = await getSourceDb(host)
    const liveSiteId = request.headers.get('x-live-site-id') || null

    // Save to Central Auth DB
    try {
      await query(`
        INSERT INTO property_leads (
          name, email, phone, site_name, source_db, source_state, 
          live_site_id, created_at, full_url, property_address, 
          notes, wants_call, wants_meeting
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9, $10, $11, $12)
      `, [
        fullName, 
        email, 
        cleanedPhone, 
        site_name || 'Property Lead', 
        sourceDb, 
        host,
        liveSiteId,
        full_url || null,
        address || null,
        remarks || null,
        task || false,
        meeting || false
      ])
    } catch (dbError) {
      console.error('Error saving property lead to Auth DB:', dbError)
      return NextResponse.json({ error: 'Failed to save lead. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Lead submitted successfully.' })
  } catch (error) {
    console.error('Form submission API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

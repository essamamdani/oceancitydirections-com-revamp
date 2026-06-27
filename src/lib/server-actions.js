'use server';
import logger from '@/lib/logger'
import { getSourceDb } from '@/lib/source-db'
import { query } from '@/lib/db'
import { verifyTurnstileToken } from '@/lib/turnstile'

export async function postData(data) {
    try {
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
        } = data || {}

        // --- SECURITY: Turnstile Verification ---
        const isHuman = await verifyTurnstileToken(cf_token, process.env.TURNSTILE_SECRET_KEY)
        if (!isHuman) {
            return { status: 403, data: 'Security verification failed. Please try again.' }
        }

        // Validate required fields
        if (!firstname || !lastname || !email) {
            return { status: 400, data: 'First name, last name, and email are required.' }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return { status: 400, data: 'Please enter a valid email address.' }
        }

        // Validate phone (if provided) - must be 10 digits
        let cleanedPhone = null
        if (phone) {
            cleanedPhone = phone.replace(/\D/g, '')
            if (cleanedPhone.length !== 10) {
                return { status: 400, data: 'Please enter a valid 10-digit US phone number.' }
            }
        }

        const fullName = `${firstname} ${lastname}`.trim()
        
        // Extract host from full_url
        let host = 'unknown'
        try {
            if (full_url) {
                const url = new URL(full_url)
                host = url.host
            }
        } catch (e) {
            logger.warn('Could not parse full_url:', full_url)
        }
        
        const sourceDb = await getSourceDb(host)

        // Save to Central Auth DB directly (no internal API call)
        // NOTE: Only use columns that exist in property_leads table
        try {
            await query(`
                INSERT INTO property_leads (
                    name, email, phone, site_name, source_db, source_state, 
                    created_at, full_url, notes, wants_call, wants_meeting
                ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8, $9, $10)
            `, [
                fullName, 
                email, 
                cleanedPhone, 
                site_name || 'Property Lead', 
                sourceDb, 
                host,
                full_url || null,
                remarks || null,
                task || false,
                meeting || false
            ])
        } catch (dbError) {
            const errorDetails = dbError?.message || dbError?.detail || String(dbError);
            logger.error('Error saving property lead to Auth DB:', errorDetails);
            return { status: 500, data: `Failed to save lead: ${errorDetails}` };
        }

        return { success: true, status: 200, data: 'Lead submitted successfully.' }
    } catch (error) {
        logger.error('Error in postData:', error)
        return { status: 500, data: 'An error occurred' }
    }
}

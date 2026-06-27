-- Central Auth Database Schema (Frontend & Tenant)
-- Repository: oceancitydirections-com-private

-- Auth & Users (Subset for Frontend)
CREATE TABLE IF NOT EXISTS "user" (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    "emailVerified" BOOLEAN DEFAULT FALSE,
    name TEXT,
    image TEXT,
    role TEXT DEFAULT 'consumer',
    site TEXT DEFAULT 'oceancity',
    metadata JSONB DEFAULT '{}',
    username VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    website VARCHAR(500),
    company_name VARCHAR(255),
    company_logo VARCHAR(500),
    bio TEXT
);

CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    "expiresAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

-- Site Configuration
CREATE TABLE IF NOT EXISTS live_sites (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    url TEXT NOT NULL,
    counties TEXT,
    state VARCHAR(100) NOT NULL,
    short_state VARCHAR(10) NOT NULL,
    include_realty BOOLEAN DEFAULT FALSE,
    ga_analytics_id VARCHAR(50),
    analytics_id VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    hero_image TEXT,
    site_name VARCHAR(255),
    logo TEXT,
    counties_jsonb JSONB DEFAULT '[]',
    states_jsonb JSONB DEFAULT '[]',
    hero_images JSONB DEFAULT '[]',
    center JSONB,
    zoom INTEGER DEFAULT 8,
    coordinate JSONB,
    extra JSONB DEFAULT '{"font_size": 12}',
    state_database_id INTEGER,
    turnstile_site_key TEXT,
    turnstile_secret_key TEXT
);

CREATE TABLE IF NOT EXISTS state_databases (
    id SERIAL PRIMARY KEY,
    state_code VARCHAR NOT NULL,
    supabase_url VARCHAR NOT NULL,
    supabase_anon_key TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Business Submissions & Requests
CREATE TABLE IF NOT EXISTS business_submissions (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE,
    user_id TEXT,
    status VARCHAR(50),
    submission_data JSONB,
    source_db TEXT DEFAULT 'md',
    live_site_id TEXT
);

CREATE TABLE IF NOT EXISTS claim_businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE,
    business_id INTEGER,
    claimer_user_id TEXT,
    proposed_data JSONB,
    status VARCHAR(50),
    source_db TEXT DEFAULT 'md',
    live_site_id TEXT,
    type VARCHAR(20) DEFAULT 'claim'
);

CREATE TABLE IF NOT EXISTS sibilings (
    id SERIAL PRIMARY KEY,
    business_id INTEGER,
    claim_id UUID REFERENCES claim_businesses(id) ON DELETE CASCADE,
    submission_id INTEGER REFERENCES business_submissions(id) ON DELETE CASCADE,
    UNIQUE(claim_id),
    UNIQUE(submission_id)
);

CREATE TABLE IF NOT EXISTS business_request_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE,
    business_id INTEGER,
    name VARCHAR,
    email VARCHAR,
    phone VARCHAR,
    remarks TEXT,
    status VARCHAR,
    type VARCHAR,
    source_db TEXT DEFAULT 'md',
    live_site_id TEXT
);

CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    source_db TEXT,
    site_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    live_site_id TEXT
);

CREATE TABLE IF NOT EXISTS search_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    slug TEXT,
    extract_object JSONB,
    type TEXT DEFAULT 'business',
    site_slug TEXT,
    listing_pages BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS property_leads (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    name VARCHAR,
    email VARCHAR,
    phone VARCHAR,
    site_name VARCHAR,
    source_db VARCHAR,
    live_site_id TEXT,
    full_url TEXT
);

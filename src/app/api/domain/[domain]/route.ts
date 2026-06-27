import { NextResponse } from 'next/server';


export async function GET(
  request: Request,
  { params }: { params: Promise<{ domain: string }> }
) {
  try {
    const { domain } = await params;
    
    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    const cleanDomain = domain.replace(/^www\./, '');
    
    // Proxy directly to central auth server
    const response = await fetch(`https://auth.realtydirections.com/api/domain/${cleanDomain}`, {
       headers: { 'Content-Type': 'application/json' },
       cache: 'no-store'
    });
    
    if (!response.ok) {
       console.error('Site not found for domain:', cleanDomain);
       return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }
    
    const data = await response.json();
    
    // Fetch DB credentials securely and attach to siteData for client side usage
    try {
        const dbResponse = await fetch(`https://auth.realtydirections.com/api/domain/${cleanDomain}/db`, {
            method: 'POST',
            headers: {
              'x-api-key': process.env.INTERNAL_API_KEY || '',
              'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });
        
        if (dbResponse.ok) {
            const dbCreds = await dbResponse.json();
            data.db = {
               url: dbCreds.supabase_url,
               anon_key: dbCreds.supabase_anon_key
            };
        }
    } catch(err) {
        console.error('Error fetching DB credentials via Auth DB API:', err);
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in /api/domain/[domain]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

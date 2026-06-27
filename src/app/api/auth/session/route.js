import { NextResponse } from 'next/server'

// Proxy session requests to the auth server
export async function GET(request) {
  try {
    // Get auth token from cookie or header
    const authToken = request.cookies.get('auth-token')?.value || 
                      request.headers.get('authorization')?.replace('Bearer ', '')
    
    const headers = {
      'Content-Type': 'application/json',
    }
    
    if (authToken) {
      headers['Cookie'] = `auth-token=${authToken}`
      headers['Authorization'] = `Bearer ${authToken}`
    }
    
    const response = await fetch('https://auth.realtydirections.com/api/auth/session', {
      method: 'GET',
      headers,
      credentials: 'include'
    })

    const data = await response.json()
    
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Session proxy error:', error)
    return NextResponse.json(
      { user: null, session: null },
      { status: 500 }
    )
  }
}

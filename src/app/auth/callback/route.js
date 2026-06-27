import { redirect } from 'next/navigation'

// Better Auth callback handler
// Better Auth handles session management automatically via cookies
export async function GET(request) {
  const url = new URL(request.url)
  const next = url.searchParams.get('next') ?? '/dashboard'
  
  // Better Auth automatically handles the session via cookies
  // Just redirect to the destination
  return redirect(next)
}

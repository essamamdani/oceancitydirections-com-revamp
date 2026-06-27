import { NextResponse } from 'next/server'
import { getServerUser } from '@/utils/auth/server'
import { getSlugFromDomain } from '@/lib/site-config'

export const dynamic = 'force-dynamic'
export const maxDuration = 300
export const maxBodySize = '100mb'

export async function POST(request) {
  try {
    // 1. Authenticate user on Ocean City side
    const user = await getServerUser(request)
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Get auth token from request headers
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing auth token' }, { status: 401 })
    }
    const token = authHeader.substring(7)

    // 3. Parse incoming FormData
    const incomingFormData = await request.formData()
    const videoFile = incomingFormData.get('video')
    const thumbnails = incomingFormData.get('thumbnails')
    const businessDataJson = incomingFormData.get('businessData')

    if (!videoFile) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 })
    }

    let businessData = {}
    try {
      businessData = JSON.parse(businessDataJson || '{}')
    } catch (e) {
      console.error('Failed to parse businessData:', e)
    }

    // 4. Build FormData for VideoHomes proxy-upload
    const proxyFormData = new FormData()
    proxyFormData.append('video', videoFile)
    if (thumbnails) proxyFormData.append('thumbnails', thumbnails)

    // Pass business data as extra fields
    proxyFormData.append('title', businessData.title || 'Untitled')
    proxyFormData.append('description', businessData.description || '')
    const host = request.headers.get('host') || ''
    const siteSlug = getSlugFromDomain(host) || 'oceancity'
    proxyFormData.append('source', siteSlug)
    proxyFormData.append('embeded_for', 'business')
    proxyFormData.append('p_id_b_slug', businessData.slug || '')
    proxyFormData.append('business_db', businessData.stateCode || 'md')
    proxyFormData.append('siteurl', businessData.siteUrl || '')
    proxyFormData.append('video_location', businessData.address || '')
    proxyFormData.append('category_id', String(businessData.categoryId || '1'))

    // 5. Forward to VideoHomes proxy-upload
    const VIDEOHOMES_PROXY_URL = process.env.NEXT_PUBLIC_VIDEO_HOME_URL || 'https://www.videohomes.com'
    const proxyRes = await fetch(`${VIDEOHOMES_PROXY_URL}/api/proxy-upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: proxyFormData,
    })

    const proxyData = await proxyRes.json()

    if (!proxyRes.ok || proxyData.error) {
      throw new Error(proxyData.error || proxyData.details || 'VideoHomes proxy upload failed')
    }

    return NextResponse.json({
      success: true,
      videoId: proxyData.id,
      videoUrl: proxyData.video,
      thumbnail: proxyData.thumbnails?.[0] || null,
      message: 'Video uploaded successfully. Pending admin approval.',
    })

  } catch (error) {
    console.error('Video upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload video' },
      { status: 500 }
    )
  }
}

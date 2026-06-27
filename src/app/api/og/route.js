import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);

        const hasTitle = searchParams.has('title');
        const title = hasTitle
            ? searchParams.get('title')?.slice(0, 100)
            : 'My Website';

        // Try to load Inter font from Google Fonts with a timeout
        let fontData = null;
        try {
            const fontUrl = 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff';
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            const fontResponse = await fetch(fontUrl, { signal: controller.signal });
            clearTimeout(timeout);
            if (fontResponse.ok) {
                fontData = await fontResponse.arrayBuffer();
            }
        } catch (fontError) {
            // Continue without custom font — OG image still generates with system font
            console.warn('OG font fetch failed, using fallback:', fontError.message);
        }

        const imageOptions = {
            width: 1200,
            height: 630,
            headers: {
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        };

        if (fontData) {
            imageOptions.fonts = [
                {
                    name: 'Inter',
                    data: fontData,
                    style: 'normal',
                    weight: 700,
                },
            ];
        }

        return new ImageResponse(
            (
                <div
                    style={{
                        display: "flex",
                        height: "100%",
                        width: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        background: "radial-gradient(circle at 30% 20%, #30eded 0%, #0ec6c6 40%, #221638 100%)",
                        fontFamily: fontData ? '"Inter"' : 'system-ui, sans-serif',
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                            background: "rgba(255,255,255,0.07)",
                            backdropFilter: "blur(18px)",
                            borderRadius: "28px",
                            padding: "40px 80px",
                            border: "1px solid rgba(255,255,255,0.12)",
                            maxWidth: "1000px",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                textAlign: "center",
                                fontSize: 84,
                                fontWeight: 800,
                                letterSpacing: -2,
                                backgroundImage: "linear-gradient(90deg, #ffffff, #d3ffffff)",
                                backgroundClip: "text",
                                WebkitBackgroundClip: "text",
                                color: "transparent",
                                filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.3))",
                                lineHeight: 1.1,
                            }}
                        >
                            {title}
                        </div>
                    </div>
                </div>
            ),
            imageOptions,
        );
    } catch (e) {
        console.error('OG Image generation failed:', e);
        // Return a minimal fallback image instead of a 500 error
        try {
            return new ImageResponse(
                (
                    <div
                        style={{
                            display: "flex",
                            height: "100%",
                            width: "100%",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "linear-gradient(135deg, #0ec6c6, #221638)",
                            fontFamily: 'system-ui, sans-serif',
                        }}
                    >
                        <div style={{ color: 'white', fontSize: 60, fontWeight: 700 }}>
                            Directions
                        </div>
                    </div>
                ),
                { width: 1200, height: 630 }
            );
        } catch {
            return new Response(`Failed to generate image`, { status: 500 });
        }
    }
}

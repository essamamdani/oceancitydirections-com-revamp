import logger from '@/lib/logger'

import "../../styles/animate.min.css";

import "../../styles/boxicons.min.css";
import "../../styles/flaticon.css";
import "../../styles/tailwind.css";
import 'leaflet/dist/leaflet.css';
import "swiper/css";
import "swiper/css/bundle";

// Global Style
import "../../styles/revamp.css";
import { Sora, Source_Serif_4 } from "next/font/google";
import GoTop from "@/components/Shared/GoTop";
import Script from "next/script";
import Analytics from "./analytics";
import Footer from "@/components/Layouts/Footer";
import { Providers } from "@/components/Providers";
import { fetchSiteConfigByDomain, getSiteStatus } from "@/lib/site-config";
import { headers } from 'next/headers';

const rdSans = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-rd-sans",
});

const rdSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-rd-serif",
});

export async function generateMetadata() {
  const headersList = await headers();
  const domain = headersList.get('host') || '';

  try {
    const siteConfig = await fetchSiteConfigByDomain(domain);
    let siteName = siteConfig?.site_name || siteConfig?.slug || domain.replace(/^www\./, '');
    
    if (siteName && siteName.toLowerCase() === siteConfig?.slug?.toLowerCase() && !siteName.toLowerCase().includes('directions')) {
        siteName = siteName.charAt(0).toUpperCase() + siteName.slice(1) + " Directions";
    } else if (siteName && !siteName.toLowerCase().includes('.com')) {
        siteName = siteName.charAt(0).toUpperCase() + siteName.slice(1);
    }
    
    const state = siteConfig?.state || 'your city';
    
    return {
      title: siteName,
      description: `${siteName} - ${siteName} is a platform that helps you find your way around ${state}`,
      alternates: {
        canonical: `https://${domain}`,
      },
      openGraph: {
        title: siteName,
        description: `${siteName} - Find businesses and real estate in ${state}`,
        url: `https://${domain}`,
        siteName: siteName,
        locale: 'en_US',
        type: 'website',
      },
    };
  } catch {
    // Fallback metadata
    return {
      title: domain.replace(/^www\./, ''),
      description: 'A platform that helps you find your way around',
    };
  }
}

export default async function RootLayout({ children }) {
  const headersList = await headers();
  const domain = headersList.get('host') || '';

  let siteData = null;
  let siteStatus = 'live';

  try {
    siteData = await fetchSiteConfigByDomain(domain);
    siteStatus = getSiteStatus(siteData);
  } catch (error) {
    logger.log('Layout: Using default site data for domain:', domain);
  }
  
  // Don't show footer/analytics for parked/offline pages, but ALWAYS wrap with Providers
  const isSimplePage = siteStatus === 'parked' || siteStatus === 'offline';
  
  return (
    <html lang="en">
      <head>
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_PLACES_API_KEY}&libraries=places&loading=async`}
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${rdSans.variable} ${rdSerif.variable}`} suppressHydrationWarning={true}>
        <Providers siteData={siteData}>
          {!isSimplePage && <Analytics />}
          <main>
            {children}
          </main>
          {!isSimplePage && (
            <>
              <Footer bgColor="bg-f9f9f9" />
              <GoTop />
            </>
          )}
        </Providers>
      </body>
    </html>
  );
}

'use client';
import { useSites } from '@/contexts/SitesContext';
import logger from '@/lib/logger'

import { useEffect, useState } from 'react';
import { OpenPanelComponent } from '@openpanel/nextjs';
import Script from "next/script"

import { GoogleAnalytics } from "@next/third-parties/google";

export default function AnalyticsComponent() {
  const { site, loading, error } = useSites();
  const [isClient, setIsClient] = useState(false);

  // Only render analytics on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render anything if still loading, on server, or if no site data
  if (!isClient || loading || !site) {
    return null;
  }

  // Handle error but don't crash the page
  if (error) {
    logger.warn("Analytics disabled - site data not available:", error);
    return null;
  }

  // Only render analytics if we have the required data
  if (!site['Analytics ID'] && !site['GA Analytics ID']) {
    logger.warn("Analytics disabled - missing analytics IDs");
    return null;
  }

  return (
    <>
      {site['Analytics ID'] && (
        <Script
          src="https://rybbit-n4sw8o0kswk8g80c44840084.abc.mamdaniinc.com/api/script.js"
          data-site-id={site['Analytics ID']}
          strategy="afterInteractive"
        />
        // <OpenPanelComponent
        //   clientId={site['Analytics ID']}
        //   trackScreenViews={true}
        //   trackOutgoingLinks={true}
        //   trackAttributes={true}
        //   apiUrl="https://opapi-qcwo4w0gs4kocsc0c0sg0ckk.abc.mamdaniinc.com"
        // />
      )}
      {site['GA Analytics ID'] && (
        <GoogleAnalytics gaId={site['GA Analytics ID']} />
      )}
    </>
  );
}
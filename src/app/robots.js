// src/app/robots.js
// Dynamic robots.txt generation based on domain

import { headers } from 'next/headers';
import { fetchSiteConfigByDomain, getSiteStatus } from '@/lib/site-config';

export default async function robots() {
  const headersList = await headers();
  const domain = headersList.get('host') || '';
  
  // Fetch site config to check status
  const siteConfig = await fetchSiteConfigByDomain(domain);
  const status = getSiteStatus(siteConfig);
  
  // If site is parked or offline, disallow all
  if (status === 'parked' || status === 'offline') {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }
  
  // Live site - allow all and provide sitemap
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/dashboard/'],
    },
    sitemap: `https://${domain}/sitemap.xml`,
  };
}

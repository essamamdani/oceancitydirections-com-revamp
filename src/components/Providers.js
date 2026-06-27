'use client';

import { SitesProvider } from '@/contexts/SitesContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import { initSupabaseWithSiteData } from '@/lib/helper';
import { useEffect } from 'react';

export function Providers({ children, siteData }) {
  // Initialize Supabase on the client side with data from the server
  useEffect(() => {
    initSupabaseWithSiteData(siteData);
  }, [siteData]);

  return (
    <SitesProvider data={siteData}>
      <AuthProvider>
        {children}
        <Toaster position="top-right" />
      </AuthProvider>
    </SitesProvider>
  );
}

'use client';

import { createContext, useContext, useEffect, useReducer } from 'react';
import logger from '@/lib/logger'


// Minimal fallback for build time
const initialState = {
  site: null,
  loading: true,
  error: null,
};

// Reducer function (Redux-style)
function sitesReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, site: action.payload };
    case 'FETCH_ERROR':
      logger.warn('SitesContext: Failed to fetch site data, using fallback:', action.payload);
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

// Create context
const SitesContext = createContext();

// Provider component
export function SitesProvider({ children, data }) {
  const [state, dispatch] = useReducer(sitesReducer, {
    site: data || null,
    loading: !data,
    error: null,
  });

  useEffect(() => {
    if (!data) {
      // Otherwise, fetch from Auth Public API
      const fetchSite = async () => {
        dispatch({ type: 'FETCH_START' });
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          
          let response;
          const slug = process.env.NEXT_PUBLIC_SLUG;
          if (slug) {
             response = await fetch(`https://auth.realtydirections.com/api/site/${slug}`, { signal: controller.signal });
          } else {
             const domain = typeof window !== "undefined" ? window.location.hostname.replace(/^www\./, "") : "";
             response = await fetch(`https://auth.realtydirections.com/api/domain/${domain}`, { signal: controller.signal });
          }
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const siteData = await response.json();

          // NOTE: DB credentials should NEVER be exposed to client-side JavaScript.
          // All database operations must go through server-side API routes or Server Actions.
          // The db object and window globals have been removed for security.

          dispatch({ type: 'FETCH_SUCCESS', payload: siteData });
        } catch (error) {
          dispatch({ type: 'FETCH_ERROR', payload: error.message });
        }
      };

      fetchSite();
    }
  }, [data]);

  return (
    <SitesContext.Provider value={state}>
      {children}
    </SitesContext.Provider>
  );
}

// Hook to use the context
export function useSites() {
  const context = useContext(SitesContext);
  if (!context) {
    throw new Error('useSites must be used within a SitesProvider');
  }
  return context;
}

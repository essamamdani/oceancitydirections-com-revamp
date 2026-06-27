// src/app/parked/page.jsx
// Parked domain page - Gold theme matching logo style

import { headers } from 'next/headers';
import { fetchSiteConfigByDomain } from '@/lib/site-config';
import Image from 'next/image';

export async function generateMetadata() {
  const headersList = await headers();
  const domain = headersList.get('host') || '';
  
  let siteName = domain.replace(/^www\./, '').split('.')[0];
  siteName = siteName.charAt(0).toUpperCase() + siteName.slice(1);
  if (!siteName.toLowerCase().includes('directions')) {
      siteName += " Directions";
  }

  return {
    title: `Coming Soon - ${siteName}`,
    description: 'This website will launch soon. Stay tuned!',
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function ParkedPage() {
  const headersList = await headers();
  const domain = headersList.get('host') || '';
  const cleanDomain = domain.replace(/^www\./, '');
  
  // Fetch site data for display
  const siteConfig = await fetchSiteConfigByDomain(domain);
  const siteName = siteConfig?.site_name || cleanDomain;
  
  // Logo URL from API or null if empty
  const siteLogo = siteConfig?.logo || null;
  const companyLogo = 'https://www.realtydirections.com/logo.svg';
  
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .parked-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          position: relative;
          overflow-x: hidden;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        /* Gold/Yellow accent shapes */
        .bg-shapes {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
        }
        
        .shape {
          position: absolute;
          border-radius: 50%;
          background: rgba(212, 175, 55, 0.15);
          animation: float 20s infinite ease-in-out;
        }
        
        .shape-1 {
          width: 400px;
          height: 400px;
          top: -200px;
          right: -150px;
          animation-delay: 0s;
        }
        
        .shape-2 {
          width: 300px;
          height: 300px;
          bottom: -100px;
          left: -100px;
          animation-delay: -5s;
          background: rgba(212, 175, 55, 0.1);
        }
        
        .shape-3 {
          width: 200px;
          height: 200px;
          top: 40%;
          right: 10%;
          animation-delay: -10s;
          background: rgba(212, 175, 55, 0.08);
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        
        .parked-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 60px 24px;
          max-width: 700px;
          margin: 0 auto;
          width: 100%;
          position: relative;
          z-index: 1;
        }
        
        .parked-card {
          background: rgba(255, 255, 255, 0.98);
          border-radius: 24px;
          padding: 48px 40px;
          width: 100%;
          text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
          animation: slideUp 0.6s ease-out;
          border: 2px solid rgba(212, 175, 55, 0.3);
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .parked-logo-container {
          margin-bottom: 32px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .parked-logo-container img {
          max-width: 240px;
          max-height: 80px;
          width: auto;
          height: auto;
        }
        
        .parked-loading {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 32px;
        }
        
        .parked-dot {
          width: 10px;
          height: 10px;
          background: linear-gradient(135deg, #d4af37 0%, #c9a227 100%);
          border-radius: 50%;
          animation: pulse 1.4s infinite ease-in-out both;
        }
        
        .parked-dot:nth-child(1) { animation-delay: -0.32s; }
        .parked-dot:nth-child(2) { animation-delay: -0.16s; }
        .parked-dot:nth-child(3) { animation-delay: 0s; }
        
        @keyframes pulse {
          0%, 80%, 100% { 
            transform: scale(0.6);
            opacity: 0.5;
          }
          40% { 
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .parked-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 16px;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }
        
        .parked-subtitle {
          font-size: 1.125rem;
          color: #64748b;
          margin-bottom: 12px;
          font-weight: 400;
        }
        
        .parked-domain {
          display: inline-block;
          background: linear-gradient(135deg, #d4af37 0%, #c9a227 100%);
          color: white;
          font-size: 0.875rem;
          font-weight: 600;
          padding: 10px 20px;
          border-radius: 50px;
          margin-top: 8px;
        }
        
        .parked-features {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-top: 32px;
          flex-wrap: wrap;
        }
        
        .parked-feature {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-size: 0.875rem;
        }
        
        .parked-feature svg {
          width: 20px;
          height: 20px;
          color: #d4af37;
        }
        
        .parked-footer {
          padding: 32px 24px;
          text-align: center;
          background: rgba(0, 0, 0, 0.3);
          border-top: 1px solid rgba(212, 175, 55, 0.2);
          position: relative;
          z-index: 1;
        }
        
        .parked-footer-content {
          max-width: 600px;
          margin: 0 auto;
        }
        
        .parked-footer-logo {
          margin-bottom: 16px;
          display: flex;
          justify-content: center;
        }
        
        .parked-footer-logo img {
          max-width: 160px;
          max-height: 45px;
          width: auto;
          height: auto;
          filter: brightness(0) invert(1);
          opacity: 0.9;
        }
        
        .parked-copyright {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 8px;
        }
        
        .parked-disclaimer {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          max-width: 500px;
          margin: 0 auto;
          line-height: 1.5;
        }
        
        /* Mobile Responsive */
        @media (max-width: 640px) {
          .parked-main {
            padding: 40px 16px;
          }
          
          .parked-card {
            padding: 32px 24px;
            border-radius: 20px;
          }
          
          .parked-title {
            font-size: 1.875rem;
          }
          
          .parked-subtitle {
            font-size: 1rem;
          }
          
          .parked-logo-container img {
            max-width: 200px;
            max-height: 65px;
          }
          
          .parked-features {
            flex-direction: column;
            gap: 12px;
          }
          
          .parked-footer {
            padding: 24px 16px;
          }
        }
        
        @media (max-width: 360px) {
          .parked-card {
            padding: 24px 20px;
          }
          
          .parked-title {
            font-size: 1.625rem;
          }
        }
      `}} />
      
      <div className="parked-page">
        {/* Background animated shapes */}
        <div className="bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        
        <div className="parked-main">
          <div className="parked-card">
            {/* Site Logo - only show if logo exists */}
            {siteLogo && (
              <div className="parked-logo-container">
                <Image
                  src={siteLogo}
                  alt={siteName}
                  width={200}
                  height={60}
                  style={{ width: 'auto', height: '60px' }}
                />
              </div>
            )}
            
            {/* Loading Animation */}
            <div className="parked-loading">
              <div className="parked-dot"></div>
              <div className="parked-dot"></div>
              <div className="parked-dot"></div>
            </div>
            
            {/* Main Content */}
            <h1 className="parked-title">We&apos;re getting ready</h1>
            <p className="parked-subtitle">Something amazing is coming soon</p>
            <span className="parked-domain">{domain}</span>
            
            {/* Features */}
            <div className="parked-features">
              <div className="parked-feature">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Real Estate Listings</span>
              </div>
              <div className="parked-feature">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>Local Businesses</span>
              </div>
              <div className="parked-feature">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Directions & Maps</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="parked-footer">
          <div className="parked-footer-content">
            <div className="parked-footer-logo">
              <Image
                src={companyLogo}
                alt="Realty Directions"
                width={180}
                height={50}
                style={{ width: 'auto', height: '50px' }}
              />
            </div>
            <p className="parked-copyright">© {new Date().getFullYear()} Realty Directions, All Rights Reserved</p>
            <p className="parked-disclaimer">
              A real estate and business search guide provided by the real estate brokerage of Realty Directions. 
              All rights reserved. All information provided is deemed reliable, but is not guaranteed and should be independently verified.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

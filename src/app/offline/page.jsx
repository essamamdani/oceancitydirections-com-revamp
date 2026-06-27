// src/app/offline/page.jsx
// Offline site page - Gold theme matching logo style

import { headers } from 'next/headers';
import { fetchSiteConfigByDomain } from '@/lib/site-config';
import Image from 'next/image';

export async function generateMetadata() {
  const headersList = await headers();
  const domain = headersList.get('host') || '';
  
  return {
    title: `Site Offline - ${domain}`,
    description: 'This website is temporarily unavailable.',
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function OfflinePage() {
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
        .offline-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          position: relative;
          overflow-x: hidden;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        /* Gold accent shapes */
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
          background: rgba(212, 175, 55, 0.12);
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
          bottom: -150px;
          left: -100px;
          animation-delay: -5s;
          background: rgba(212, 175, 55, 0.08);
        }
        
        .shape-3 {
          width: 200px;
          height: 200px;
          top: 40%;
          left: 10%;
          animation-delay: -10s;
          background: rgba(220, 53, 69, 0.06);
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        
        .offline-main {
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
        
        .offline-card {
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
        
        .offline-logo-container {
          margin-bottom: 32px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .offline-logo-container img {
          max-width: 200px;
          max-height: 60px;
          width: auto;
          height: auto;
        }
        
        .offline-status-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse 2s infinite;
          box-shadow: 0 10px 30px rgba(220, 53, 69, 0.3);
        }
        
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 10px 30px rgba(220, 53, 69, 0.3);
          }
          50% { 
            transform: scale(1.05);
            box-shadow: 0 15px 40px rgba(220, 53, 69, 0.4);
          }
        }
        
        .offline-status-icon svg {
          width: 40px;
          height: 40px;
          color: white;
        }
        
        .offline-status-badge {
          display: inline-block;
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 6px 16px;
          border-radius: 50px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 20px;
        }
        
        .offline-title {
          font-size: 2rem;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 16px;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }
        
        .offline-message {
          font-size: 1.0625rem;
          color: #64748b;
          margin-bottom: 24px;
          line-height: 1.6;
        }
        
        .offline-domain {
          display: inline-block;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          color: #6c757d;
          font-size: 0.875rem;
          font-weight: 500;
          padding: 10px 20px;
          border-radius: 50px;
          margin-bottom: 32px;
          border: 1px solid #dee2e6;
        }
        
        .offline-contact-box {
          background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
          border: 1px solid #e9ecef;
          border-radius: 16px;
          padding: 24px;
          margin-top: 8px;
        }
        
        .offline-contact-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #495057;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .offline-contact-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #d4af37;
          font-size: 1rem;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        
        .offline-contact-link:hover {
          color: #c9a227;
          text-decoration: underline;
        }
        
        .offline-contact-link svg {
          width: 18px;
          height: 18px;
        }
        
        .offline-footer {
          padding: 32px 24px;
          text-align: center;
          background: rgba(0, 0, 0, 0.3);
          border-top: 1px solid rgba(212, 175, 55, 0.2);
          position: relative;
          z-index: 1;
        }
        
        .offline-footer-content {
          max-width: 600px;
          margin: 0 auto;
        }
        
        .offline-footer-logo {
          margin-bottom: 16px;
          display: flex;
          justify-content: center;
        }
        
        .offline-footer-logo img {
          max-width: 140px;
          max-height: 40px;
          width: auto;
          height: auto;
          filter: brightness(0) invert(1);
          opacity: 0.8;
        }
        
        .offline-copyright {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 8px;
        }
        
        .offline-footer-text {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
        }
        
        /* Mobile Responsive */
        @media (max-width: 640px) {
          .offline-main {
            padding: 40px 16px;
          }
          
          .offline-card {
            padding: 32px 24px;
            border-radius: 20px;
          }
          
          .offline-status-icon {
            width: 64px;
            height: 64px;
          }
          
          .offline-status-icon svg {
            width: 32px;
            height: 32px;
          }
          
          .offline-title {
            font-size: 1.625rem;
          }
          
          .offline-message {
            font-size: 1rem;
          }
          
          .offline-logo-container img {
            max-width: 160px;
            max-height: 50px;
          }
          
          .offline-contact-box {
            padding: 20px;
          }
          
          .offline-footer {
            padding: 24px 16px;
          }
        }
        
        @media (max-width: 360px) {
          .offline-card {
            padding: 24px 20px;
          }
          
          .offline-title {
            font-size: 1.5rem;
          }
        }
      `}} />
      
      <div className="offline-page">
        {/* Background animated shapes */}
        <div className="bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        
        <div className="offline-main">
          <div className="offline-card">
            {/* Site Logo - only show if logo exists */}
            {siteLogo && (
              <div className="offline-logo-container">
                <Image
                  src={siteLogo}
                  alt={siteName}
                  width={200}
                  height={60}
                  style={{ width: 'auto', height: '60px' }}
                />
              </div>
            )}
            
            {/* Status Icon */}
            <div className="offline-status-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            {/* Status Badge */}
            <div className="offline-status-badge">Offline</div>
            
            {/* Main Content */}
            <h1 className="offline-title">This site is currently offline</h1>
            <p className="offline-message">
              The website you are trying to reach is temporarily unavailable. 
              We apologize for the inconvenience.
            </p>
            
            <div className="offline-domain">{domain}</div>
            
            {/* Contact Box */}
            <div className="offline-contact-box">
              <p className="offline-contact-title">Need Help?</p>
              <a href="mailto:info@realtydirections.com" className="offline-contact-link">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                info@realtydirections.com
              </a>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="offline-footer">
          <div className="offline-footer-content">
            <div className="offline-footer-logo">
              <Image
                src={companyLogo}
                alt="Realty Directions"
                width={180}
                height={50}
                style={{ width: 'auto', height: '50px' }}
              />
            </div>
            <p className="offline-copyright">© {new Date().getFullYear()} Realty Directions, All Rights Reserved</p>
            <p className="offline-footer-text">
              A real estate and business search guide
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

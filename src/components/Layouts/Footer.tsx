'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSites } from '@/contexts/SitesContext';


const Footer = ({ bgColor }: { bgColor?: string }) => {
  const { site, loading, error } = useSites();

  // ✅ Always call hooks first
  const [currentYear, setCurrentYear] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentYear(new Date().getFullYear().toString());
    setCurrentDate(new Date().toLocaleDateString());
  }, []);

  // ✅ Then return early if needed
  if (loading || !site) return null;
  if (error) {
    console.error("Error loading site data:", error);
    return null;
  }

  return (
    <>
      <footer className="bg-[#FAF9F6] text-slate-700 pt-16 pb-12 font-sans border-t border-slate-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
          
          {/* Main Footer Links & Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Col 1: Brand Logo & Description (3 cols) */}
            <div className="md:col-span-3 space-y-6">
              {site.logo && (
                <Link href="/">
                  <Image
                    src={site.logo}
                    alt={site.Slug || "Logo"}
                    width={220}
                    height={40}
                    priority
                    style={{ height: 'auto', width: 'auto', maxWidth: '220px' }}
                  />
                </Link>
              )}
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs font-medium">
                Your trusted local guide to homes, verified businesses, and local community events in {site.site_name || site.Slug}.
              </p>
              
              {/* Social Icons */}
              <div className="flex items-center gap-3 pt-2">
                <a href="#" className="w-8 h-8 rounded-xl bg-slate-200 hover:bg-orange-600 text-slate-700 hover:text-white flex items-center justify-center transition duration-200 shadow-xs">
                  <i className="bx bxl-facebook text-lg"></i>
                </a>
                <a href="#" className="w-8 h-8 rounded-xl bg-slate-200 hover:bg-orange-600 text-slate-700 hover:text-white flex items-center justify-center transition duration-200 shadow-xs">
                  <i className="bx bxl-instagram text-lg"></i>
                </a>
                <a href="#" className="w-8 h-8 rounded-xl bg-slate-200 hover:bg-orange-600 text-slate-700 hover:text-white flex items-center justify-center transition duration-200 shadow-xs">
                  <i className="bx bxl-youtube text-lg"></i>
                </a>
                <a href="#" className="w-8 h-8 rounded-xl bg-slate-200 hover:bg-orange-600 text-slate-700 hover:text-white flex items-center justify-center transition duration-200 shadow-xs">
                  <i className="bx bxl-linkedin text-lg"></i>
                </a>
              </div>
            </div>

            {/* Links Columns (7 cols total: 5 cols grid) */}
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-5 gap-6">
              {/* BUY */}
              <div className="space-y-4">
                <strong className="text-xs font-bold text-slate-800 uppercase tracking-widest block border-l-2 border-orange-500 pl-2">Buy</strong>
                <ul className="space-y-2 list-none p-0 m-0">
                  <li><Link href="/realty" className="text-xs text-slate-500 hover:text-orange-600 transition font-semibold">Homes for Sale</Link></li>
                  <li><Link href="/realty" className="text-xs text-slate-500 hover:text-orange-600 transition font-semibold">New Listings</Link></li>
                  <li><Link href="/realty" className="text-xs text-slate-500 hover:text-orange-600 transition font-semibold">Open Houses</Link></li>
                  <li><Link href="/realty" className="text-xs text-slate-500 hover:text-orange-600 transition font-semibold">Find Realtors</Link></li>
                  <li><Link href="/realty" className="text-xs text-slate-500 hover:text-orange-600 transition font-semibold">Mortgage Center</Link></li>
                </ul>
              </div>

              {/* RENT */}
              <div className="space-y-4">
                <strong className="text-xs font-bold text-slate-800 uppercase tracking-widest block border-l-2 border-orange-500 pl-2">Rent</strong>
                <ul className="space-y-2 list-none p-0 m-0">
                  <li><Link href="/realty" className="text-xs text-slate-500 hover:text-orange-600 transition font-semibold">Homes for Rent</Link></li>
                  <li><Link href="/realty" className="text-xs text-slate-500 hover:text-orange-600 transition font-semibold">Apartments</Link></li>
                  <li><Link href="/realty" className="text-xs text-slate-500 hover:text-orange-600 transition font-semibold">Rentals Near Me</Link></li>
                  <li><Link href="/sell" className="text-xs text-slate-500 hover:text-orange-600 transition font-semibold">Landlord Info</Link></li>
                </ul>
              </div>

              {/* BUSINESSES */}
              <div className="space-y-4">
                <strong className="text-xs font-bold text-slate-800 uppercase tracking-widest block border-l-2 border-orange-500 pl-2">Business</strong>
                <ul className="space-y-2 list-none p-0 m-0">
                  <li><Link href="/business" className="text-xs text-slate-500 hover:text-orange-600 transition font-semibold">Business Directory</Link></li>
                  <li><Link href="/dashboard/add-business" className="text-xs text-slate-500 hover:text-orange-600 transition font-semibold">Claim Your Listing</Link></li>
                  <li><Link href="/business" className="text-xs text-slate-500 hover:text-orange-600 transition font-semibold">Advertising Options</Link></li>
                </ul>
              </div>

              {/* EXPLORE */}
              <div className="space-y-4">
                <strong className="text-xs font-bold text-slate-800 uppercase tracking-widest block border-l-2 border-orange-500 pl-2">Explore</strong>
                <ul className="space-y-2 list-none p-0 m-0">
                  <li><Link href="/business" className="text-xs text-slate-500 hover:text-orange-600 transition font-semibold">Communities</Link></li>
                  <li><Link href="/business" className="text-xs text-slate-500 hover:text-orange-600 transition font-semibold">Things To Do</Link></li>
                  <li><Link href="/blog" className="text-xs text-slate-500 hover:text-orange-600 transition font-semibold">Local News</Link></li>
                  <li><Link href="/blog" className="text-xs text-slate-500 hover:text-orange-600 transition font-semibold">Events</Link></li>
                </ul>
              </div>

              {/* COMPANY */}
              <div className="space-y-4">
                <strong className="text-xs font-bold text-slate-800 uppercase tracking-widest block border-l-2 border-orange-500 pl-2">Company</strong>
                <ul className="space-y-2 list-none p-0 m-0">
                  <li><Link href="/about" className="text-xs text-slate-500 hover:text-orange-600 transition font-semibold">About Us</Link></li>
                  <li><Link href="/about" className="text-xs text-slate-500 hover:text-orange-600 transition font-semibold">Careers</Link></li>
                  <li><Link href="/about" className="text-xs text-slate-500 hover:text-orange-600 transition font-semibold">Contact Us</Link></li>
                  <li><Link href="/about" className="text-xs text-slate-500 hover:text-orange-600 transition font-semibold">Media Room</Link></li>
                  <li><Link href="/terms" className="text-xs text-slate-500 hover:text-orange-600 transition font-semibold">Privacy Policy</Link></li>
                </ul>
              </div>
            </div>

            {/* Col 3: Right side branding & Network Info (2 cols) */}
            <div className="md:col-span-2 space-y-4 flex flex-col justify-between items-stretch text-left border border-slate-200 bg-white rounded-2xl p-4 shadow-xs">
              <div>
                <strong className="text-sm font-bold text-slate-900 block mb-1">List Your Business</strong>
                <span className="text-xs text-slate-400 font-medium block mb-3">Get discovered by more locals today.</span>
                <Link href="/dashboard/add-business" className="w-full text-center border border-orange-500 hover:bg-orange-500 text-orange-600 hover:text-white font-bold py-2.5 px-4 rounded-xl transition text-[11px] inline-block">
                  Get Started
                </Link>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Powered by</span>
                <a href="https://www.videohomes.com" target="_blank" rel="noopener noreferrer" className="text-[10px] font-extrabold text-slate-800 tracking-wider font-mono hover:text-orange-600 transition">
                  VIDEOHOMES
                </a>
              </div>
            </div>

          </div>

          {/* Other Sites List */}
          {site.sites && site.sites.length > 0 && (
            <div className="border-t border-slate-200 pt-8 text-center space-y-3">
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block">
                Our Other Sites
              </span>
              <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2 max-w-4xl mx-auto">
                {site.sites.map(({ slug, Slug, url }, index) => {
                  const siteSlug = slug || Slug || `site-${index}`;
                  let displayName = siteSlug
                    .toLowerCase()
                    .replace('directions.com', ' Directions')
                    .replace(/[-_]/g, ' ')
                    .replace(/\b\w/g, (c) => c.toUpperCase());
                  
                  // Apply specific corrections for known compound or uppercase names
                  displayName = displayName
                    .replace(/\bKeywest\b/g, 'Key West')
                    .replace(/\bOceancity\b/g, 'Ocean City')
                    .replace(/\bDc\b/g, 'DC')
                    .replace(/\bMls\b/g, 'MLS')
                    .replace(/\bUs\b/g, 'US');

                  return (
                    <React.Fragment key={siteSlug}>
                      {index > 0 && <span className="text-slate-200 text-xs">|</span>}
                      <Link
                        href={url || '#'}
                        className="text-xs text-slate-500 hover:text-orange-500 transition font-medium"
                      >
                        {displayName}
                      </Link>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {/* MLS Disclosures & Disclaimer */}
          {site.IncludeRealty && (
            <div className="border-t border-slate-200 pt-6 space-y-4 text-[10px] text-slate-400 leading-relaxed font-medium">
              <p>
                A real estate and business search guide for {site.site_name || site.Slug || 'your city'} provided by the real estate brokerage of Realty Directions. All rights reserved. All information provided is deemed reliable, but is not guaranteed and should be independently verified.
              </p>
              <div>
                <strong className="text-slate-600 font-bold block mb-1">Disclaimer</strong>
                <p>
                  {`The data relating to real estate for sale on this website appears in part through the BRIGHT Internet Data Exchange program, a voluntary cooperative exchange of property listing data between licensed real estate brokerage firms in which Realty Directions participates, and is provided by BRIGHT through a licensing agreement. The information provided by this website is for the personal, non-commercial use of consumers and may not be used for any purpose other than to identify prospective properties consumers may be interested in purchasing. Real estate listings held by brokerage firms other than Realty Directions contain detailed information including the name of the listing brokers. Copyright ${currentYear} BRIGHT, All Rights Reserved. Information Deemed Reliable But Not Guaranteed. Some properties which appear for sale on this website may no longer be available because they are under contract, have Closed or are no longer being offered for sale. Data last updated: ${currentDate}`}
                </p>
              </div>
            </div>
          )}

          {/* Bottom Copyright Bar */}
          <div className="border-t border-slate-200 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-450 font-medium">
            <span>
              &copy; {currentYear} {site.domain || site.URL?.replace(/^https?:\/\//, '').replace(/^www\./, '') || "Realty Directions"}. All rights reserved.
            </span>
            <div className="flex items-center gap-4">
              <Link href="/terms" className="hover:text-slate-700 transition">Privacy Policy</Link>
              <span>|</span>
              <Link href="/terms" className="hover:text-slate-700 transition">Terms of Use</Link>
            </div>
          </div>

        </div>
      </footer>
      {/* <FloatingCTA /> */}
    </>
  );
};

export default Footer;
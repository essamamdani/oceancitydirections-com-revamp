'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSites } from '@/contexts/SitesContext';


const Footer = ({ bgColor }) => {
  const { site, loading, error } = useSites();

  // ✅ Always call hooks first
  const [currentYear, setCurrentYear] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
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
      <footer className="bg-[#0B1A30] text-slate-300 pt-16 pb-12 font-sans border-t border-slate-900 mt-20">
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
                    style={{ filter: "brightness(0) invert(1)", height: 'auto', width: 'auto', maxWidth: '220px' }}
                  />
                </Link>
              )}
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs font-medium">
                Your local guide to homes, businesses and the community we love.
              </p>
              
              {/* Social Icons */}
              <div className="flex items-center gap-3 pt-2">
                <a href="#" className="w-8 h-8 rounded-full bg-slate-800 hover:bg-orange-600 text-white flex items-center justify-center transition duration-200">
                  <i className="bx bxl-facebook text-lg"></i>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-slate-800 hover:bg-orange-600 text-white flex items-center justify-center transition duration-200">
                  <i className="bx bxl-instagram text-lg"></i>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-slate-800 hover:bg-orange-600 text-white flex items-center justify-center transition duration-200">
                  <i className="bx bxl-youtube text-lg"></i>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-slate-800 hover:bg-orange-600 text-white flex items-center justify-center transition duration-200">
                  <i className="bx bxl-linkedin text-lg"></i>
                </a>
              </div>
            </div>

            {/* Links Columns (7 cols total: 5 cols grid) */}
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-5 gap-6">
              {/* BUY */}
              <div className="space-y-4">
                <strong className="text-xs font-bold text-white uppercase tracking-wider block">Buy</strong>
                <ul className="space-y-2 list-none p-0 m-0">
                  <li><Link href="/realty" className="text-xs text-slate-400 hover:text-white transition font-medium">Homes for Sale</Link></li>
                  <li><Link href="/realty" className="text-xs text-slate-400 hover:text-white transition font-medium">New Listings</Link></li>
                  <li><Link href="/realty" className="text-xs text-slate-400 hover:text-white transition font-medium">Open Houses</Link></li>
                  <li><Link href="/realty" className="text-xs text-slate-400 hover:text-white transition font-medium">Find Realtors</Link></li>
                  <li><Link href="/realty" className="text-xs text-slate-400 hover:text-white transition font-medium">Mortgage Center</Link></li>
                </ul>
              </div>

              {/* RENT */}
              <div className="space-y-4">
                <strong className="text-xs font-bold text-white uppercase tracking-wider block">Rent</strong>
                <ul className="space-y-2 list-none p-0 m-0">
                  <li><Link href="/realty" className="text-xs text-slate-400 hover:text-white transition font-medium">Homes for Rent</Link></li>
                  <li><Link href="/realty" className="text-xs text-slate-400 hover:text-white transition font-medium">Apartments</Link></li>
                  <li><Link href="/realty" className="text-xs text-slate-400 hover:text-white transition font-medium">Rentals Near Me</Link></li>
                  <li><Link href="/sell" className="text-xs text-slate-400 hover:text-white transition font-medium">Landlord Info</Link></li>
                </ul>
              </div>

              {/* BUSINESSES */}
              <div className="space-y-4">
                <strong className="text-xs font-bold text-white uppercase tracking-wider block">Businesses</strong>
                <ul className="space-y-2 list-none p-0 m-0">
                  <li><Link href="/business" className="text-xs text-slate-400 hover:text-white transition font-medium">Business Directory</Link></li>
                  <li><Link href="/dashboard/add-business" className="text-xs text-slate-400 hover:text-white transition font-medium">Claim Your Listing</Link></li>
                  <li><Link href="/business" className="text-xs text-slate-400 hover:text-white transition font-medium">Advertising Options</Link></li>
                </ul>
              </div>

              {/* EXPLORE */}
              <div className="space-y-4">
                <strong className="text-xs font-bold text-white uppercase tracking-wider block">Explore</strong>
                <ul className="space-y-2 list-none p-0 m-0">
                  <li><Link href="/business" className="text-xs text-slate-400 hover:text-white transition font-medium">Communities</Link></li>
                  <li><Link href="/business" className="text-xs text-slate-400 hover:text-white transition font-medium">Things To Do</Link></li>
                  <li><Link href="/blog" className="text-xs text-slate-400 hover:text-white transition font-medium">Local News</Link></li>
                  <li><Link href="/blog" className="text-xs text-slate-400 hover:text-white transition font-medium">Events</Link></li>
                </ul>
              </div>

              {/* COMPANY */}
              <div className="space-y-4">
                <strong className="text-xs font-bold text-white uppercase tracking-wider block">Company</strong>
                <ul className="space-y-2 list-none p-0 m-0">
                  <li><Link href="/about" className="text-xs text-slate-400 hover:text-white transition font-medium">About Us</Link></li>
                  <li><Link href="/about" className="text-xs text-slate-400 hover:text-white transition font-medium">Careers</Link></li>
                  <li><Link href="/about" className="text-xs text-slate-400 hover:text-white transition font-medium">Contact Us</Link></li>
                  <li><Link href="/about" className="text-xs text-slate-400 hover:text-white transition font-medium">Media Room</Link></li>
                  <li><Link href="/terms" className="text-xs text-slate-400 hover:text-white transition font-medium">Terms of Use</Link></li>
                </ul>
              </div>
            </div>

            {/* Col 3: Right side branding & Network Info (2 cols) */}
            <div className="md:col-span-2 space-y-6 flex flex-col justify-between items-start md:items-end text-left md:text-right border-t md:border-t-0 border-slate-800 pt-6 md:pt-0">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-1">Network Affiliate</span>
                <span className="text-xs font-bold text-white block">Proud to be part of the</span>
                <a href="https://www.realtydirections.com" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-orange-500 hover:underline block mt-0.5">
                  Realty Directions Network
                </a>
              </div>
              <div className="pt-4">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-2">Powered By</span>
                <a href="https://www.videohomes.com" target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-80 transition">
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="text-xs font-extrabold text-white tracking-widest font-mono">VIDEOHOMES</span>
                  </div>
                </a>
              </div>
            </div>

          </div>

          {/* Other Sites List */}
          {site.sites && site.sites.length > 0 && (
            <div className="border-t border-slate-800 pt-8 text-center space-y-3">
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block">
                Our Other Sites
              </span>
              <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2 max-w-4xl mx-auto">
                {site.sites.map(({ slug, Slug, url }, index) => {
                  const siteSlug = slug || Slug || `site-${index}`;
                  const displayName = siteSlug
                    .replace('directions.com', ' Directions')
                    .replace('-', ' ')
                    .replace(/\b\w/g, (c) => c.toUpperCase());
                  return (
                    <React.Fragment key={siteSlug}>
                      {index > 0 && <span className="text-slate-700 text-xs">|</span>}
                      <Link
                        href={url || '#'}
                        className="text-xs text-slate-400 hover:text-orange-500 transition font-medium"
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
            <div className="border-t border-slate-800 pt-6 space-y-4 text-[10px] text-slate-450 leading-relaxed font-medium">
              <p>
                A real estate and business search guide for {site.site_name || site.Slug || 'your city'} provided by the real estate brokerage of Realty Directions. All rights reserved. All information provided is deemed reliable, but is not guaranteed and should be independently verified.
              </p>
              <div>
                <strong className="text-slate-355 font-bold block mb-1">Disclaimer</strong>
                <p>
                  {`The data relating to real estate for sale on this website appears in part through the BRIGHT Internet Data Exchange program, a voluntary cooperative exchange of property listing data between licensed real estate brokerage firms in which Realty Directions participates, and is provided by BRIGHT through a licensing agreement. The information provided by this website is for the personal, non-commercial use of consumers and may not be used for any purpose other than to identify prospective properties consumers may be interested in purchasing. Real estate listings held by brokerage firms other than Realty Directions contain detailed information including the name of the listing brokers. Copyright ${currentYear} BRIGHT, All Rights Reserved. Information Deemed Reliable But Not Guaranteed. Some properties which appear for sale on this website may no longer be available because they are under contract, have Closed or are no longer being offered for sale. Data last updated: ${currentDate}`}
                </p>
              </div>
            </div>
          )}

          {/* Bottom Copyright Bar */}
          <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
            <span>
              &copy; {currentYear} {site.domain || site.URL?.replace(/^https?:\/\//, '').replace(/^www\./, '') || "Realty Directions"}. All rights reserved.
            </span>
            <div className="flex items-center gap-4">
              <Link href="/terms" className="hover:text-slate-300 transition">Privacy Policy</Link>
              <span>|</span>
              <Link href="/terms" className="hover:text-slate-300 transition">Terms of Use</Link>
            </div>
          </div>

        </div>
      </footer>
      {/* <FloatingCTA /> */}
    </>
  );
};

export default Footer;
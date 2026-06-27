'use client';
import { useState, useEffect } from 'react';
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
      <footer className={`footer-area ${bgColor}`}>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="single-footer-widget">
                <ul className="link-list d-inline">
                  <li>
                    <Link href="/">
                      <i className="flaticon-right-chevron"></i> Home
                    </Link>
                  </li>
                  {site.IncludeRealty && <li>
                    <Link href="/realty">
                      <i className="flaticon-right-chevron"></i> Real Estate
                    </Link>
                  </li>}
                  <li>
                    <Link href="/sell">
                      <i className="flaticon-right-chevron"></i> Sell
                    </Link>
                  </li>
                  <li>
                    <Link href="/business">
                      <i className="flaticon-right-chevron"></i> Businesses
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog">
                      <i className="flaticon-right-chevron"></i>
                      Blog
                    </Link>
                  </li>
                  <li>

                    <Link href="https://www.realtydirections.com/" >
                      <i className="flaticon-right-chevron"></i>
                      Corporate Site
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms">
                      <i className="flaticon-right-chevron"></i> Terms
                    </Link>
                  </li>

                </ul>
              </div>
            </div>
          </div>

          {/* Display other site logos with URLs */}
          <div className="row">
            <div className="col-12 text-center mt-3">
              <p>
                <strong>Our Other Sites</strong>
              </p>
              <div className="other-logos d-flex justify-content-center flex-wrap">
                {site.sites.map(({ slug, Slug, url, logo }, index) => {
                  const siteSlug = slug || Slug || `site-${index}`;
                  return (
                  <div
                    key={siteSlug}
                    className="site-logo-item"
                    style={{ margin: '10px' }}
                  >
                    <Link href={url || '#'}>
                      <Image
                        src={logo || '/images/logo.png'}
                        alt={siteSlug}
                        width={150}
                        height={50}
                        style={{ display: 'block', margin: '0 auto', width: '150px', height: 'auto' }}
                      />
                    </Link>
                  </div>
                )})}
              </div>
            </div>
          </div>

          <div className="copyright-area">
            <p>
              {site.domain || site.URL?.replace(/^https?:\/\//, '').replace(/^www\./, '') || "Realty Directions"} | &copy;{' '}
              {currentYear} Realty Directions, All Rights Reserved
            </p>
            {site.IncludeRealty && (<div>
              <p>
                A real estate and business search guide for{' '}
                {site.site_name || site.Slug || 'your city'} provided by the real estate
                brokerage of Realty Directions. All rights reserved. All
                information provided is deemed reliable, but is not guaranteed and
                should be independently verified.
              </p>

              <p>
                <strong>Disclaimer</strong>
              </p>
              <p>
                {`The data relating to real estate for sale on this website
                appears in part through the BRIGHT Internet Data Exchange
                program, a voluntary cooperative exchange of property listing
                data between licensed real estate brokerage firms in which
                Realty Directions participates, and is provided by BRIGHT
                through a licensing agreement. The information provided by this
                website is for the personal, non-commercial use of consumers and
                may not be used for any purpose other than to identify
                prospective properties consumers may be interested in
                purchasing. Real estate listings held by brokerage firms other
                than Realty Directions contain detailed information including
                the name of the listing brokers. copyright ${currentYear} BRIGHT, All
                Rights Reserved. Information Deemed Reliable But Not Guaranteed.
                Some properties which appear for sale on this website may no
                longer be available because they are under contract, have Closed
                or are no longer being offered for sale. Data last updated: 
                ${currentDate}`}
              </p>
            </div>)}
          </div>
        </div>

        <div className="footer-image text-center">
          <Image
            src="/images/footer-image.png"
            alt="image"
            width={1920}
            height={383}
            priority
          />
        </div>

      </footer>
      {/* <FloatingCTA /> */}
    </>
  );
};

export default Footer;
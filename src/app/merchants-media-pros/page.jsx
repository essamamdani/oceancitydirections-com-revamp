import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Layouts/Navbar';
import PageBanner from '@/components/Common/PageBanner';
import { fetchSiteData, getSiteStatus } from '@/lib/site-config';
import { ucwords } from '@/lib/helper';
import { redirect } from 'next/navigation';

const MerchantsMediaProsLandingPage = async () => {
  const site = await fetchSiteData();
  const siteStatus = getSiteStatus(site);
  if (siteStatus === 'parked') {
    redirect('/parked');
  }
  if (siteStatus === 'offline') {
    redirect('/offline');
  }
  return (
    <>
      <Navbar />
      <PageBanner pageTitle="Connecting Media Pros & Business Owners" pageName="Merchants & Media Pros" />

      {/* Intro / Hero Section */}
      <section className="ptb-100 bg-f9f9f9">
        <div className="container">
          <div className="section-title text-center">
            <h2>Connecting Media Pros & {ucwords(site.Slug.replace('_',' '))} Area Business Owners</h2>
            <p>
              At {site.domain || site.URL.replace(/^https?:\/\//, '').replace(/^www\./, '')} we help home buyers and sellers explore and discover outstanding local
              businesses that serve the neighborhoods they're interested in, deepening our users search experience.
            </p>
          </div>
        </div>
      </section>

      {/* Selection Section */}
      <section className="ptb-100">
        <div className="container">
          

          <div className="row justify-content-center">
            {/* Business Owner Card */}
            <div className="col-lg-6 col-md-6">
              <Link href="/merchants-media-pros/merchant" className="text-decoration-none">
                <div className="single-features-box" style={{ cursor: 'pointer', height: '100%' }}>
                  <div className="icon">
                    <i className="bx bx-store"></i>
                  </div>
                  <h3>I'm a Business Owner</h3>
                  <p>
                    Claim your business, tell your story, and connect with trusted local media professionals.
                  </p>
                </div>
              </Link>
            </div>

            {/* Media Pro Card */}
            <div className="col-lg-6 col-md-6">
              <Link href="/merchants-media-pros/media-pro" className="text-decoration-none">
                <div className="single-features-box" style={{ cursor: 'pointer', height: '100%' }}>
                  <div className="icon">
                    <i className="bx bx-video bx-md"></i>
                  </div>
                  <h3>I'm a Media Pro</h3>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                    (Videographers, Ad Agencies, Marketing & Social Pros, News & Media)
                  </p>
                  <p>
                    Showcase your talent, book local gigs, and work with businesses that need your skills.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Section */}
      <section className="ptb-100 bg-f9f9f9">
        <div className="container">
          <div className="section-title text-center">
            <h2>Exclusive Partnership with VideoHomes.com</h2>
            <p>
              {site.domain || site.URL.replace(/^https?:\/\//, '').replace(/^www\./, '')} and the national network of local websites by Realty Directions have partnered with
              VideoHomes.com to connect media professionals and small business owners, creating standout content and real results.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="ptb-100 bg-0f172a text-center" style={{ backgroundColor: '#0f172a', color: '#fff' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-12">
              <h2 className="mb-4 text-white">Ready to Get Started?</h2>
              <p className="mb-5 text-light">
                Claim your business profile or join as a media professional today.
              </p>
              <div className="d-flex justify-content-center gap-3">
                <Link href="/businesses" className="default-btn">
                        Claim Your Business
                      </Link>
                <Link href="/register?role=media_pro" className="default-btn">
                  Join as a Media Pro
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default MerchantsMediaProsLandingPage;

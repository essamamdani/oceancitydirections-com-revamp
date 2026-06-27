import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Layouts/Navbar';
import PageBanner from '@/components/Common/PageBanner';
import { fetchSiteData, getSiteStatus } from '@/lib/site-config';
import { ucwords } from '@/lib/helper';
import { redirect } from 'next/navigation';


const MediaProsPage = async () => {
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
      <PageBanner
        pageTitle="For Media Professionals"
        pageName="Media Pros"
        parentPage="Merchants & Media Pros"
        parentUrl="/merchants-media-pros"
      />

      {/* Intro / Hero Section */}
      <section className="ptb-100 bg-f9f9f9">
        <div className="container">
          <div className="section-title text-center">
            <h2>Showcase your talent, connect with local businesses, and grow your portfolio</h2>
            <p>
              Join VideoHomes (Videographers, Ad Agencies, Marketing & Social Pros, News & Media)
            </p>
          </div>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="ptb-100">
        <div className="container">
          <div className="section-title text-center">
            <h2>Why Join {ucwords(site.Slug.replace('_',' '))}</h2>
            <p>Find Local Gigs, Showcase Your Work, and Flexible Monetization</p>
          </div>

          <div className="row">
            {/* Feature 1 */}
            <div className="col-lg-3 col-md-6">
              <div className="single-features-box">
                <div className="icon">
                  <i className="bx bx-target-lock bx-md"></i>
                </div>
                <h3>Find Local Gigs</h3>
                <p>
                  Get access to local businesses actively looking for professional video & media services.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="col-lg-3 col-md-6">
              <div className="single-features-box">
                <div className="icon">
                  <i className="bx bx-video bx-md"></i>
                </div>
                <h3>Showcase Your Work</h3>
                <p>
                  Build a stunning portfolio to attract the right clients for your skills and style.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="col-lg-3 col-md-6">
              <div className="single-features-box">
                <div className="icon">
                  <i className="bx bx-dollar-circle bx-md"></i>
                </div>
                <h3>Flexible Monetization</h3>
                <p>
                  Set your own rates, manage your bookings, and operate with independence.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="col-lg-3 col-md-6">
              <div className="single-features-box">
                <div className="icon">
                  <i className="bx bx-wrench bx-md"></i>
                </div>
                <h3>Streamline Workflow</h3>
                <p>
                  Use tools to manage projects, communicate with clients, and deliver final media efficiently.
                </p>
              </div>
            </div>
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

export default MediaProsPage;

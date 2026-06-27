import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Layouts/Navbar';
import PageBanner from '@/components/Common/PageBanner';
import { fetchSiteData, getSiteStatus } from '@/lib/site-config';
import { ucwords } from '@/lib/helper';
import { redirect } from 'next/navigation';


const MerchantsPage = async () => {
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
        pageTitle={`${ucwords(site.Slug.replace('_',' '))} Area Business Owners`}
        pageName="Merchants" 
        parentPage="Merchants & Media Pros"
        parentUrl="/merchants-media-pros"
      />

      {/* Intro / Hero Section */}
      <section className="ptb-100 bg-f9f9f9">
        <div className="container">
          <div className="section-title text-center">
            <h2>Claim or Create and submit your Business Today!</h2>
            <p>
              Claim your business, tell your story, and connect with trusted local media professionals.
            </p>
          </div>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="ptb-100">
        <div className="container">
          <div className="section-title text-center">
            <h2>Why Merchants Join</h2>
            <p>Professional Storytelling, Control Choices, Local Visibility, and Trusted Media Pros</p>
          </div>

          <div className="row">
            {/* Feature 1 */}
            <div className="col-lg-3 col-md-6">
              <div className="single-features-box">
                <div className="icon">
                  <i className="bx bx-camera-movie"></i>
                </div>
                <h3>Professional Storytelling</h3>
                <p>
                  High-quality video and media content that showcases who you are, what you do, and why customers should choose you.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="col-lg-3 col-md-6">
              <div className="single-features-box">
                <div className="icon">
                  <i className="bx bx-cog"></i>
                </div>
                <h3>Designated Control Choices</h3>
                <p>
                  Claim or create your own business page and even upload a video — or designate another media professional to manage it through our partnered VideoHomes.com platform.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="col-lg-3 col-md-6">
              <div className="single-features-box">
                <div className="icon">
                  <i className="bx bx-map-pin"></i>
                </div>
                <h3>Local Visibility</h3>
                <p>
                  Appear across ${ucwords(site.Slug.replace('_',' '))} where home buyers and sellers discover trusted local businesses serving the neighborhoods they care about.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="col-lg-3 col-md-6">
              <div className="single-features-box">
                <div className="icon">
                  <i className="bx bx-shake"></i>
                </div>
                <h3>Trusted Media Pros</h3>
                <p>
                  Work with experienced videographers, agencies, and marketing professionals who understand local audiences.
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

export default MerchantsPage;

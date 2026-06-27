
"use client";

import Link from "next/link";
import Image from "next/image";
import { ucwords } from "@/lib/helper";
import { useSites } from "@/contexts/SitesContext";

const Destinations = () => {
  const { site, loading, error } = useSites();
  if (loading || !site) return null;
  if (error) return null;

  const counties = (site.DisplayCounties?.length ? site.DisplayCounties : site.DefaultCounties)
    .map(e => ucwords(e));
  const cities = site.popular_cities;

  let siteName = site?.site_name || site?.slug || 'Realty Directions';
  if (siteName && siteName.toLowerCase() === site?.slug?.toLowerCase() && !siteName.toLowerCase().includes('directions')) {
    siteName = ucwords(siteName) + " Directions";
  } else if (siteName && !siteName.toLowerCase().includes('.com')) {
    siteName = ucwords(siteName);
  }

  const getSrc = (county) => {
    if (!Array.isArray(cities)) return "/images/destinations/destinations9.jpg";
    const cityData = cities.find(
      c => c.name?.toLowerCase() === county.trim().toLowerCase() ||
           Object.keys(c)[0] === county.trim().toLowerCase()
    );
    const imagePath = cityData ? (cityData.image || cityData[county.toLowerCase()]) : null;
    if (!imagePath) return "/images/destinations/destinations9.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    return imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  };

  if (counties.length === 0) return null;

  return (
    <section className="destinations-area pt-100 pb-70">
      <div className="container">
        <div className="section-title text-left">
          <h2>Explore Areas</h2>
          <Link href="/realty" className="link-btn">
            Show All <i className="flaticon-right-chevron"></i>
          </Link>
        </div>

        {/*
          CSS Grid: auto-fill columns, each at least 280px wide.
          All cards share the same height so every row is perfectly aligned.
        */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}>
          {counties.map((county) => (
            <div
              key={county}
              style={{
                position: 'relative',
                height: '260px',
                borderRadius: '14px',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
            >
              {/* Background image */}
              <Image
                src={getSrc(county)}
                alt={county}
                fill
                sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw"
                style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
              />

              {/* Gradient overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(170deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.62) 100%)',
              }} />

              {/* Text */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '20px 22px',
              }}>
                <p style={{
                  color: 'rgba(255,255,255,0.75)',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.6px',
                  textTransform: 'uppercase',
                  margin: '0 0 5px',
                  lineHeight: 1,
                }}>
                  {siteName}
                </p>
                <h3 style={{
                  color: '#fff',
                  fontSize: '22px',
                  fontWeight: 700,
                  margin: 0,
                  lineHeight: 1.2,
                  textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }}>
                  {county}
                </h3>
              </div>

              {/* Full-card clickable link */}
              <Link
                href={`/realty/location/${encodeURIComponent(county.toLowerCase())}`}
                aria-label={`View real estate in ${county}`}
                style={{ position: 'absolute', inset: 0 }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Destinations;

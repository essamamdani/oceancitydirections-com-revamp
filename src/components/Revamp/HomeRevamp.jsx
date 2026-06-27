import Image from "next/image";
import Link from "next/link";
import HomepageListings from "@/components/HomeFour/HomepageListings";
import { getSiteName, ucwords } from "@/lib/helper";

const quickCategories = [
  { label: "Homes", href: "/realty", icon: "bx-home", copy: "Browse active listings" },
  { label: "Restaurants", href: "/business/category/restaurant", icon: "bx-restaurant", copy: "Find local dining" },
  { label: "Services", href: "/business/category/home-services", icon: "bx-wrench", copy: "Hire trusted pros" },
  { label: "Media Pros", href: "/merchants-media-pros", icon: "bx-video", copy: "Listing media support" },
];

const railLinks = [
  { label: "Home", href: "/", icon: "bx-grid-alt" },
  { label: "Properties", href: "/realty", icon: "bx-home" },
  { label: "Directory", href: "/business", icon: "bx-store" },
  { label: "Sell", href: "/sell", icon: "bx-key" },
  { label: "Media", href: "/merchants-media-pros", icon: "bx-video" },
];

const networkLinks = [
  ["Annapolis", "https://annapolisdirections.com"],
  ["Baltimore", "https://baltimoredirections.com"],
  ["Frederick", "https://frederickdirections.com"],
  ["Ocean City", "https://oceancitydirections.com"],
];

function domainFromSite(site) {
  const configuredDomain = site?.URL?.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
  const requestDomain = site?.domain?.replace(/^www\./, "").replace(/\/$/, "");
  return configuredDomain || (!requestDomain?.includes("localhost") ? requestDomain : null) || "oceancitydirections.com";
}

function countyNames(site) {
  const source = site?.DisplayCounties?.length ? site.DisplayCounties : site?.DefaultCounties || [];
  return source.slice(0, 6).map((name) => ucwords(name));
}

export default function HomeRevamp({ site, topBusinesses = [], featuredVideos = [], showRealty }) {
  const siteName = getSiteName(site);
  const domain = domainFromSite(site);
  const counties = countyNames(site);
  const featureImage = site?.slides?.swiper?.[0]?.img || "/img/photo/ocean-city-md-boardwalk.jpg";
  const businessCountLabel = topBusinesses.length ? `${topBusinesses.length}+` : "Local";
  const countyLabel = counties.length ? counties.length : "Multi";

  return (
    <div className="rd-page rd-home rd-home-app">
      <section className="rd-shell rd-command-center" aria-labelledby="rd-home-title">
        <aside className="rd-home-rail" aria-label="Primary sections">
          {railLinks.filter((item) => showRealty || item.label !== "Properties").map((item) => (
            <Link href={item.href} key={item.label}>
              <i className={`bx ${item.icon}`} aria-hidden="true"></i>
              <span>{item.label}</span>
            </Link>
          ))}
        </aside>

        <main className="rd-home-main">
          <section className="rd-welcome-panel">
            <div>
              <span className="rd-kicker">Realty Directions local guide</span>
              <h1 id="rd-home-title">{siteName}</h1>
              <p>
                Search homes, businesses, videos, and neighborhood coverage from one clean city workspace.
              </p>
            </div>

            <div className="rd-dashboard-stats" aria-label="Market summary">
              <div><strong>{countyLabel}</strong><span>Counties</span></div>
              <div><strong>MLS</strong><span>Property feed</span></div>
              <div><strong>{businessCountLabel}</strong><span>Business picks</span></div>
            </div>
          </section>

          <section className="rd-search-console rd-dashboard-search" aria-label="Search homes and businesses">
            {showRealty && (
              <form action="/realty" method="get" className="rd-search-row">
                <label htmlFor="home-search">Homes and real estate</label>
                <div>
                  <i className="bx bx-search" aria-hidden="true"></i>
                  <input id="home-search" name="q" type="search" placeholder="Address, city, MLS ID" />
                  <button type="submit">Search Homes</button>
                </div>
              </form>
            )}
            <form action="/business" method="get" className="rd-search-row">
              <label htmlFor="business-search">Business directory</label>
              <div>
                <i className="bx bx-search" aria-hidden="true"></i>
                <input id="business-search" name="q" type="search" placeholder="Restaurant, service, shop" />
                <button type="submit">Search Local</button>
              </div>
            </form>
          </section>

          <section className="rd-module">
            <div className="rd-module-head">
              <div>
                <span className="rd-kicker">Start here</span>
                <h2>Find the right local path</h2>
              </div>
              <Link href="/business">Browse directory</Link>
            </div>
            <div className="rd-intent-grid" aria-label="Popular sections">
              {quickCategories.filter((item) => showRealty || item.label !== "Homes").map((item) => (
                <Link href={item.href} className="rd-intent-card" key={item.label}>
                  <i className={`bx ${item.icon}`} aria-hidden="true"></i>
                  <strong>{item.label}</strong>
                  <span>{item.copy}</span>
                </Link>
              ))}
            </div>
          </section>

          {showRealty && (
            <div className="rd-home-listings rd-module rd-listing-module">
              <HomepageListings />
            </div>
          )}

          <section className="rd-module rd-business-band">
            <div className="rd-module-head">
              <div>
                <span className="rd-kicker">Business discovery</span>
                <h2>Featured local businesses</h2>
              </div>
              <Link href="/business">View all</Link>
            </div>
            <div className="rd-business-strip">
              {topBusinesses.slice(0, 4).map((business) => (
                <Link href={`/s/${business.update_slug || business.slug}`} className="rd-business-mini" key={business.id}>
                  <span>{business.categories?.name || business.category || "Local Business"}</span>
                  <strong>{business.title}</strong>
                  <small>{business.city ? `${business.city}, ${business.state || site?.ShortState?.toUpperCase() || ""}` : domain}</small>
                </Link>
              ))}
              {!topBusinesses.length && ["Restaurants", "Home Services", "Shopping", "Health"].map((label) => (
                <Link href={`/business/category/${label.toLowerCase().replace(/\s+/g, "-")}`} className="rd-business-mini" key={label}>
                  <span>Explore</span>
                  <strong>{label}</strong>
                  <small>{domain}</small>
                </Link>
              ))}
            </div>
          </section>

          <section className="rd-lead-band rd-module">
            <div>
              <span className="rd-kicker">Ready to act</span>
              <h2>Sell a property, claim a business, or produce better listing media.</h2>
            </div>
            <div className="rd-lead-actions">
              <Link href="/sell">Start Selling</Link>
              <Link href="/dashboard/add-business">Claim or Add Business</Link>
              <Link href="/merchants-media-pros">Join as Media Pro</Link>
            </div>
          </section>
        </main>

        <aside className="rd-home-side" aria-label={`${siteName} summary`}>
          <section className="rd-side-card rd-city-card">
            <div className="rd-city-photo">
              <Image
                src={featureImage}
                alt={`${siteName} local area`}
                fill
                priority
                sizes="(max-width: 1180px) 100vw, 320px"
                style={{ objectFit: "cover" }}
              />
            </div>
            <div>
              <span className="rd-kicker">Coverage</span>
              <h2>{domain}</h2>
              <p>Real estate, business directory, and local media coverage in one sober public workspace.</p>
            </div>
          </section>

          <section className="rd-side-card">
            <div className="rd-module-head">
              <div>
                <span className="rd-kicker">Local video</span>
                <h2>Watch before you act</h2>
              </div>
            </div>
            <div className="rd-video-list">
              {featuredVideos.slice(0, 3).map((video) => (
                <Link
                  href={video.embeded_for === "property" ? `/realty/${video.p_id_b_slug}` : `/s/${video.p_id_b_slug || video.slug || ""}`}
                  className="rd-video-row"
                  key={video.video_id || video.title}
                >
                  <span><i className="bx bx-play" aria-hidden="true"></i></span>
                  <strong>{video.title}</strong>
                </Link>
              ))}
              {!featuredVideos.length && (
                <div className="rd-video-row rd-muted-row">
                  <span><i className="bx bx-play" aria-hidden="true"></i></span>
                  <strong>Featured local videos will appear here.</strong>
                </div>
              )}
            </div>
          </section>

          <section className="rd-side-card rd-network">
            <div className="rd-module-head">
              <div>
                <span className="rd-kicker">Regional network</span>
                <h2>Popular coverage</h2>
              </div>
            </div>
            <div className="rd-county-list">
              <div>
                {counties.map((county) => (
                  <Link href={showRealty ? `/realty/location/${county.toLowerCase()}` : `/business/location/${county.toLowerCase()}`} key={county}>
                    {county}
                  </Link>
                ))}
              </div>
            </div>
            <div className="rd-network-map">
              {networkLinks.map(([label, href]) => (
                <Link href={href} key={label}>{label}</Link>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}

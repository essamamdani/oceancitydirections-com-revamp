import Image from "next/image";
import Link from "next/link";
import HomepageListings from "@/components/HomeFour/HomepageListings";
import { getSiteName, ucwords } from "@/lib/helper";

const quickCategories = [
  { label: "Homes", href: "/realty", icon: "bx-home", copy: "Waterfront, condos, rentals" },
  { label: "Restaurants", href: "/business/category/restaurant", icon: "bx-restaurant", copy: "Dining locals actually use" },
  { label: "Services", href: "/business/category/home-services", icon: "bx-wrench", copy: "Repair, home, pro help" },
  { label: "Media Pros", href: "/merchants-media-pros", icon: "bx-video", copy: "Video and listing support" },
];

const networkLinks = [
  ["Annapolis", "https://annapolisdirections.com"],
  ["Baltimore", "https://baltimoredirections.com"],
  ["Frederick", "https://frederickdirections.com"],
  ["Ocean City", "https://oceancitydirections.com"],
];

function domainFromSite(site) {
  return site?.domain || site?.URL?.replace(/^https?:\/\//, "").replace(/^www\./, "") || "oceancitydirections.com";
}

function countyNames(site) {
  const source = site?.DisplayCounties?.length ? site.DisplayCounties : site?.DefaultCounties || [];
  return source.slice(0, 6).map((name) => ucwords(name));
}

export default function HomeRevamp({ site, topBusinesses = [], featuredVideos = [], showRealty }) {
  const siteName = getSiteName(site);
  const domain = domainFromSite(site);
  const counties = countyNames(site);
  const heroImage = site?.slides?.swiper?.[0]?.img || "/img/photo/ocean-city-guide.jpg";
  const secondImage = site?.slides?.swiper?.[1]?.img || "/img/photo/ocean-city-md-boardwalk.jpg";

  return (
    <div className="rd-page rd-home">
      <section className="rd-hero" aria-labelledby="rd-home-title">
        <div className="rd-hero-media">
          <Image
            src={heroImage}
            alt={`${siteName} local guide`}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="rd-hero-overlay" />
        <div className="rd-shell rd-hero-grid">
          <div className="rd-hero-copy">
            <span className="rd-kicker">Real estate first local search</span>
            <h1 id="rd-home-title">{siteName}</h1>
            <p>
              Find homes, local businesses, services, videos, and neighborhood signals in one city guide built by Realty Directions.
            </p>
          </div>

          <div className="rd-search-console" aria-label="Search homes and businesses">
            {showRealty && (
              <form action="/realty" method="get" className="rd-search-row">
                <label htmlFor="home-search">Homes for sale or rent</label>
                <div>
                  <i className="bx bx-search" aria-hidden="true"></i>
                  <input id="home-search" name="q" type="search" placeholder="Address, city, MLS ID" />
                  <button type="submit">Search Homes</button>
                </div>
              </form>
            )}
            <form action="/business" method="get" className="rd-search-row">
              <label htmlFor="business-search">Businesses, services, restaurants</label>
              <div>
                <i className="bx bx-search" aria-hidden="true"></i>
                <input id="business-search" name="q" type="search" placeholder="Restaurant, service, shop" />
                <button type="submit">Search Local</button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="rd-shell rd-intent-grid" aria-label="Popular sections">
        {quickCategories.filter((item) => showRealty || item.label !== "Homes").map((item) => (
          <Link href={item.href} className="rd-intent-card" key={item.label}>
            <i className={`bx ${item.icon}`} aria-hidden="true"></i>
            <strong>{item.label}</strong>
            <span>{item.copy}</span>
          </Link>
        ))}
      </section>

      <section className="rd-shell rd-two-column rd-section">
        <div>
          <span className="rd-kicker">Local video layer</span>
          <h2>Watch the city before you visit, buy, or hire.</h2>
          <p>
            VideoHomes and local media placements give visitors a faster reason to stay, compare, and contact a real person.
          </p>
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
        </div>
        <div className="rd-editorial-image">
          <Image
            src={secondImage}
            alt={`${siteName} waterfront and local area`}
            fill
            sizes="(max-width: 900px) 100vw, 45vw"
            style={{ objectFit: "cover" }}
          />
        </div>
      </section>

      {showRealty && (
        <div className="rd-home-listings">
          <HomepageListings />
        </div>
      )}

      <section className="rd-section rd-business-band">
        <div className="rd-shell">
          <div className="rd-section-head">
            <div>
              <span className="rd-kicker">Yelp-style discovery</span>
              <h2>Featured local businesses</h2>
            </div>
            <Link href="/business">Browse all businesses</Link>
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
        </div>
      </section>

      <section className="rd-shell rd-section rd-network">
        <div className="rd-section-head">
          <div>
            <span className="rd-kicker">Regional network</span>
            <h2>One brokerage-backed guide across local markets.</h2>
          </div>
        </div>
        <div className="rd-network-grid">
          <div className="rd-network-map">
            {networkLinks.map(([label, href]) => (
              <Link href={href} key={label}>{label}</Link>
            ))}
          </div>
          <div className="rd-county-list">
            <strong>Popular coverage</strong>
            <div>
              {counties.map((county) => (
                <Link href={showRealty ? `/realty/location/${county.toLowerCase()}` : `/business/location/${county.toLowerCase()}`} key={county}>
                  {county}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rd-lead-band">
        <div className="rd-shell rd-lead-grid">
          <div>
            <span className="rd-kicker">Ready to act</span>
            <h2>Sell a property, claim a business, or produce better listing media.</h2>
          </div>
          <div className="rd-lead-actions">
            <Link href="/sell">Start Selling</Link>
            <Link href="/dashboard/add-business">Claim or Add Business</Link>
            <Link href="/merchants-media-pros">Join as Media Pro</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

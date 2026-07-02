"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import HomepageListings from "@/components/HomeFour/HomepageListings";
import { getSiteName, ucwords } from "@/lib/helper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import mapDataJson from "@/domains/map.json";
import toast from "react-hot-toast";

const USStateMap = dynamic(
  () => import("./USStateMap"),
  { ssr: false, loading: () => <div className="h-[300px] flex items-center justify-center text-xs font-bold text-slate-400">Loading map...</div> }
);

const quickCategories = [
  { label: "Homes", href: "/realty", icon: "bx-home", copy: "Find your next home" },
  { label: "Businesses", href: "/business", icon: "bx-store", copy: "Support local" },
  { label: "Communities", href: "/business", icon: "bx-group", copy: "Explore places to live" },
  { label: "Media Pros", href: "/merchants-media-pros", icon: "bx-slideshow", copy: "Create & connect" },
];

const businessFilterCategories = [
  { label: "Restaurants", icon: "bx-restaurant", path: "restaurant" },
  { label: "Coffee Shops", icon: "bx-coffee", path: "coffee-shop" },
  { label: "Medical", icon: "bx-plus-medical", path: "medical" },
  { label: "Fitness", icon: "bx-dumbbell", path: "fitness" },
  { label: "Home Services", icon: "bx-wrench", path: "home-services" },
  { label: "Shopping", icon: "bx-shopping-bag", path: "shopping" },
];

const stateFipsMap: Record<string, string> = {
  "AL": "01", "AK": "02", "AZ": "04", "AR": "05", "CA": "06",
  "CO": "08", "CT": "09", "DE": "10", "FL": "12", "GA": "13",
  "HI": "15", "ID": "16", "IL": "17", "IN": "18", "IA": "19",
  "KS": "20", "KY": "21", "LA": "22", "ME": "23", "MD": "24",
  "MA": "25", "MI": "26", "MN": "27", "MS": "28", "MO": "29",
  "MT": "30", "NE": "31", "NV": "32", "NH": "33", "NJ": "34",
  "NM": "35", "NY": "36", "NC": "37", "ND": "38", "OH": "39",
  "OK": "40", "OR": "41", "PA": "42", "RI": "44", "SC": "45",
  "SD": "46", "TN": "47", "TX": "48", "UT": "49", "VT": "50",
  "VA": "51", "WA": "53", "WV": "54", "WI": "55", "WY": "56",
  "DC": "11"
};

const siteDescriptions: Record<string, string> = {
  "AnnapolisDirections.com": "Our charming capital city on the beautiful bay.",
  "BaltimoreDirections.com": "Maryland's largest city with endless things to explore.",
  "FrederickDirections.com": "Historic downtown, shopping, dining & outdoor activities.",
  "OceanCityDirections.com": "Beach life, boardwalk fun & coastal getaways.",
  "DaytonaDirections.com": "World famous beaches and high-speed racing history.",
  "FortLauderdaleDirections.com": "Venice of America, beautiful canals and yachting.",
  "FortMyersDirections.com": "Gorgeous beaches, fishing, and warm winter retreats.",
  "JacksonvilleDirections.com": "Florida's river city by the sea with rich heritage.",
  "MiamiDirections.com": "Vibrant nightlife, art deco culture, and tropical beaches.",
  "NaplesDirections.com": "High-end shopping, white sand beaches, and golf courses.",
  "OrlandoDirections.com": "Theme parks, family entertainment, and sunshine.",
  "KeyWestDirections.com": "Island style, historic homes, and gorgeous sunsets.",
  "TampaDirections.com": "Cigar history, theme parks, and waterfront views.",
  "DCDirections.com": "Our nation's capital with monuments and museums.",
};

const siteTextColors: Record<string, string> = {
  "AnnapolisDirections.com": "text-orange-550",
  "BaltimoreDirections.com": "text-blue-500",
  "OceanCityDirections.com": "text-emerald-500",
  "FrederickDirections.com": "text-violet-500",
  "KeyWestDirections.com": "text-pink-500",
  "DaytonaDirections.com": "text-amber-500",
  "TampaDirections.com": "text-red-500",
  "OrlandoDirections.com": "text-indigo-500",
  "MiamiDirections.com": "text-cyan-500",
  "FortLauderdaleDirections.com": "text-fuchsia-500",
  "FortMyersDirections.com": "text-teal-500",
  "JacksonvilleDirections.com": "text-lime-500",
  "NaplesDirections.com": "text-emerald-600",
  "DCDirections.com": "text-slate-500",
};

function domainFromSite(site: any) {
  const configuredDomain = site?.URL?.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
  const requestDomain = site?.domain?.replace(/^www\./, "").replace(/\/$/, "");
  return configuredDomain || (!requestDomain?.includes("localhost") ? requestDomain : null) || "oceancitydirections.com";
}

function countyNames(site: any) {
  const source = site?.DisplayCounties?.length ? site.DisplayCounties : site?.DefaultCounties || [];
  return source.slice(0, 6).map((name: string) => ucwords(name));
}

interface HomeRevampProps {
  site: any;
  topBusinesses?: any[];
  featuredVideos?: any[];
  showRealty?: boolean;
}

export default function HomeRevamp({ site, topBusinesses = [], featuredVideos = [], showRealty }: HomeRevampProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedBizCategory, setSelectedBizCategory] = useState("restaurant");
  const [selectedSearchTab, setSelectedSearchTab] = useState("All");

  const siteName = getSiteName(site);
  const domain = domainFromSite(site);
  const counties = countyNames(site);

  const displayCountiesList = (site.DisplayCounties?.length ? site.DisplayCounties : (site.DefaultCounties || []))
    .map((name: string) => ucwords(name));
  const cities = site.popular_cities;

  const getCountyImage = (county: string) => {
    if (!Array.isArray(cities)) return "/images/destinations/destinations9.jpg";
    const cityData = cities.find(
      (c: any) => c.name?.toLowerCase() === county.trim().toLowerCase() ||
           Object.keys(c)[0] === county.trim().toLowerCase()
    );
    const imagePath = cityData ? (cityData.image || cityData[county.toLowerCase()]) : null;
    if (!imagePath) return "/images/destinations/destinations9.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    return imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  };

  const upperStateAbbr = site?.ShortState?.toUpperCase() || "MD";
  const stateFips = stateFipsMap[upperStateAbbr] || "24";
  const stateConfig = mapDataJson[stateFips as keyof typeof mapDataJson];
  
  // Extract unique active sites in this state dynamically
  const stateSites = stateConfig
    ? Object.values(stateConfig.counties)
        .filter((c: any) => c.enabled && c.siteName)
        .reduce((acc: any[], county: any) => {
          if (!acc.some(x => x.name === county.siteName)) {
            acc.push({
              name: county.siteName,
              url: county.url,
              desc: siteDescriptions[county.siteName] || "Explore local businesses and property listings.",
              colorClass: siteTextColors[county.siteName] || "text-orange-550"
            });
          }
          return acc;
        }, [])
        .slice(0, 4) // Show top 4
    : [];
  const featureImage = site?.slides?.swiper?.[0]?.img || "/img/photo/ocean-city-md-boardwalk.jpg";

  // Fallbacks for videos to match the premium Annapolis directions layout
  const defaultVideos = [
    {
      video_id: "spotlight",
      title: `Why People Love Living in ${siteName.replace("Directions", "")}`,
      thumbnail: "/images/about-img.jpg",
      p_id_b_slug: "about",
      embeded_for: "community",
      category: "Community Spotlight",
      duration: "2:48"
    },
    {
      video_id: "v1",
      title: `${siteName.replace("Directions", "")} on the Water`,
      thumbnail: "/images/main-banner-bg1.jpg",
      p_id_b_slug: "realty",
      embeded_for: "community",
      category: "Neighborhood Tour",
      duration: "3:15"
    },
    {
      video_id: "v2",
      title: "Local Business Spotlight",
      thumbnail: "/images/main-banner-bg2.jpg",
      p_id_b_slug: "business",
      embeded_for: "community",
      category: "Meet a Local Pro",
      duration: "1:50"
    },
    {
      video_id: "v3",
      title: `${siteName.replace("Directions", "")} Neighborhoods`,
      thumbnail: "/images/main-banner-bg3.jpg",
      p_id_b_slug: "realty",
      embeded_for: "community",
      category: "Community Guide",
      duration: "4:05"
    }
  ];

  const mergedVideos = [...featuredVideos];
  while (mergedVideos.length < 4) {
    const fallback = defaultVideos[mergedVideos.length];
    mergedVideos.push(fallback);
  }

  const mainSpotlightVideo = mergedVideos[0];
  const listVideos = mergedVideos.slice(1, 4);

  // Mock businesses for category tabs to populate listing nicely if DB is clean
  // Use dynamic city/state from site config so any city site shows correct location
  const mockCity = site?.City || site?.city || "Local";
  const mockState = site?.ShortState?.toUpperCase() || "MD";

  const mockBusinesses: Record<string, any[]> = {
    restaurant: [
      {
        id: "mock-r1",
        title: `${mockCity} Waterfront Grill`,
        category: "Waterfront Dining",
        description: `A beloved ${mockCity} institution famous for fresh local seafood and a sailor-friendly atmosphere near the harbor.`,
        stars: 4.8, reviews: 238,
        city: mockCity, state: mockState,
        main_image: "/images/about-img.jpg", slug: "waterfront-grill"
      },
      {
        id: "mock-r2",
        title: "Bay View Cafe",
        category: "Waterfront Dining",
        description: `Fine dining overlooking the bay, specializing in local seafood and premium steak options in ${mockCity}.`,
        stars: 4.7, reviews: 184,
        city: mockCity, state: mockState,
        main_image: "/images/main-banner-bg2.jpg", slug: "bay-view-cafe"
      },
      {
        id: "mock-r3",
        title: "The Local Seafood Co.",
        category: "Seafood Dining",
        description: `Cozy upscale venue offering creative, high-end seafood preparations in a historic ${mockCity} neighborhood.`,
        stars: 4.9, reviews: 142,
        city: mockCity, state: mockState,
        main_image: "/images/main-banner-bg3.jpg", slug: "local-seafood"
      }
    ],
    "coffee-shop": [
      {
        id: "mock-c1",
        title: "Rise Up Coffee",
        category: "Coffee Shop",
        description: "Local craft coffee roaster offering organic, fair-trade coffee drinks, bakery treats, and breakfast items.",
        stars: 4.8, reviews: 124,
        city: mockCity, state: mockState,
        main_image: "/images/main-banner-bg4.jpg", slug: "rise-up-coffee"
      },
      {
        id: "mock-c2",
        title: "Corner Cup Espresso",
        category: "Coffee Shop",
        description: "A community-focused coffee shop serving high-quality espresso drinks and fresh bakery items.",
        stars: 4.9, reviews: 96,
        city: mockCity, state: mockState,
        main_image: "/images/main-banner-bg5.jpg", slug: "corner-cup"
      }
    ],
    medical: [
      {
        id: "mock-m1",
        title: `${mockCity} Performance PT`,
        category: "Physical Therapy",
        description: "Specialized sports rehabilitation and physical therapy clinic helping local active individuals recover fully.",
        stars: 4.9, reviews: 97,
        city: mockCity, state: mockState,
        main_image: "/images/main-banner-bg6.jpg", slug: "performance-pt"
      }
    ],
    fitness: [
      {
        id: "mock-f1",
        title: `${mockCity} Fitness Center`,
        category: "Gym & Fitness",
        description: "Local community gym offering state-of-the-art machines, group classes, and personalized coaching.",
        stars: 4.7, reviews: 83,
        city: mockCity, state: mockState,
        main_image: "/images/about-img.jpg", slug: "fitness-center"
      }
    ],
    "home-services": [
      {
        id: "mock-h1",
        title: "Bay Plumbers & HVAC",
        category: "Home Plumbing",
        description: "Reliable, 24/7 residential plumbing and heating services for local communities around the bay.",
        stars: 4.8, reviews: 154,
        city: mockCity, state: mockState,
        main_image: "/images/main-banner-bg1.jpg", slug: "bay-plumbers"
      }
    ],
    shopping: [
      {
        id: "mock-s1",
        title: "Historic District Boutiques",
        category: "Local Shopping",
        description: `Charming independent retail shops selling unique apparel, gifts, art, and home decor in ${mockCity}.`,
        stars: 4.6, reviews: 112,
        city: mockCity, state: mockState,
        main_image: "/images/main-banner-bg3.jpg", slug: "historic-boutiques"
      }
    ]
  };


  const filteredBusinessesForGrid = topBusinesses.filter(b => {
    if (!selectedBizCategory) return true;
    return b.categories?.name?.toLowerCase().includes(selectedBizCategory.toLowerCase()) ||
           b.category?.toLowerCase().includes(selectedBizCategory.toLowerCase());
  }).slice(0, 12);

  const activeGridBusinesses = filteredBusinessesForGrid.length > 0 
    ? filteredBusinessesForGrid 
    : (mockBusinesses[selectedBizCategory] || []).slice(0, 12);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = [];
    if (searchQuery) queryParams.push(`q=${encodeURIComponent(searchQuery)}`);
    if (locationQuery) queryParams.push(`l=${encodeURIComponent(locationQuery)}`);
    
    const queryString = queryParams.length ? `?${queryParams.join("&")}` : "";
    if (showRealty) {
      window.location.href = `/realty${queryString}`;
    } else {
      window.location.href = `/business${queryString}`;
    }
  };

  // 8 Quick Categories matching the new design layout
  const heroCategories = [
    { label: "Restaurants", icon: "bx-restaurant", href: "/business?category=restaurant" },
    { label: "Cafes", icon: "bx-coffee", href: "/business?category=coffee-shop" },
    { label: "Health", icon: "bx-plus-medical", href: "/business?category=medical" },
    { label: "Home Services", icon: "bx-wrench", href: "/business?category=home-services" },
    { label: "Real Estate", icon: "bx-home", href: "/realty" },
    { label: "Retail", icon: "bx-shopping-bag", href: "/business?category=shopping" },
    { label: "Fitness", icon: "bx-dumbbell", href: "/business?category=fitness" },
    { label: "More", icon: "bx-dots-horizontal-rounded", href: "/business" },
  ];

  const HeroMap = () => {
    return (
      <div className="hero-map" aria-hidden="true" style={{ pointerEvents: 'auto' }}>
        <div className="hero-map-slider-wrapper">
          <Swiper
            spaceBetween={0}
            centeredSlides={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            modules={[Autoplay, Pagination]}
            pagination={{ clickable: true }}
            className="hero-map-swiper"
          >
            {site.slides?.swiper?.map((slide: any, index: number) => (
              <SwiperSlide key={index} className="w-full h-full relative">
                <Image
                  src={slide.img}
                  alt={`${siteName} slide ${index + 1}`}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 760px"
                  style={{ objectFit: "cover" }}
                />
              </SwiperSlide>
            ))}
            {(!site.slides?.swiper || site.slides.swiper.length === 0) && (
              <SwiperSlide className="w-full h-full relative">
                <Image
                  src="/images/about-img.jpg"
                  alt={`${siteName} banner fallback`}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 760px"
                  style={{ objectFit: "cover" }}
                />
              </SwiperSlide>
            )}
          </Swiper>
        </div>

        {/* Hotspots overlay on top of the image slider */}
        <span className="map-dot dot-1">
          <i className="bx bx-map text-white bg-orange-605 rounded-full p-0.5 text-xs mr-1"></i> Boutique Shops
        </span>
        <span className="map-dot dot-2">
          <i className="bx bx-map text-white bg-orange-605 rounded-full p-0.5 text-xs mr-1"></i> Waterfront Dining
        </span>
        <span className="map-dot dot-3">
          <i className="bx bx-map text-white bg-orange-605 rounded-full p-0.5 text-xs mr-1"></i> Top Rated Service
        </span>
        <span className="map-dot dot-4">
          <i className="bx bx-map text-white bg-orange-605 rounded-full p-0.5 text-xs mr-1"></i> Local Events
        </span>
        <span className="map-dot dot-5">
          <i className="bx bx-map text-white bg-orange-605 rounded-full p-0.5 text-xs mr-1"></i> Top Rated Sale
        </span>
      </div>
    );
  };

  return (
    <div className="app-shell">
      {/* 1. Hero Section */}
      <section className="hero-section">
        <HeroMap />
        <div className="hero-content wrap">
          <div className="hero-copy">
            <span className="eyebrow">Local discovery hub</span>
            <h1>
              Discover {mockCity}.
              <br />
              <span>Support Local.</span>
            </h1>
            <p>Find the best local businesses, trusted services, and properties that make our community special.</p>
          </div>
          
          {/* Search Dock */}
          <div className="search-dock">
            <div className="search-tabs" role="tablist" aria-label="Search categories">
              {["All", "Homes", "Businesses", "Services", "Events"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setSelectedSearchTab(tab);
                    if (tab === "Homes") setSearchQuery("");
                  }}
                  className={selectedSearchTab === tab ? "active" : ""}
                >
                  {tab}
                </button>
              ))}
            </div>
            <form onSubmit={handleSearchSubmit} className="search-row">
              <label className="search-input">
                <i className="bx bx-search text-slate-400 text-lg mr-2 shrink-0"></i>
                <input
                  type="text"
                  placeholder={
                    selectedSearchTab === "Homes"
                      ? "Search by address, subdivision, or MLS ID..."
                      : "What are you looking for?"
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ background: 'transparent', border: '0', outline: 'none', width: '100%' }}
                />
              </label>
              <label className="search-input location-input">
                <i className="bx bx-map text-slate-400 text-lg mr-2 shrink-0"></i>
                <input
                  type="text"
                  placeholder="Location (city, ZIP, or state)"
                  value={locationQuery || `${mockCity}, ${mockState}`}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  style={{ background: 'transparent', border: '0', outline: 'none', width: '100%' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition((pos) => {
                        setLocationQuery(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
                        toast.success("Location set from browser gps");
                      });
                    }
                  }}
                  className="text-slate-400 hover:text-orange-600 transition ml-1 shrink-0"
                  style={{ background: 'transparent', border: '0' }}
                  title="Use current location"
                >
                  <i className="bx bx-target-lock text-base"></i>
                </button>
              </label>
              <button type="submit" className="search-btn">
                <i className="bx bx-search text-white mr-1.5"></i>
                Search
              </button>
            </form>
          </div>

          {/* Popular searches row */}
          <div className="popular-row">
            <strong>Popular Searches:</strong>
            <Link href="/realty?q=waterfront">Waterfront Homes</Link>
            <Link href="/business?q=restaurant">Restaurants</Link>
            <Link href="/business?q=marina">Marinas</Link>
            <Link href="/business?q=contractor">Contractors</Link>
            <Link href="/business?q=boutique">Boutique Shops</Link>
          </div>
        </div>
      </section>

      {/* 2. Category Rail */}
      <section className="category-rail wrap">
        {[
          { label: "Top Rated Businesses", icon: "bx-award", href: "/business" },
          { label: "Real Estate Listings", icon: "bx-home-alt", href: "/realty" },
          { label: "Local Services", icon: "bx-wrench", href: "/business?category=home-services" },
          { label: "Food & Drink", icon: "bx-restaurant", href: "/business?category=restaurant" },
          { label: "Health & Wellness", icon: "bx-heart", href: "/business?category=medical" },
          { label: "Home Services", icon: "bx-building-house", href: "/business?category=home-services" },
          { label: "Events & Things To Do", icon: "bx-calendar-event", href: "/blog" },
          { label: "Local Guides", icon: "bx-map-alt", href: "/blog" },
        ].map((cat) => (
          <Link className="category-item" key={cat.label} href={cat.href}>
            <span><i className={`bx ${cat.icon}`}></i></span>
            <strong>{cat.label}</strong>
          </Link>
        ))}
      </section>

      {/* 3. Watch Section (Spotlight Videos) */}
      {featuredVideos.length > 0 && (
        <section className="video-section wrap split-grid">
          <Link
            href={featuredVideos[0].embeded_for === "property" ? `/realty/${featuredVideos[0].p_id_b_slug}` : `/s/${featuredVideos[0].p_id_b_slug || ""}`}
            className="video-main scenic-card"
            style={{
              backgroundImage: `url(${featuredVideos[0].thumbnail || "/images/about-img.jpg"})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="play-circle">
              <i className="bx bx-play text-slate-900 text-3xl pl-1"></i>
            </div>
            <div className="video-caption">
              <span>Community Spotlight</span>
              <h2>{featuredVideos[0].title}</h2>
            </div>
            <time>{featuredVideos[0].duration || "2:48"}</time>
          </Link>
          <div className="video-list">
            {featuredVideos.slice(1, 4).map((video, index) => (
              <Link
                href={video.embeded_for === "property" ? `/realty/${video.p_id_b_slug}` : `/s/${video.p_id_b_slug || ""}`}
                className="video-mini"
                key={video.video_id || index}
              >
                <span className="thumb">
                  <i className="bx bx-play text-white text-base"></i>
                </span>
                <div>
                  <h3>{video.title}</h3>
                  <p>{video.category || "Neighborhood Tour"}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 4. Explore Section with USStateMap and Filters */}
      <section className="explore-section soft-section">
        <div className="wrap explore-grid">
          <div className="section-intro">
            <span className="eyebrow orange">Explore {mockCity}</span>
            <h2>
              Explore {mockState === "MD" ? "Maryland" : mockState}
              <br />
              Locations
            </h2>
            <p>Interactive map, local insights, and curated favorites — discover what {mockCity} has to offer.</p>
            <Link className="outline-btn" href="/business">
              View All Areas
            </Link>
            <div className="stat-row mini">
              <div className="stat-item">
                <strong>12+</strong>
                <small>Neighborhoods</small>
              </div>
              <div className="stat-item">
                <strong>850+</strong>
                <small>Local Businesses</small>
              </div>
              <div className="stat-item">
                <strong>1.2K+</strong>
                <small>Homes For Sale</small>
              </div>
            </div>
          </div>
          <div className="map-board">
            <USStateMap stateAbbr={site?.ShortState || "MD"} currentDomain={domain} />
            <div className="map-filter-card">
              <h3>Map Filters</h3>
              {[
                { label: "Homes for Sale", color: "color-0" },
                { label: "Businesses", color: "color-1" },
                { label: "Services", color: "color-2" },
                { label: "Restaurants", color: "color-3" },
                { label: "Events", color: "color-4" },
              ].map((filter) => (
                <label key={filter.label}>
                  <span className={`legend-dot ${filter.color}`}></span>
                  {filter.label}
                </label>
              ))}
              <button type="button">
                Show Results <small>1,348 results</small>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4.5. Explore Counties Bento Grid */}
      {displayCountiesList.length > 0 && (
        <section className="wrap counties-section py-14 space-y-8">
          <div className="section-header">
            <div>
              <span className="eyebrow orange">Explore by Region</span>
              <h2 className="font-serif">Explore Local Counties</h2>
            </div>
            <Link href="/realty">
              Show All Areas <i className="bx bx-right-arrow-alt align-middle ml-1"></i>
            </Link>
          </div>

          <div className="counties-grid">
            {displayCountiesList.map((county: string, index: number) => {
              const isLarge = index === 0 || index === 3 || index === 6;
              return (
                <div
                  key={county}
                  className={`county-card ${isLarge ? 'county-large' : 'county-normal'}`}
                >
                  <Image
                    src={getCountyImage(county)}
                    alt={county}
                    fill
                    sizes={isLarge ? "(max-width: 768px) 100vw, 600px" : "(max-width: 768px) 100vw, 300px"}
                    className="county-card-img"
                    style={{ objectFit: 'cover' }}
                  />
                  <div className="county-card-overlay" />
                  <div className="county-card-content">
                    <span className="county-eyebrow">{siteName}</span>
                    <h3 className="county-title">{county}</h3>
                  </div>
                  <Link
                    href={`/realty/location/${encodeURIComponent(county.toLowerCase())}`}
                    aria-label={`View real estate in ${county}`}
                    className="absolute inset-0 z-10"
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. Featured Listings (Homes You'll Love) */}
      {showRealty && (
        <section className="wrap listing-section">
          <div className="section-header">
            <div>
              <span className="eyebrow">Featured Listings</span>
              <h2>Homes You’ll Love</h2>
            </div>
            <Link href="/realty">
              View All Homes <i className="bx bx-right-arrow-alt align-middle ml-1"></i>
            </Link>
          </div>
          <div className="rd-home-listings">
            <HomepageListings />
          </div>
        </section>
      )}

      {/* 6. Trusted Local Businesses */}
      <section className="wrap listing-section local-businesses">
        <div className="section-header">
          <div>
            <span className="eyebrow">Local Businesses</span>
            <h2>Trusted Local Businesses</h2>
          </div>
          <Link href="/business">
            View All Businesses <i className="bx bx-right-arrow-alt align-middle ml-1"></i>
          </Link>
        </div>
        <div className="card-grid business-grid-small">
          {topBusinesses.slice(0, 4).map((biz, index) => {
            const listingImg = biz.main_image;
            const isCdn = listingImg && 
              (listingImg.startsWith('http') || listingImg.includes('cdn')) && 
              !listingImg.startsWith('/api/og') && 
              !listingImg.includes('placeholder') &&
              listingImg !== '/images/about-img.jpg';
            return (
              <Link href={`/s/${biz.update_slug || biz.slug}`} className="business-logo-card" key={biz.id || index}>
                {isCdn ? (
                  <div className="relative h-[138px] w-full overflow-hidden" style={{ borderRadius: '18px 18px 0 0' }}>
                    <Image
                      src={listingImg}
                      alt={biz.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, 280px"
                    />
                  </div>
                ) : (
                  <div className={`biz-logo logo-${index % 4}`}>
                    {biz.title}
                  </div>
                )}
                <div>
                  <span>{Array.isArray(biz.categories) ? biz.categories[0] : (biz.categories?.name || biz.category || "Local")}</span>
                  <h3>{biz.title}</h3>
                  <div className="biz-rating" style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#f59e0b", fontWeight: "bold" }}>
                    <span>{biz.rating?.value || biz.stars || 4.8}</span>
                    <i className="bx bxs-star text-[10px]"></i>
                    <span style={{ color: "#9aa3b3", fontWeight: "normal", fontSize: "10px" }}>({biz.rating?.reviews || biz.reviews || 120})</span>
                  </div>
                  <p>{biz.city ? `${biz.city}, ${biz.state}` : domain}</p>
                </div>
              </Link>
            );
          })}
          {!topBusinesses.length && (
            <div className="col-span-full bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-sm">
              <i className="bx bx-store-alt text-4xl mb-2 block"></i>
              <span>No claimed businesses listed.</span>
            </div>
          )}
        </div>
      </section>

      {/* 7. Call To Action section (Help You Find It) */}
      <section className="wrap help-panel">
        <div className="help-copy">
          <span className="eyebrow orange">What are you looking for?</span>
          <h2>We’re Here to Help You<br />Find It.</h2>
          <div className="help-list">
            <div className="feature-mini">
              <span><i className="bx bx-home-alt"></i></span>
              <div>
                <h3>Find the Right Pro</h3>
                <p>Connect with top-rated local professionals and services.</p>
              </div>
            </div>
            <div className="feature-mini">
              <span><i className="bx bx-store-alt"></i></span>
              <div>
                <h3>Need Business Growth?</h3>
                <p>Get discovered by locals and grow your business.</p>
              </div>
            </div>
            <div className="feature-mini">
              <span><i className="bx bx-slideshow"></i></span>
              <div>
                <h3>Are You a Media Pro?</h3>
                <p>Partner with us to feature businesses and stories.</p>
              </div>
            </div>
            <div className="feature-mini">
              <span><i className="bx bx-plus"></i></span>
              <div>
                <h3>List Your Property or Business</h3>
                <p>Reach more local customers and buyers.</p>
              </div>
            </div>
          </div>
          <Link className="dark-btn" href="/dashboard/add-business">
            Get Started Today
          </Link>
        </div>
        <div className="media-cta scenic-side">
          <div className="search-dock compact">
            <div className="search-tabs" role="tablist" aria-label="Search categories">
              {["Homes", "Businesses", "Services", "Events"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setSelectedSearchTab(tab === "Homes" ? "Homes" : tab === "Businesses" ? "Businesses" : tab === "Services" ? "Services" : "Events");
                  }}
                  className={selectedSearchTab === tab ? "active" : ""}
                >
                  {tab}
                </button>
              ))}
            </div>
            <form onSubmit={handleSearchSubmit} className="search-row" style={{ gridTemplateColumns: "1fr 80px" }}>
              <label className="search-input" style={{ minHeight: "48px", padding: "0 12px" }}>
                <i className="bx bx-search text-slate-400 text-sm mr-1.5 shrink-0"></i>
                <input
                  type="text"
                  placeholder={`Search ${mockCity}...`}
                  style={{ fontSize: "12px", background: 'transparent', border: '0', outline: 'none', width: '100%' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-0 outline-none w-full text-slate-800 font-medium placeholder-slate-400"
                />
              </label>
              <button type="submit" className="search-btn" style={{ minHeight: "48px", fontSize: "12px" }}>
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 8. Newsletter Section ("Stay in the Know.") */}
      <section className="newsletter-band">
        <div className="wrap newsletter-grid">
          <div>
            <h2>Stay in the Know.</h2>
            <p>Local tips, new listings, and community highlights.</p>
            <form onSubmit={(e) => { e.preventDefault(); toast.success("Subscribed successfully!"); }} className="subscribe-form">
              <input placeholder="Your email address" type="email" required />
              <button type="submit">Subscribe</button>
            </form>
          </div>
          <div className="stat-row big">
            <div className="stat-item">
              <strong>12+</strong>
              <small>Neighborhoods</small>
            </div>
            <div className="stat-item">
              <strong>850+</strong>
              <small>Businesses</small>
            </div>
            <div className="stat-item">
              <strong>2.5K+</strong>
              <small>Community Members</small>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

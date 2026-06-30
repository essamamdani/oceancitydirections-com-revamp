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

  const siteName = getSiteName(site);
  const domain = domainFromSite(site);
  const counties = countyNames(site);

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

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased text-slate-800 pb-20">
      
      {/* H02: Premium Light Hero Section with Background Slider */}
      <section className="relative min-h-[640px] w-full bg-slate-900 flex flex-col items-center justify-center overflow-hidden pt-28 pb-20 border-b border-slate-200/60">
        
        {/* Background Swiper Slider */}
        <div className="absolute inset-0 w-full h-full z-0 select-none">
          <Swiper
            spaceBetween={0}
            centeredSlides={true}
            autoplay={{
              delay: 6000,
              disableOnInteraction: false,
            }}
            modules={[Autoplay]}
            className="w-full h-full"
          >
            {site.slides?.swiper?.map((slide: any, index: number) => (
              <SwiperSlide key={index} className="w-full h-full relative">
                <Image
                  src={slide.img}
                  alt={`${siteName} banner ${index + 1}`}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  style={{ objectFit: "cover", opacity: 0.35 }}
                />
              </SwiperSlide>
            ))}
            {(!site.slides?.swiper || site.slides.swiper.length === 0) && (
              <SwiperSlide className="w-full h-full relative">
                <Image
                  src={featureImage}
                  alt={`${siteName} hero background`}
                  fill
                  priority
                  sizes="100vw"
                  style={{ objectFit: "cover", opacity: 0.35 }}
                />
              </SwiperSlide>
            )}
          </Swiper>
        </div>

        {/* Light radial/linear gradient overlay to ensure readable typography */}
        <div className="absolute inset-0 bg-[#FAF9F6]/90 backdrop-blur-[2px] z-1 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center px-4 relative z-10 space-y-6 w-full">
          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-[0.25em] block mb-2">
            Hyperlocal · Human · Helpful
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-none font-serif max-w-3xl mx-auto">
            Discover {siteName.replace("Directions", "")}
            <span className="block text-orange-600 mt-2 font-serif italic font-normal">Support Local.</span>
          </h1>
          <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Find the best local businesses, trusted services, and properties that make our community special.
          </p>

          {/* Unified Side-by-Side Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2.5 flex flex-col md:flex-row items-center gap-2 mt-8 w-full">
            <div className="flex-1 flex items-center px-3 gap-3 w-full">
              <i className="bx bx-search text-slate-400 text-xl"></i>
              <input
                type="text"
                placeholder="What are you looking for?"
                className="w-full bg-transparent outline-none text-slate-800 text-sm py-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="hidden md:block h-8 w-px bg-slate-200 mx-1"></div>
            
            <div className="flex-1 flex items-center px-3 gap-3 w-full">
              <i className="bx bx-map text-slate-400 text-xl"></i>
              <input
                type="text"
                placeholder="Near me (city, ZIP, or address)"
                className="w-full bg-transparent outline-none text-slate-800 text-sm py-2"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
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
                className="text-slate-400 hover:text-orange-600 transition"
                title="Use current location"
              >
                <i className="bx bx-target-lock text-lg"></i>
              </button>
            </div>
            
            <button type="submit" className="w-full md:w-auto bg-slate-950 hover:bg-slate-900 text-white rounded-xl px-7 py-3 font-semibold transition text-sm flex items-center justify-center gap-2 shrink-0">
              <i className="bx bx-search text-base"></i>
              Search
            </button>
          </form>

          {/* Quick Categories list grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 max-w-5xl mx-auto mt-10 w-full">
            {heroCategories.filter(cat => showRealty || cat.label !== "Real Estate").map((cat) => (
              <Link
                href={cat.href}
                key={cat.label}
                className="bg-white border border-slate-200/80 hover:border-orange-500 hover:shadow-md rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition duration-300 group shadow-xs cursor-pointer"
              >
                <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-slate-950 group-hover:text-white transition duration-300">
                  <i className={`bx ${cat.icon} text-lg`}></i>
                </span>
                <span className="text-[11px] text-slate-700 font-bold group-hover:text-orange-600 transition">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Platform features/pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mt-14 pt-8 border-t border-slate-200/60 w-full text-left">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
                <i className="bx bx-award text-base"></i>
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Local First</h4>
                <p className="text-[11px] text-slate-500 mt-1 font-medium leading-relaxed">
                  We spotlight the best independent businesses.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
                <i className="bx bx-star text-base"></i>
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Trusted Reviews</h4>
                <p className="text-[11px] text-slate-500 mt-1 font-medium leading-relaxed">
                  Real experiences from real people in town.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
                <i className="bx bx-check-shield text-base"></i>
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Clear &amp; Simple</h4>
                <p className="text-[11px] text-slate-500 mt-1 font-medium leading-relaxed">
                  Everything you need, nothing you don't.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
                <i className="bx bx-group text-base"></i>
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Built for Community</h4>
                <p className="text-[11px] text-slate-500 mt-1 font-medium leading-relaxed">
                  Stronger connections, stronger neighborhoods.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* H04: Watch Section (Full Width Layout) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-14 space-y-6">
        <div className="flex justify-between items-end border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block">Video Highlights</span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-950 font-serif">Watch {siteName.replace("Directions", "")}</h2>
            <p className="text-xs text-slate-400 font-medium mt-1">Local stories, expert tips and community highlights.</p>
          </div>
          <Link href="/blog" className="text-xs font-bold text-orange-605 hover:underline">
            View All Videos &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left big spotlight video */}
          <div className="lg:col-span-8">
            {mainSpotlightVideo ? (
              <Link
                href={mainSpotlightVideo.embeded_for === "property" ? `/realty/${mainSpotlightVideo.p_id_b_slug}` : `/s/${mainSpotlightVideo.p_id_b_slug || ""}`}
                className="block relative h-[380px] md:h-[480px] w-full rounded-2xl bg-slate-950 overflow-hidden group shadow-sm"
              >
                <Image
                  src={mainSpotlightVideo.thumbnail || "/images/about-img.jpg"}
                  alt={mainSpotlightVideo.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/30 transition flex items-center justify-center">
                  <span className="w-16 h-16 rounded-full bg-white/95 text-slate-900 flex items-center justify-center shadow-lg transform group-hover:scale-105 transition duration-300">
                    <i className="bx bx-play text-4xl pl-1"></i>
                  </span>
                </div>

                {/* Text Overlay at bottom */}
                <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white flex justify-between items-end">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-orange-400 font-bold block mb-1">
                      {mainSpotlightVideo.category || "Community Spotlight"}
                    </span>
                    <h3 className="font-bold text-white text-lg md:text-xl leading-snug line-clamp-2 max-w-xl">
                      {mainSpotlightVideo.title}
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-black/50 rounded text-slate-200 shrink-0 ml-3">
                    {mainSpotlightVideo.duration || "2:48"}
                  </span>
                </div>
              </Link>
            ) : (
              <div className="h-[380px] md:h-[480px] w-full rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                <i className="bx bx-video-off text-4xl"></i>
              </div>
            )}
          </div>

          {/* Right stack of smaller videos */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-4">
            {listVideos.map((video) => (
              <Link
                href={video.embeded_for === "property" ? `/realty/${video.p_id_b_slug}` : `/s/${video.p_id_b_slug || ""}`}
                className="flex items-center gap-4 p-3 bg-white rounded-2xl border border-slate-200/80 hover:border-slate-350 hover:bg-slate-50 transition duration-200 group flex-1"
                key={video.video_id || video.title}
              >
                <div className="relative h-20 w-28 rounded-xl bg-slate-900 overflow-hidden shrink-0">
                  <Image
                    src={video.thumbnail || "/images/about-img.jpg"}
                    alt={video.title}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                  <div className="absolute inset-0 bg-slate-950/20 flex items-center justify-center">
                    <span className="w-8 h-8 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-sm">
                      <i className="bx bx-play text-base pl-0.5"></i>
                    </span>
                  </div>
                </div>
                <div className="min-w-0 space-y-1">
                  <h4 className="font-bold text-slate-800 text-sm line-clamp-2 group-hover:text-orange-605 transition">
                    {video.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    {video.category || "Neighborhood Tour"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* H05: Explore Locations Map (Dedicated Full-Width Section) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs">
          
          <div className="border-b border-slate-100 pb-5 mb-6">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block">Interactive Network</span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-950 font-serif">Explore {site?.State || "Maryland"} Locations</h2>
            <p className="text-xs text-slate-400 font-medium mt-1">Find great places in cities and towns near you.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* SVG county map (7 cols) */}
            <div className="lg:col-span-7 flex justify-center bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="w-full max-w-[500px]">
                <USStateMap 
                  stateAbbr={site?.ShortState || "MD"} 
                  currentDomain={domain} 
                />
              </div>
            </div>

            {/* Active Locations list panel (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider block">Active City Portals</h3>
              
              <div className="divide-y divide-slate-100">
                {stateSites.map((loc: any) => (
                  <a
                    href={loc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between py-3.5 group hover:px-2 rounded-xl transition-all duration-200 hover:bg-slate-50"
                    key={loc.name}
                  >
                    <div className="flex items-start gap-3">
                      <i className={`bx bxs-map ${loc.colorClass} text-lg mt-0.5`}></i>
                      <div>
                        <strong className="block font-bold text-slate-950 text-sm group-hover:text-orange-605 transition">
                          {loc.name}
                        </strong>
                        <span className="text-xs text-slate-500 font-medium leading-tight block mt-0.5">
                          {loc.desc}
                        </span>
                      </div>
                    </div>
                    <i className="bx bx-chevron-right text-slate-300 text-xl group-hover:text-orange-605 group-hover:translate-x-1 transition-all shrink-0"></i>
                  </a>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <Link
                  href="/business"
                  className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold py-3.5 px-6 rounded-xl transition text-sm flex items-center justify-center gap-1.5 shadow-sm"
                >
                  View All Directory Locations
                  <i className="bx bx-right-arrow-alt text-lg"></i>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* H06: Featured Homes */}
      {showRealty && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-6">
          <div className="flex justify-between items-end border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block font-sans">Direct MLS Feed</span>
              <h2 className="text-3xl font-bold text-slate-950 font-serif">Featured Listings</h2>
            </div>
            <Link href="/realty" className="text-xs font-bold text-orange-605 hover:underline">
              View All Homes &rarr;
            </Link>
          </div>

          <div className="rd-home-listings">
            <HomepageListings />
          </div>
        </section>
      )}

      {/* H07: Recent Claimed Businesses */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-8">
        <div className="flex justify-between items-end border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block font-sans">Local Directories</span>
            <h2 className="text-3xl font-bold text-slate-950 font-serif">Recent Claimed Businesses</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topBusinesses.slice(0, 3).map((biz, idx) => (
            <Link
              href={`/s/${biz.update_slug || biz.slug}`}
              className="bg-white border border-slate-200 hover:border-slate-350 hover:shadow-lg rounded-2xl overflow-hidden shadow-xs transition duration-300 group flex flex-col justify-between"
              key={biz.id || idx}
            >
              <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                <Image
                  src={biz.main_image || `/api/og?title=${encodeURIComponent(biz.title)}`}
                  alt={biz.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 360px"
                  style={{ objectFit: "cover" }}
                />
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-bold text-orange-700 bg-white px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-orange-100">
                    {Array.isArray(biz.categories) ? biz.categories[0] : (biz.categories?.name || biz.category || "Local")}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-950 text-md group-hover:text-orange-605 transition leading-snug line-clamp-1">
                    {biz.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {biz.description || "Explore products, verified contact details, driving directions, and local reviews."}
                  </p>
                </div>
                
                <div className="pt-4 border-t border-slate-100 mt-5 flex items-center justify-between text-xs text-slate-550 font-semibold">
                  <div className="flex items-center gap-1">
                    <i className="bx bxs-star text-amber-400 text-sm"></i>
                    <span>{biz.rating?.value || biz.stars || 4.8}</span>
                    <span className="text-slate-450 font-medium">({biz.rating?.reviews || biz.reviews || 97} reviews)</span>
                  </div>
                  <span>{biz.city ? `${biz.city}, ${biz.state}` : domain}</span>
                </div>
              </div>
            </Link>
          ))}
          {!topBusinesses.length && (
            <div className="col-span-full bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-sm">
              <i className="bx bx-store-alt text-4xl mb-2 block"></i>
              <span>No claimed businesses listed.</span>
            </div>
          )}
        </div>
      </section>

      {/* H08: Media Professionals Banner */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-8 p-8 md:p-12 space-y-6 flex flex-col justify-center">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-slate-950">Are you looking to list a property or promote a local business?</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center font-bold">
                  <i className="bx bx-search-alt text-lg"></i>
                </div>
                <strong className="text-sm font-bold text-slate-800 block">Find the Right Pro</strong>
                <p className="text-xs text-slate-500 font-medium">Connect with local experts who bring your vision to life.</p>
                <Link href="/merchants-media-pros" className="text-xs font-bold text-orange-605 hover:underline block pt-1">
                  Find a Pro &rarr;
                </Link>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center font-bold">
                  <i className="bx bx-buildings text-lg"></i>
                </div>
                <strong className="text-sm font-bold text-slate-800 block">Need Business Content?</strong>
                <p className="text-xs text-slate-500 font-medium">Work with trusted local pros to shoot and grow your brand.</p>
                <Link href="/dashboard/add-business" className="text-xs font-bold text-orange-605 hover:underline block pt-1">
                  Get Started &rarr;
                </Link>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center font-bold">
                  <i className="bx bx-camera text-lg"></i>
                </div>
                <strong className="text-sm font-bold text-slate-800 block">Are You a Media Pro?</strong>
                <p className="text-xs text-slate-500 font-medium">Join our network and shoot properties/businesses regionwide.</p>
                <Link href="/merchants-media-pros" className="text-xs font-bold text-orange-605 hover:underline block pt-1">
                  Join Our Network &rarr;
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block md:col-span-4 relative bg-slate-900 min-h-[320px]">
            <Image
              src="/images/media-pro-banner.jpg"
              alt="Media Pro Section Image"
              fill
              style={{ objectFit: "cover", opacity: 0.95 }}
            />
          </div>
        </div>
      </section>

    </div>
  );
}

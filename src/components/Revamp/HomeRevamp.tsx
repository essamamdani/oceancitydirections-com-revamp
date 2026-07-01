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
    <div className="min-h-screen bg-white font-sans antialiased text-slate-800 pb-20">
      
      {/* 1. Hero Section (Mockup-matched 2-Column Layout) */}
      <section className="relative w-full bg-[#FAF9F6] overflow-hidden pt-32 pb-24 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Typography, Tabs & Search */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-[0.2em] block">
              CONNECTING OUR COMMUNITY
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-none font-serif">
              Discover {mockCity}.
              <span className="block text-orange-600 mt-2 font-serif italic font-normal">Support Local.</span>
            </h1>
            <p className="text-sm md:text-base text-slate-600 max-w-xl leading-relaxed font-medium">
              Find the best local businesses, trusted services, and properties that make our community special.
            </p>

            {/* Custom Tab Selectors */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2 overflow-x-auto whitespace-nowrap scrollbar-none">
                {["All", "Homes", "Businesses", "Services", "Events"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setSelectedSearchTab(tab);
                      if (tab === "Homes") setSearchQuery("");
                    }}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 border-b-2 -mb-[10px] outline-none focus:outline-none focus:ring-0 ${
                      selectedSearchTab === tab
                        ? "border-orange-600 text-orange-600 font-extrabold"
                        : "border-transparent text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Mockup Search Form */}
              <form onSubmit={handleSearchSubmit} className="max-w-3xl bg-white rounded-2xl shadow-xl border border-slate-200 p-2.5 flex flex-col md:flex-row items-center gap-3 w-full">
                {/* Search input container */}
                <div className="flex items-center px-3 gap-3 w-full md:flex-1 md:w-0 border-b md:border-b-0 border-slate-100 md:pb-0 pb-2 min-w-0">
                  <i className="bx bx-search text-slate-400 text-xl shrink-0"></i>
                  <input
                    type="text"
                    placeholder={
                      selectedSearchTab === "Homes"
                        ? "Search by address, subdivision, or MLS ID..."
                        : "What are you looking for?"
                    }
                    className="w-full bg-transparent outline-none text-slate-800 text-sm py-2 font-medium placeholder-slate-400 min-w-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="hidden md:block h-8 w-px bg-slate-200 mx-1 shrink-0"></div>
                
                {/* Location input container */}
                <div className="flex items-center px-3 gap-3 w-full md:flex-1 md:w-0 md:pt-0 pt-2 min-w-0">
                  <i className="bx bx-map text-slate-400 text-xl shrink-0"></i>
                  <input
                    type="text"
                    placeholder="Location (city, ZIP, or state)"
                    className="w-full bg-transparent outline-none text-slate-800 text-sm py-2 font-medium placeholder-slate-400 min-w-0"
                    value={locationQuery || `${mockCity}, ${mockState}`}
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
                    className="text-slate-400 hover:text-orange-600 transition shrink-0"
                    title="Use current location"
                  >
                    <i className="bx bx-target-lock text-lg text-slate-400"></i>
                  </button>
                </div>
                
                {/* Search Button */}
                <button 
                  type="submit" 
                  className="w-full md:!w-auto md:flex-none bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-8 py-3 font-bold transition text-sm flex items-center justify-center gap-2 shrink-0 shadow-md shadow-orange-600/20 transform hover:-translate-y-0.5 duration-200"
                >
                  <i className="bx bx-search text-base"></i>
                  Search
                </button>
              </form>

              {/* Popular Searches */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 pt-2">
                <span className="text-slate-400">Popular Searches:</span>
                <Link href="/realty?q=waterfront" className="text-slate-600 hover:text-orange-600">Waterfront Homes</Link>
                <span>·</span>
                <Link href="/business?q=restaurant" className="text-slate-600 hover:text-orange-600">Restaurants</Link>
                <span>·</span>
                <Link href="/business?q=marina" className="text-slate-600 hover:text-orange-600">Marinas</Link>
                <span>·</span>
                <Link href="/business?q=contractor" className="text-slate-600 hover:text-orange-600">Contractors</Link>
                <span>·</span>
                <Link href="/business?q=boutique" className="text-slate-600 hover:text-orange-600">Boutique Shops</Link>
              </div>
            </div>
          </div>

          {/* Right Column: Premium map illustration with interactive pulsing hotspots */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            
            {/* Soft shadow background decoration */}
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-100/50 via-slate-100 to-orange-50/30 blur-3xl rounded-full transform -rotate-12 scale-90 -z-1"></div>

            <div className="relative w-full max-w-[540px] aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white bg-white/50 p-2 group">
              <Swiper
                spaceBetween={0}
                centeredSlides={true}
                autoplay={{
                  delay: 6000,
                  disableOnInteraction: false,
                }}
                modules={[Autoplay]}
                className="w-full h-full rounded-2xl"
              >
                {site.slides?.swiper?.map((slide: any, index: number) => (
                  <SwiperSlide key={index} className="w-full h-full relative">
                    <Image
                      src={slide.img}
                      alt={`${siteName} slide ${index + 1}`}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 768px) 100vw, 540px"
                      style={{ objectFit: "cover" }}
                    />
                  </SwiperSlide>
                ))}
                {(!site.slides?.swiper || site.slides.swiper.length === 0) && (
                  <SwiperSlide className="w-full h-full relative">
                    <Image
                      src={featureImage}
                      alt={`${siteName} illustration`}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 540px"
                      style={{ objectFit: "cover" }}
                    />
                  </SwiperSlide>
                )}
              </Swiper>

              {/* Graphic Hotspots Layer matching the mockup map overlay */}
              <div className="absolute inset-0 z-10 pointer-events-none">
                {/* 1. Waterfront Dining Hotspot */}
                <div className="absolute top-[12%] right-[15%] pointer-events-auto flex items-center gap-1 bg-white/95 backdrop-blur-xs border border-orange-100 px-2.5 py-1 rounded-full shadow-md transform hover:scale-105 transition cursor-pointer">
                  <span className="w-2 h-2 rounded-full bg-orange-600 animate-ping"></span>
                  <span className="w-2 h-2 rounded-full bg-orange-600 absolute left-[10px]"></span>
                  <span className="text-[10px] font-bold text-slate-800 pl-1.5">Waterfront Dining</span>
                </div>

                {/* 2. Boutique Shops Hotspot */}
                <div className="absolute top-[20%] left-[25%] pointer-events-auto flex items-center gap-1 bg-white/95 backdrop-blur-xs border border-orange-100 px-2.5 py-1 rounded-full shadow-md transform hover:scale-105 transition cursor-pointer">
                  <span className="w-2 h-2 rounded-full bg-orange-600 animate-ping"></span>
                  <span className="w-2 h-2 rounded-full bg-orange-600 absolute left-[10px]"></span>
                  <span className="text-[10px] font-bold text-slate-800 pl-1.5">Boutique Shops</span>
                </div>

                {/* 3. Top Rated Service Hotspot */}
                <div className="absolute bottom-[28%] left-[45%] pointer-events-auto flex items-center gap-1 bg-white/95 backdrop-blur-xs border border-orange-100 px-2.5 py-1 rounded-full shadow-md transform hover:scale-105 transition cursor-pointer">
                  <span className="w-2 h-2 rounded-full bg-orange-600 animate-ping"></span>
                  <span className="w-2 h-2 rounded-full bg-orange-600 absolute left-[10px]"></span>
                  <span className="text-[10px] font-bold text-slate-800 pl-1.5">Top Rated Service</span>
                </div>

                {/* 4. Local Events Hotspot */}
                <div className="absolute bottom-[10%] right-[12%] pointer-events-auto flex items-center gap-1 bg-white/95 backdrop-blur-xs border border-orange-100 px-2.5 py-1 rounded-full shadow-md transform hover:scale-105 transition cursor-pointer">
                  <span className="w-2 h-2 rounded-full bg-orange-600 animate-ping"></span>
                  <span className="w-2 h-2 rounded-full bg-orange-600 absolute left-[10px]"></span>
                  <span className="text-[10px] font-bold text-slate-800 pl-1.5">Local Events</span>
                </div>

                {/* 5. Top Rated Salon Hotspot */}
                <div className="absolute top-[50%] right-[8%] pointer-events-auto flex items-center gap-1 bg-white/95 backdrop-blur-xs border border-orange-100 px-2.5 py-1 rounded-full shadow-md transform hover:scale-105 transition cursor-pointer">
                  <span className="w-2 h-2 rounded-full bg-orange-600 animate-ping"></span>
                  <span className="w-2 h-2 rounded-full bg-orange-600 absolute left-[10px]"></span>
                  <span className="text-[10px] font-bold text-slate-800 pl-1.5">Top Rated Salon</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* 2. Quick Categories Row */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6 text-center">
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
            <Link
              href={cat.href}
              key={cat.label}
              className="flex flex-col items-center gap-3.5 group cursor-pointer"
            >
              <span className="w-14 h-14 rounded-2xl bg-white border border-slate-200/80 group-hover:border-orange-500 text-slate-700 group-hover:text-orange-600 flex items-center justify-center shadow-xs transition duration-300 transform group-hover:-translate-y-1">
                <i className={`bx ${cat.icon} text-2xl`}></i>
              </span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-orange-600 transition leading-snug max-w-[100px] mx-auto">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Watch Section (Community Spotlight Videos) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-14 space-y-8">
        <div className="flex justify-between items-end border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block">COMMUNITY SPOTLIGHT</span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif">Why People Love Living in {mockCity}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left large video */}
          <div className="lg:col-span-8">
            {mainSpotlightVideo ? (
              <Link
                href={mainSpotlightVideo.embeded_for === "property" ? `/realty/${mainSpotlightVideo.p_id_b_slug}` : `/s/${mainSpotlightVideo.p_id_b_slug || ""}`}
                className="block relative h-[380px] md:h-[480px] w-full rounded-3xl bg-slate-950 overflow-hidden group shadow-lg"
              >
                <Image
                  src={mainSpotlightVideo.thumbnail || "/images/about-img.jpg"}
                  alt={mainSpotlightVideo.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
                <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/20 transition flex items-center justify-center">
                  <span className="w-16 h-16 rounded-full bg-white/95 text-slate-900 flex items-center justify-center shadow-lg transform group-hover:scale-105 transition duration-300">
                    <i className="bx bx-play text-4xl pl-1"></i>
                  </span>
                </div>
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
              <div className="h-[380px] md:h-[480px] w-full rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                <i className="bx bx-video-off text-4xl"></i>
              </div>
            )}
          </div>

          {/* Right smaller list videos */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-4">
            {listVideos.map((video) => (
              <Link
                href={video.embeded_for === "property" ? `/realty/${video.p_id_b_slug}` : `/s/${video.p_id_b_slug || ""}`}
                className="flex items-center gap-4 p-3 bg-white rounded-2xl border border-slate-200 hover:border-slate-350 hover:bg-slate-50 transition duration-200 group flex-1"
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
                  <h4 className="font-bold text-slate-800 text-sm line-clamp-2 group-hover:text-orange-600 transition">
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

      {/* 4. Explore Location Portal & Maps Section (Map and filters widget) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left panel: Info & Statistics */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-6 bg-[#FAF9F6] border border-slate-200/60 p-8 rounded-3xl shadow-xs">
            <div className="space-y-4">
              <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block">
                EXPLORE {mockCity.toUpperCase()}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-950 font-serif">Explore {mockState === "MD" ? "Maryland" : mockState} Locations</h2>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Interactive map, local insights, and curated favorites—discover what {mockCity} has to offer.
              </p>
              <div className="pt-2">
                <Link
                  href="/business"
                  className="inline-block border border-orange-500 hover:bg-orange-500 text-orange-600 hover:text-white font-bold py-2.5 px-6 rounded-xl transition text-xs"
                >
                  View All Areas
                </Link>
              </div>
            </div>

            {/* Mockup bottom counter statistics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80">
              <div>
                <strong className="text-lg md:text-xl font-bold text-slate-900 block">12+</strong>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Neighborhoods</span>
              </div>
              <div>
                <strong className="text-lg md:text-xl font-bold text-slate-900 block">850+</strong>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Local Biz</span>
              </div>
              <div>
                <strong className="text-lg md:text-xl font-bold text-slate-900 block">1.2K+</strong>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Homes Listed</span>
              </div>
            </div>
          </div>

          {/* Right panel: Leaflet Map with Floating Mockup Filter Widget */}
          <div className="lg:col-span-8 relative rounded-3xl overflow-hidden min-h-[400px] border border-slate-200 shadow-sm bg-slate-50">
            <USStateMap 
              stateAbbr={site?.ShortState || "MD"} 
              currentDomain={domain} 
            />

            {/* Floating Filter Widget matching the mockup design exactly */}
            <div className="absolute right-4 top-4 z-10 w-52 bg-white/95 backdrop-blur-xs rounded-2xl shadow-xl border border-slate-100 p-4 space-y-3 pointer-events-auto">
              <strong className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Map Filters</strong>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <span className="w-3 h-3 rounded-full bg-blue-500 block"></span>
                  <input type="checkbox" defaultChecked className="hidden" />
                  Homes for Sale
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 block"></span>
                  <input type="checkbox" defaultChecked className="hidden" />
                  Businesses
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <span className="w-3 h-3 rounded-full bg-purple-500 block"></span>
                  <input type="checkbox" defaultChecked className="hidden" />
                  Services
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <span className="w-3 h-3 rounded-full bg-orange-500 block"></span>
                  <input type="checkbox" defaultChecked className="hidden" />
                  Restaurants
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <span className="w-3 h-3 rounded-full bg-amber-500 block"></span>
                  <input type="checkbox" defaultChecked className="hidden" />
                  Events
                </label>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button type="button" className="w-full text-center bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl transition text-[10px] uppercase tracking-wider block">
                  Share Results
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Featured Listings Section */}
      {showRealty && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-14 space-y-6">
          <div className="flex justify-between items-end border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block font-sans">FEATURED LISTINGS</span>
              <h2 className="text-3xl font-bold text-slate-950 font-serif">Homes You'll Love</h2>
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

      {/* 6. Trusted Local Businesses */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-14 space-y-8">
        <div className="flex justify-between items-end border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block font-sans">LOCAL BUSINESSES</span>
            <h2 className="text-3xl font-bold text-slate-950 font-serif">Trusted Local Businesses</h2>
          </div>
          <Link href="/business" className="text-xs font-bold text-orange-605 hover:underline">
            View All Businesses &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topBusinesses.slice(0, 4).map((biz, idx) => (
            <Link
              href={`/s/${biz.update_slug || biz.slug}`}
              className="bg-white border border-slate-200 hover:border-slate-350 hover:shadow-lg rounded-2xl overflow-hidden shadow-xs transition duration-300 group flex flex-col justify-between"
              key={biz.id || idx}
            >
              <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                <Image
                  src={biz.main_image || `/api/og?title=${encodeURIComponent(biz.title)}`}
                  alt={biz.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 280px"
                  style={{ objectFit: "cover" }}
                />
                <div className="absolute top-3 left-3">
                  <span className="text-[9px] font-bold text-orange-700 bg-white/95 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-orange-100">
                    {Array.isArray(biz.categories) ? biz.categories[0] : (biz.categories?.name || biz.category || "Local")}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-950 text-sm group-hover:text-orange-605 transition leading-snug line-clamp-1">
                    {biz.title}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                    <span className="text-slate-800 font-extrabold">{biz.rating?.value || biz.stars || 4.8}</span>
                    <div className="flex text-[10px]">
                      <i className="bx bxs-star"></i>
                      <i className="bx bxs-star"></i>
                      <i className="bx bxs-star"></i>
                      <i className="bx bxs-star"></i>
                      <i className="bx bxs-star"></i>
                    </div>
                    <span className="text-slate-400 font-medium text-[10px]">({biz.rating?.reviews || biz.reviews || 120})</span>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                  <span className="uppercase text-[9px] tracking-wider text-slate-400">Verified Partner</span>
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

      {/* 7. Call To Action section (mockup matched left & right) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border border-slate-200 rounded-3xl p-8 shadow-xs">
          
          {/* Left panel: Info checklist list */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block font-sans">WHAT ARE YOU LOOKING FOR?</span>
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-slate-950 leading-tight">We're Here to Help You Find It.</h2>
            
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <i className="bx bx-check-circle text-orange-600 text-lg mt-0.5"></i>
                <div>
                  <strong className="text-sm font-bold text-slate-800 block">Find the Right Pro</strong>
                  <p className="text-xs text-slate-500">Connect with top-rated local professionals and services near you.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="bx bx-check-circle text-orange-600 text-lg mt-0.5"></i>
                <div>
                  <strong className="text-sm font-bold text-slate-800 block">Need Business Growth?</strong>
                  <p className="text-xs text-slate-500">Get discovered by locals, claim listing and grow your business.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="bx bx-check-circle text-orange-600 text-lg mt-0.5"></i>
                <div>
                  <strong className="text-sm font-bold text-slate-800 block">Are You a Media Pro?</strong>
                  <p className="text-xs text-slate-500">Partner with us to feature businesses and tell local neighborhood stories.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="bx bx-check-circle text-orange-600 text-lg mt-0.5"></i>
                <div>
                  <strong className="text-sm font-bold text-slate-800 block">List Your Property or Business</strong>
                  <p className="text-xs text-slate-500">Reach more local customers, buyers, and active community members.</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link href="/dashboard/add-business" className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-8 rounded-xl transition text-xs uppercase tracking-wider">
                Get Started Today
              </Link>
            </div>
          </div>

          {/* Right panel: Graphic photo card with absolute search overlay widget inside */}
          <div className="lg:col-span-6 relative rounded-3xl overflow-hidden min-h-[360px] border border-white shadow-xl bg-slate-900 group">
            <Image
              src="/images/media-pro-banner.jpg"
              alt="Media Pro Section Image"
              fill
              style={{ objectFit: "cover", opacity: 0.90 }}
            />
            
            {/* Absolute Search Widget inside right graphic matching mockup */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-xs rounded-2xl p-5 shadow-2xl border border-slate-100 space-y-3 pointer-events-auto">
              <strong className="text-xs font-bold text-slate-900 block">I'm looking for...</strong>
              
              <div className="flex gap-2 border-b border-slate-100 pb-1.5 overflow-x-auto whitespace-nowrap scrollbar-none">
                {["Homes", "Businesses", "Services", "Events"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-orange-600"
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Search ${mockCity}...`}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-4 py-2 font-bold transition text-xs shadow-sm">
                  Search
                </button>
              </form>
            </div>
          </div>

        </div>
      </section>

      {/* 8. Newsletter Section ("Stay in the Know.") */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="bg-[#FAF9F6] border border-slate-200/80 rounded-3xl p-8 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-1 text-left lg:max-w-md w-full">
            <h3 className="text-xl font-bold text-slate-900 font-serif">Stay in the Know.</h3>
            <p className="text-xs text-slate-400 font-medium">Local tips, new listings, and community highlights.</p>
            
            <form onSubmit={(e) => { e.preventDefault(); toast.success("Subscribed successfully!"); }} className="flex gap-2 pt-3">
              <input
                type="email"
                required
                placeholder="Your email address"
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 outline-none"
              />
              <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 py-2.5 font-bold transition text-xs">
                Subscribe
              </button>
            </form>
          </div>

          <div className="grid grid-cols-3 gap-8 text-center border-t lg:border-t-0 lg:border-l border-slate-200 pt-6 lg:pt-0 lg:pl-12 w-full lg:w-auto">
            <div>
              <strong className="text-2xl font-bold text-slate-900 block">12+</strong>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Neighborhoods</span>
            </div>
            <div>
              <strong className="text-2xl font-bold text-slate-900 block">850+</strong>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Businesses</span>
            </div>
            <div>
              <strong className="text-2xl font-bold text-slate-900 block">2.5K+</strong>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Members</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

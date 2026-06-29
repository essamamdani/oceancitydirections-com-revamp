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
  const mockBusinesses: Record<string, any[]> = {
    restaurant: [
      {
        id: "mock-r1",
        title: "Boatyard Bar & Grill",
        category: "Waterfront Dining",
        description: "An Ocean City institution famous for crab cakes, fresh seafood, and sailor friendly atmosphere near the harbor.",
        stars: 4.8,
        reviews: 238,
        city: "Ocean City",
        state: "MD",
        main_image: "/images/about-img.jpg",
        slug: "boatyard-bar-grill"
      },
      {
        id: "mock-r2",
        title: "Carrol's Creek Cafe",
        category: "Waterfront Dining",
        description: "Fine dining overlooking the bay, specializing in local seafood and premium steak options.",
        stars: 4.7,
        reviews: 184,
        city: "Ocean City",
        state: "MD",
        main_image: "/images/main-banner-bg2.jpg",
        slug: "carrols-creek"
      },
      {
        id: "mock-r3",
        title: "O'Leary's Seafood",
        category: "Seafood Dining",
        description: "Cozy upscale venue offering creative, high-end seafood preparations in a historic neighborhood setting.",
        stars: 4.9,
        reviews: 142,
        city: "Ocean City",
        state: "MD",
        main_image: "/images/main-banner-bg3.jpg",
        slug: "olearys"
      }
    ],
    "coffee-shop": [
      {
        id: "mock-c1",
        title: "Rise Up Coffee",
        category: "Coffee Shop",
        description: "Local craft coffee roaster offering organic, fair-trade coffee drinks, bakery treats, and breakfast items.",
        stars: 4.8,
        reviews: 124,
        city: "Ocean City",
        state: "MD",
        main_image: "/images/main-banner-bg4.jpg",
        slug: "rise-up-coffee"
      },
      {
        id: "mock-c2",
        title: "Bitty & Beau's Coffee",
        category: "Coffee Shop",
        description: "A human-rights focused coffee shop serving high quality espresso drinks and standard bakery items.",
        stars: 4.9,
        reviews: 96,
        city: "Ocean City",
        state: "MD",
        main_image: "/images/main-banner-bg5.jpg",
        slug: "bitty-beaus"
      }
    ],
    medical: [
      {
        id: "mock-m1",
        title: "Ocean City Performance PT",
        category: "Physical Therapy",
        description: "Specialized sports rehabilitation and physical therapy clinic helping local active individuals recover fully.",
        stars: 4.9,
        reviews: 97,
        city: "Ocean City",
        state: "MD",
        main_image: "/images/main-banner-bg6.jpg",
        slug: "oceancity-pt"
      }
    ],
    fitness: [
      {
        id: "mock-f1",
        title: "Downtown Ocean City Fitness",
        category: "Gym & Fitness",
        description: "Local community gym offering state-of-the-art machines, group classes, and personalized coaching.",
        stars: 4.7,
        reviews: 83,
        city: "Ocean City",
        state: "MD",
        main_image: "/images/about-img.jpg",
        slug: "oceancity-fitness"
      }
    ],
    "home-services": [
      {
        id: "mock-h1",
        title: "Bay Plumbers & HVAC",
        category: "Home Plumbing",
        description: "Reliable, 24/7 residential plumbing and heating services for local communities around the bay.",
        stars: 4.8,
        reviews: 154,
        city: "Ocean City",
        state: "MD",
        main_image: "/images/main-banner-bg1.jpg",
        slug: "bay-plumbers"
      }
    ],
    shopping: [
      {
        id: "mock-s1",
        title: "Historic District Boutiques",
        category: "Local Shopping",
        description: "Charming independent retail shops selling unique apparel, gifts, coastal art, and home decor items.",
        stars: 4.6,
        reviews: 112,
        city: "Ocean City",
        state: "MD",
        main_image: "/images/main-banner-bg3.jpg",
        slug: "historic-boutiques"
      }
    ]
  };

  const filteredBusinessesForGrid = topBusinesses.filter(b => {
    if (!selectedBizCategory) return true;
    return b.categories?.name?.toLowerCase().includes(selectedBizCategory.toLowerCase()) ||
           b.category?.toLowerCase().includes(selectedBizCategory.toLowerCase());
  }).slice(0, 6);

  const activeGridBusinesses = filteredBusinessesForGrid.length > 0 
    ? filteredBusinessesForGrid 
    : (mockBusinesses[selectedBizCategory] || []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showRealty) {
      window.location.href = `/realty?q=${encodeURIComponent(searchQuery)}`;
    } else {
      window.location.href = `/business?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased text-slate-800 pb-20">
      
      {/* H02: Hero Search Banner */}
      <section className="relative h-[520px] w-full bg-slate-950 flex items-center justify-center overflow-hidden">
        
        {/* Background Image Swiper Slider */}
        <div className="absolute inset-0 w-full h-full z-0">
          <Swiper
            spaceBetween={0}
            centeredSlides={true}
            autoplay={{
              delay: 6000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
            }}
            modules={[Autoplay, Pagination]}
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
                  style={{ objectFit: "cover", opacity: 0.55 }}
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
                  style={{ objectFit: "cover", opacity: 0.55 }}
                />
              </SwiperSlide>
            )}
          </Swiper>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-900/30 to-slate-950/80 z-1 pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto text-center px-4 relative z-10 space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-none font-serif drop-shadow-lg">
            Discover {siteName.replace("Directions", "")}
            <span className="block text-[#A3E635] mt-2" style={{ fontFamily: "'Playpen Sans', 'Caveat', 'Great Vibes', 'Brush Script MT', 'Snell Roundhand', cursive", fontStyle: 'italic', fontWeight: 'normal', fontSize: '0.85em' }}>Like a Local</span>
          </h1>
          <p className="text-md md:text-lg text-slate-200 max-w-2xl mx-auto font-medium drop-shadow-sm">
            Explore homes, neighborhoods, local businesses and the insider tips that make our community unique.
          </p>

          {/* Unified Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex items-center bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 gap-2 mt-8">
            <div className="flex-1 flex items-center px-3 gap-3">
              <i className="bx bx-search text-slate-400 text-xl"></i>
              <input
                type="text"
                placeholder="Search homes, businesses, neighborhoods or ZIP codes..."
                className="w-full bg-transparent outline-none text-slate-800 text-sm py-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="bg-slate-950 hover:bg-slate-900 text-white rounded-xl px-6 py-3 font-semibold transition text-sm">
              <i className="bx bx-search text-lg align-middle"></i>
            </button>
          </form>
        </div>
      </section>

      {/* H03: Quick Search Categories */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickCategories.filter(cat => showRealty || cat.label !== "Homes").map((cat) => (
            <Link
              href={cat.href}
              key={cat.label}
              className="bg-white border border-slate-200 hover:border-orange-550 hover:shadow-lg rounded-2xl p-6 flex items-center gap-4 transition-all duration-300 group"
            >
              <span className="w-12 h-12 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition duration-300">
                <i className={`bx ${cat.icon} text-2xl`}></i>
              </span>
              <div>
                <strong className="text-slate-950 text-sm font-bold block">{cat.label}</strong>
                <span className="text-xs text-slate-455 font-medium">{cat.copy}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* H04 & H05 Split: Watch Section & Locations Map */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* H04: Watch Section */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-start gap-6">
          <div className="flex justify-between items-end border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-950 font-serif">Watch {siteName.replace("Directions", "")}</h2>
              <p className="text-xs text-slate-400 font-medium mt-1">Local stories, expert tips and community highlights.</p>
            </div>
            <Link href="/blog" className="text-xs font-bold text-orange-605 hover:underline">
              View All Videos &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left big spotlight video */}
            <div className="md:col-span-7 space-y-3">
              {mainSpotlightVideo ? (
                <Link
                  href={mainSpotlightVideo.embeded_for === "property" ? `/realty/${mainSpotlightVideo.p_id_b_slug}` : `/s/${mainSpotlightVideo.p_id_b_slug || ""}`}
                  className="block relative h-64 w-full rounded-2xl bg-slate-950 overflow-hidden group shadow-sm"
                >
                  <Image
                    src={mainSpotlightVideo.thumbnail || "/images/about-img.jpg"}
                    alt={mainSpotlightVideo.title}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/30 transition flex items-center justify-center">
                    <span className="w-14 h-14 rounded-full bg-white/95 text-slate-900 flex items-center justify-center shadow-lg transform group-hover:scale-105 transition duration-300">
                      <i className="bx bx-play text-3xl pl-1"></i>
                    </span>
                  </div>

                  {/* Text Overlay at bottom */}
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white flex justify-between items-end">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-orange-400 font-bold block mb-1">
                        {mainSpotlightVideo.category || "Community Spotlight"}
                      </span>
                      <h3 className="font-bold text-white text-sm leading-snug line-clamp-2">
                        {mainSpotlightVideo.title}
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-black/50 rounded text-slate-200 shrink-0 ml-3">
                      {mainSpotlightVideo.duration || "2:48"}
                    </span>
                  </div>
                </Link>
              ) : (
                <div className="h-64 w-full rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                  <i className="bx bx-video-off text-3xl"></i>
                </div>
              )}
            </div>

            {/* Right stack of smaller videos */}
            <div className="md:col-span-5 flex flex-col justify-between gap-3">
              {listVideos.map((video) => (
                <Link
                  href={video.embeded_for === "property" ? `/realty/${video.p_id_b_slug}` : `/s/${video.p_id_b_slug || ""}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-150 hover:border-slate-350 hover:bg-slate-50 transition duration-200 group"
                  key={video.video_id || video.title}
                >
                  <div className="relative h-14 w-20 rounded-lg bg-slate-900 overflow-hidden shrink-0">
                    <Image
                      src={video.thumbnail || "/images/about-img.jpg"}
                      alt={video.title}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                    <div className="absolute inset-0 bg-slate-950/20 flex items-center justify-center">
                      <span className="w-6 h-6 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-sm">
                        <i className="bx bx-play text-sm pl-0.5"></i>
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 text-xs line-clamp-1 group-hover:text-orange-605 transition">
                      {video.title}
                    </h4>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block mt-1">
                      {video.category || "Neighborhood Tour"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* H05: Explore Locations Map */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between gap-6">
          <div className="flex justify-between items-end border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-950 font-serif">Explore {site?.State || "Maryland"} Locations</h2>
              <p className="text-xs text-slate-400 font-medium mt-1">Locations Map</p>
            </div>
          </div>

          <USStateMap 
            stateAbbr={site?.ShortState || "MD"} 
            currentDomain={domain} 
          />

          {/* Dynamic 2x2 Locations List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            {stateSites.map((loc: any) => (
              <div className="flex items-start gap-2.5" key={loc.name}>
                <i className={`bx bxs-map ${loc.colorClass} text-base shrink-0 mt-0.5`}></i>
                <div>
                  <a href={loc.url} target="_blank" rel="noopener noreferrer" className="hover:text-orange-605 transition block font-bold text-slate-900 text-xs">
                    {loc.name}
                  </a>
                  <span className="text-[10px] text-slate-500 font-medium leading-tight block mt-0.5">
                    {loc.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center border-t border-slate-100 pt-3">
            <Link href="/business" className="text-xs font-bold text-orange-605 hover:underline flex items-center gap-1">
              View All Locations <i className="bx bx-right-arrow-alt text-sm"></i>
            </Link>
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

      {/* H07: Featured Businesses */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block font-sans">Local Directories</span>
            <h2 className="text-3xl font-bold text-slate-950 font-serif">Featured Businesses</h2>
          </div>
          
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2">
            {businessFilterCategories.map((cat) => (
              <button
                key={cat.path}
                onClick={() => setSelectedBizCategory(cat.path)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition duration-200 ${
                  selectedBizCategory === cat.path
                    ? "bg-slate-950 text-white border-slate-950 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-355"
                }`}
              >
                <i className={`bx ${cat.icon} text-sm`}></i>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeGridBusinesses.map((biz, idx) => (
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
                    {biz.categories?.name || biz.category || "Local"}
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
                    <span>{biz.stars || 4.8}</span>
                    <span className="text-slate-450 font-medium">({biz.reviews || 97} reviews)</span>
                  </div>
                  <span>{biz.city ? `${biz.city}, ${biz.state}` : domain}</span>
                </div>
              </div>
            </Link>
          ))}
          {!activeGridBusinesses.length && (
            <div className="col-span-full bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-sm">
              <i className="bx bx-store-alt text-4xl mb-2 block"></i>
              <span>No businesses listed under this category.</span>
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

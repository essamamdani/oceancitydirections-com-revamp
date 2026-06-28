"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import HomepageListings from "@/components/HomeFour/HomepageListings";
import { getSiteName, ucwords } from "@/lib/helper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

const quickCategories = [
  { label: "Homes", href: "/realty", icon: "bx-home", copy: "Find your next home" },
  { label: "Businesses", href: "/business", icon: "bx-store", copy: "Support local" },
  { label: "Communities", href: "/business", icon: "bx-map-pin", copy: "Explore places to live" },
  { label: "Media Pros", href: "/merchants-media-pros", icon: "bx-video", copy: "Create & connect" },
];

const businessFilterCategories = [
  { label: "Restaurants", icon: "bx-restaurant", path: "restaurant" },
  { label: "Coffee Shops", icon: "bx-coffee", path: "coffee-shop" },
  { label: "Medical", icon: "bx-plus-medical", path: "medical" },
  { label: "Fitness", icon: "bx-dumbbell", path: "fitness" },
  { label: "Home Services", icon: "bx-wrench", path: "home-services" },
  { label: "Shopping", icon: "bx-shopping-bag", path: "shopping" },
];

const networkLocations = [
  { name: "AnnapolisDirections.com", desc: "Our charming capital city on the beautiful bay.", href: "https://annapolisdirections.com" },
  { name: "BaltimoreDirections.com", desc: "Maryland's largest city with endless things to explore.", href: "https://baltimoredirections.com" },
  { name: "FrederickDirections.com", desc: "Historic downtown, shopping, dining & outdoor site.", href: "https://frederickdirections.com" },
  { name: "OceanCityDirections.com", desc: "Beach life, boardwalk fun & coastal getaways.", href: "https://oceancitydirections.com" },
];

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
  const featureImage = site?.slides?.swiper?.[0]?.img || "/img/photo/ocean-city-md-boardwalk.jpg";

  const mainSpotlightVideo = featuredVideos[0] || null;
  const listVideos = featuredVideos.slice(1, 4);

  const filteredBusinessesForGrid = topBusinesses.filter(b => {
    if (!selectedBizCategory) return true;
    return b.categories?.name?.toLowerCase().includes(selectedBizCategory.toLowerCase()) ||
           b.category?.toLowerCase().includes(selectedBizCategory.toLowerCase());
  }).slice(0, 6);

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
            <span className="block text-orange-500 font-serif italic font-normal mt-2">Like a Local</span>
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
            <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 py-3 font-semibold transition text-sm">
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
                <span className="text-xs text-slate-450 font-medium">{cat.copy}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* H04 & H05 Split: Watch Section & Locations Map */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* H04: Watch Section */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between gap-6">
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
                  className="block relative h-56 w-full rounded-2xl bg-slate-950 overflow-hidden group shadow-sm"
                >
                  <Image
                    src={mainSpotlightVideo.thumbnail || "/img/photo/ocean-city-md-boardwalk.jpg"}
                    alt={mainSpotlightVideo.title}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                  <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/30 transition flex items-center justify-center">
                    <span className="w-14 h-14 rounded-full bg-white/95 text-slate-900 flex items-center justify-center shadow-lg transform group-hover:scale-105 transition duration-300">
                      <i className="bx bx-play text-3xl pl-1"></i>
                    </span>
                  </div>
                </Link>
              ) : (
                <div className="h-56 w-full rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                  <i className="bx bx-video-off text-3xl"></i>
                </div>
              )}
              <div>
                <h3 className="font-bold text-slate-950 text-sm line-clamp-1">{mainSpotlightVideo?.title || "Community Video Spotlight"}</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Featured Video</p>
              </div>
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
                      src={video.thumbnail || "/img/photo/ocean-city-md-boardwalk.jpg"}
                      alt={video.title}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                    <div className="absolute inset-0 bg-slate-950/20 flex items-center justify-center">
                      <i className="bx bx-play text-white text-md"></i>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 text-xs line-clamp-1 group-hover:text-orange-605 transition">
                      {video.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Neighborhood</span>
                  </div>
                </Link>
              ))}
              {!listVideos.length && (
                <div className="flex-1 flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-405 text-xs py-8">
                  No community videos available.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* H05: Explore Locations Map */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between gap-6">
          <div className="flex justify-between items-end border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-950 font-serif">Explore {siteName.replace("Directions", "")} Locations</h2>
              <p className="text-xs text-slate-400 font-medium mt-1">Navigate verified properties and local businesses.</p>
            </div>
            <Link href="/business" className="text-xs font-bold text-orange-605 hover:underline">
              View All &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            {/* Left cities list */}
            <div className="sm:col-span-6 space-y-4">
              {networkLocations.map((loc) => (
                <div key={loc.name} className="flex items-start gap-2.5">
                  <i className="bx bx-map-pin text-orange-500 text-lg shrink-0 mt-0.5 animate-pulse"></i>
                  <div>
                    <a href={loc.href} target="_blank" rel="noopener noreferrer" className="hover:text-orange-605 transition block font-bold text-slate-950 text-xs">
                      {loc.name}
                    </a>
                    <span className="text-[10px] text-slate-400 font-medium leading-tight block mt-0.5">{loc.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right map graphic */}
            <div className="sm:col-span-6 bg-orange-50/30 border border-orange-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-3 min-h-[220px]">
              <i className="bx bx-map-alt text-4xl text-orange-500"></i>
              <div>
                <div className="text-xs font-bold text-slate-950 font-serif">{domain}</div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">{counties[0]} County</div>
              </div>
              <span className="text-[10px] text-orange-600 bg-white border border-orange-200 px-3 py-1 rounded-full font-bold shadow-xs">
                Interactive Map Active
              </span>
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
          {filteredBusinessesForGrid.map((biz) => (
            <Link
              href={`/s/${biz.update_slug || biz.slug}`}
              className="bg-white border border-slate-200 hover:border-slate-350 hover:shadow-lg rounded-2xl overflow-hidden shadow-xs transition duration-300 group flex flex-col justify-between"
              key={biz.id}
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
                    <span>4.8</span>
                    <span className="text-slate-450 font-medium">(97 reviews)</span>
                  </div>
                  <span>{biz.city ? `${biz.city}, ${biz.state}` : domain}</span>
                </div>
              </div>
            </Link>
          ))}
          {!filteredBusinessesForGrid.length && (
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
              src="/img/photo/ocean-city-md-boardwalk.jpg"
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

"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from 'next/image';
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSites } from "@/contexts/SitesContext";
import UserMenu from "./UserMenu";
import LoginModal from "@/components/Auth/LoginModal";
import { getClientUser, subscribeAuth } from "@/utils/auth/session";

interface NavbarProps {
  variant?: "home" | "inner";
}

const Navbar: React.FC<NavbarProps> = ({ variant = "inner" }) => {
  const { site, loading, error } = useSites();
  const [displayAuth, setDisplayAuth] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const showStickyMenu = useCallback(() => {
    setSticky(window.scrollY >= 80);
  }, []);

  useEffect(() => {
    const init = async () => {
      const { user: fetchedUser } = await getClientUser();
      setUser(fetchedUser);
    };
    init();

    const subscription = subscribeAuth((_event, session) => {
      setUser(session?.user ?? null);
    });

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", showStickyMenu);
      return () => {
        window.removeEventListener("scroll", showStickyMenu);
        subscription?.unsubscribe?.();
      };
    }
  }, [showStickyMenu]);

  const toggleMenu = useCallback(() => {
    setShowMenu(prev => !prev);
  }, []);

  if (loading || !site) return null;
  if (error) {
    console.error("Error loading site data:", error);
    return null;
  }

  const navbarWrapperClass = sticky
    ? "is-sticky navbar-area !bg-white/95 !backdrop-blur-md !shadow-md !border-b !border-slate-200/80 !transition-all !duration-300"
    : variant === "home"
      ? "navbar-area !bg-slate-950/20 !backdrop-blur-xs !border-transparent !shadow-none !transition-all !duration-300 absolute top-0 left-0 w-full z-50"
      : "navbar-area !bg-white/95 !backdrop-blur-md !shadow-xs !border-b !border-slate-200/60";

  const linkColorClass = sticky
    ? "text-slate-800 hover:text-orange-605 transition-colors duration-200"
    : variant === "home"
      ? "text-white hover:text-orange-400 transition-colors duration-200"
      : "text-slate-800 hover:text-orange-655 transition-colors duration-200";

  const activeColorClass = (variant === "home" && !sticky)
    ? "text-orange-450 font-extrabold"
    : "text-orange-600 font-extrabold";

  return (
    <>
      <div className={displayAuth ? "body_overlay open" : "body_overlay"}></div>
      <div className={navbarWrapperClass}>
        
        {/* Responsive Mobile Nav */}
        <div className="miran-responsive-nav">
          <div className="container">
            <div className="miran-responsive-menu">
              <div onClick={toggleMenu} className="hamburger-menu">
                {showMenu ? (
                  <i className="bx bx-x"></i>
                ) : (
                  <i className="bx bx-menu"></i>
                )}
              </div>
              <div className="logo">
                {site && (
                  <Link href={site.URL}>
                    <Image
                      src={site.logo}
                      alt={site.Slug || "Logo"}
                      width={250}
                      height={42}
                      priority
                    />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className={showMenu ? "miran-nav show" : "miran-nav"}>
          <div className="container-fluid">
            <nav className="custom-navbar flex items-center justify-between">
              <div className="d-none d-lg-block shrink-0">
                {site && (
                  <Link href={site.URL}>
                    <Image
                      src={site.logo}
                      alt={site.Slug || "Logo"}
                      width={280}
                      height={42}
                      priority
                      style={{
                        filter: (variant === "home" && !sticky) ? "brightness(0) invert(1)" : "none",
                        height: 'auto',
                        width: 'auto',
                        maxWidth: '280px'
                      }}
                    />
                  </Link>
                )}
              </div>

              <div className="custom-navbar-nav-container flex items-center justify-between flex-1 ml-10">
                <ul className="custom-navbar-nav flex items-center gap-6 list-none m-0 p-0">
                  {/* Buy Dropdown */}
                  <li 
                    className="relative group custom-nav-item py-4"
                    onMouseEnter={() => setActiveDropdown("buy")}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <Link href="/realty" className={`custom-nav-link flex items-center gap-1 cursor-pointer font-bold bg-transparent border-0 outline-none ${pathname === '/realty' ? activeColorClass : linkColorClass}`}>
                      Buy <i className="bx bx-chevron-down text-sm"></i>
                    </Link>
                    {activeDropdown === "buy" && (
                      <div className="absolute top-full left-0 mt-0 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2 transition-all duration-200">
                        <Link href="/realty" className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600">
                          Homes for Sale
                        </Link>
                        <Link href="/realty" className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600">
                          New Listings
                        </Link>
                        <Link href="/realty" className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600">
                          Open Houses
                        </Link>
                        <Link href="/realty" className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600">
                          Find Realtors
                        </Link>
                        <Link href="/realty" className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600">
                          Mortgage Center
                        </Link>
                      </div>
                    )}
                  </li>

                  {/* Rent Dropdown */}
                  <li 
                    className="relative group custom-nav-item py-4"
                    onMouseEnter={() => setActiveDropdown("rent")}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <Link href="/realty" className={`custom-nav-link flex items-center gap-1 cursor-pointer font-bold bg-transparent border-0 outline-none ${pathname === '/realty/rent' ? activeColorClass : linkColorClass}`}>
                      Rent <i className="bx bx-chevron-down text-sm"></i>
                    </Link>
                    {activeDropdown === "rent" && (
                      <div className="absolute top-full left-0 mt-0 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2 transition-all duration-200">
                        <Link href="/realty" className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600">
                          Homes for Rent
                        </Link>
                        <Link href="/realty" className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600">
                          Apartments
                        </Link>
                        <Link href="/realty" className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600">
                          Rentals Near Me
                        </Link>
                        <Link href="/sell" className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600">
                          Landlord Info
                        </Link>
                      </div>
                    )}
                  </li>

                  {/* Businesses Dropdown */}
                  <li 
                    className="relative group custom-nav-item py-4"
                    onMouseEnter={() => setActiveDropdown("businesses")}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <Link href="/business" className={`custom-nav-link flex items-center gap-1 cursor-pointer font-bold bg-transparent border-0 outline-none ${pathname.startsWith('/business') || pathname.startsWith('/s/') ? activeColorClass : linkColorClass}`}>
                      Businesses <i className="bx bx-chevron-down text-sm"></i>
                    </Link>
                    {activeDropdown === "businesses" && (
                      <div className="absolute top-full left-0 mt-0 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2 transition-all duration-200">
                        <Link href="/business" className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600">
                          Business Directory
                        </Link>
                        <Link href="/dashboard/add-business" className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600">
                          Claim Your Listing
                        </Link>
                        <Link href="/business" className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600">
                          Advertising Options
                        </Link>
                      </div>
                    )}
                  </li>

                  {/* Explore Dropdown */}
                  <li 
                    className="relative group custom-nav-item py-4"
                    onMouseEnter={() => setActiveDropdown("explore")}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <Link href="/blog" className={`custom-nav-link flex items-center gap-1 cursor-pointer font-bold bg-transparent border-0 outline-none ${pathname.startsWith('/blog') ? activeColorClass : linkColorClass}`}>
                      Explore <i className="bx bx-chevron-down text-sm"></i>
                    </Link>
                    {activeDropdown === "explore" && (
                      <div className="absolute top-full left-0 mt-0 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2 transition-all duration-200">
                        <Link href="/business" className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600">
                          Communities
                        </Link>
                        <Link href="/business" className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600">
                          Things To Do
                        </Link>
                        <Link href="/blog" className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600">
                          Local News
                        </Link>
                        <Link href="/blog" className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600">
                          Events
                        </Link>
                      </div>
                    )}
                  </li>

                  {/* Resources Dropdown */}
                  <li 
                    className="relative group custom-nav-item py-4"
                    onMouseEnter={() => setActiveDropdown("resources")}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <Link href="/blog" className={`custom-nav-link flex items-center gap-1 cursor-pointer font-bold bg-transparent border-0 outline-none ${pathname.startsWith('/resources') ? activeColorClass : linkColorClass}`}>
                      Resources <i className="bx bx-chevron-down text-sm"></i>
                    </Link>
                    {activeDropdown === "resources" && (
                      <div className="absolute top-full left-0 mt-0 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2 transition-all duration-200">
                        <Link href="/blog" className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600">
                          Home Buying Guide
                        </Link>
                        <Link href="/sell" className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600">
                          Selling Guide
                        </Link>
                        <Link href="/blog" className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600">
                          Local School Info
                        </Link>
                        <Link href="/blog" className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600">
                          Moving Guide
                        </Link>
                      </div>
                    )}
                  </li>

                  {/* About Us Dropdown */}
                  <li 
                    className="relative group custom-nav-item py-4"
                    onMouseEnter={() => setActiveDropdown("about")}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <Link href="/about" className={`custom-nav-link flex items-center gap-1 cursor-pointer font-bold bg-transparent border-0 outline-none ${pathname.startsWith('/about') ? activeColorClass : linkColorClass}`}>
                      About Us <i className="bx bx-chevron-down text-sm"></i>
                    </Link>
                    {activeDropdown === "about" && (
                      <div className="absolute top-full left-0 mt-0 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2 transition-all duration-200">
                        <Link href="/about" className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600">
                          Our Story
                        </Link>
                        <Link href="/about" className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600">
                          Meet the Team
                        </Link>
                        <Link href="/about" className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600">
                          Careers
                        </Link>
                        <Link href="/about" className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600">
                          Contact Us
                        </Link>
                      </div>
                    )}
                  </li>
                </ul>

                <div className="others-option d-lg-flex align-items-center">
                  <ul className="flex items-center flex-nowrap gap-4 list-none m-0 p-0 whitespace-nowrap ml-6">
                    <li className="custom-nav-item">
                      <Link href="/realty" className={`custom-nav-link flex items-center gap-1.5 font-bold ${linkColorClass}`}>
                        <i className="bx bx-heart text-xl"></i>
                        <span>Saved</span>
                      </Link>
                    </li>
                    <li className="custom-nav-item" style={{ marginLeft: '4px' }}>
                      <Link 
                        href="/dashboard/add-business" 
                        className={`rounded-xl px-5 py-2.5 font-bold transition text-[11px] md:text-xs tracking-wide shadow-sm ${
                          (variant === "home" && !sticky)
                            ? "bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/25"
                            : "bg-slate-900 hover:bg-slate-800 text-white"
                        }`}
                        style={{ display: 'inline-block' }}
                      >
                        List My Business
                      </Link>
                    </li>
                    <UserMenu className={linkColorClass} />
                  </ul>
                </div>
              </div>
            </nav>
          </div>
        </div>

      </div>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onSuccess={() => {
        setShowLoginModal(false);
        router.push('/dashboard/add-business');
      }} />
    </>
  );
};

export default Navbar;

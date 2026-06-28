"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from 'next/image';
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

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

  const linkColorClass = variant === "home" ? "text-lg-white text-dark" : "text-dark";

  return (
    <>
      <div className={displayAuth ? "body_overlay open" : "body_overlay"}></div>
      <div className={sticky ? "is-sticky navbar-area" : "navbar-area"}>
        
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
            <nav className="custom-navbar">
              <div className="d-none d-lg-block">
                {site && (
                  <Link href={site.URL}>
                    <Image
                      src={site.logo}
                      alt={site.Slug || "Logo"}
                      width={400}
                      height={42}
                      priority
                    />
                  </Link>
                )}
              </div>

              <div className="custom-navbar-nav-container">
                <ul className="custom-navbar-nav"></ul>

                <div className="others-option d-lg-flex align-items-center">
                  <ul className="custom-navbar-nav" style={{ margin: 0, padding: '10px 0' }}>
                    {site.IncludeRealty && (
                      <li className="custom-nav-item">
                        <Link href="/realty" className={`custom-nav-link d-lg-block ${linkColorClass}`}>
                          Properties
                        </Link>
                      </li>
                    )}
                    <li className="custom-nav-item">
                      <Link href="/sell" className={`custom-nav-link d-lg-block ${linkColorClass}`}>
                        Sell
                      </Link>
                    </li>
                    <li className="custom-nav-item">
                      <Link href="/business" className={`custom-nav-link d-lg-block ${linkColorClass}`}>
                        Directory
                      </Link>
                    </li>
                    <li className="custom-nav-item">
                      <Link href="/merchants-media-pros" className={`custom-nav-link d-lg-block ${linkColorClass}`}>
                        Merchants & Media Pros
                      </Link>
                    </li>
                    <li className="custom-nav-item">
                      <Link href="/blog" className={`custom-nav-link d-lg-block ${linkColorClass}`}>
                        Blog
                      </Link>
                    </li>
                    <li className="custom-nav-item">
                      <Link href="https://www.realtydirections.com/" className={`custom-nav-link d-lg-block ${linkColorClass}`} target="_blank">
                        Corporate Site
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

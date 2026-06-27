"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { useSites } from '@/contexts/SitesContext';
import UserMenu from "./UserMenu";
import LoginModal from "@/components/Auth/LoginModal";
import { getClientUser, subscribeAuth } from "@/utils/auth/session";

const NavbarTwo = () => {
  const { site, loading, error } = useSites();
  const [displayAuth, setDisplayAuth] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();

  // Sticky menu
  const showStickyMenu = () => {
    if (window.scrollY >= 80) {
      setSticky(true);
    } else {
      setSticky(false);
    }
  };

  useEffect(() => {
    const init = async () => {
        const { user } = await getClientUser();
        setUser(user);
    };
    init();
    const subscription = subscribeAuth((_event, session) => {
        setUser(session?.user ?? null);
    });

    if (typeof window !== "undefined") {
      window.addEventListener("scroll", showStickyMenu);
    }
    return () => {
      window.removeEventListener("scroll", showStickyMenu);
      subscription?.unsubscribe?.();
    };
  }, []);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };


  if (loading || !site) return null; // Wait until site data is ready
  if (error) {
    console.error("Error loading site data:", error);
    return null;
  }

  return (
    <>
      <div className={displayAuth ? "body_overlay open" : "body_overlay"}></div>
      <div className={sticky ? "is-sticky navbar-area" : "navbar-area"}>
        <div className="miran-responsive-nav">
          <div className="container">
            <div className="miran-responsive-menu">
              <div
                onClick={() => toggleMenu()}
                className="hamburger-menu hamburger-two"
              >
                {showMenu ? (
                  <i className="bx bx-x"></i>
                ) : (
                  <i className="bx bx-menu"></i>
                )}
              </div>
              <div className="dropdown option-item">
                <button
                  className="btn"
                  type="button"
                  onClick={toggleDropdown}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {/* Current Site Logo */}
                  {site && (
                    <Link href={site.URL}>
                      <Image
                        src={site.logo}
                        alt={site.Slug}
                        width={250}
                        height={42}

                      /></Link>
                  )}
                  {/* Dropdown Icon */}
                  {/* <i
                    className={`bx ${dropdownOpen ? "bx-chevron-up" : "bx-chevron-down"
                      }`}
                    style={{
                      marginLeft: "10px",
                      fontSize: "1.5rem",
                      color: "#000",
                    }}
                  ></i> */}
                </button>
                {/* Dropdown List */}
                {/* <ul
                  className={`dropdown-menu ${dropdownOpen ? "show" : ""}`}
                  style={{
                    display: dropdownOpen ? "block" : "none",
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    backgroundColor: "#fff",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    zIndex: 1000,
                    padding: "10px",
                    borderRadius: "4px",
                  }}
                >
                  {site.sites.map(({ Slug, url, logo }) => (
                    <li key={Slug}>
                      <Link href={url} className="border-item">
                        <Image
                          src={logo}
                          alt={Slug}
                          width={250}
                          height={42}

                        />
                      </Link>
                    </li>
                  ))}
                </ul> */}
              </div>
            </div>
          </div>
        </div>

        <div className={showMenu ? "miran-nav show" : "miran-nav"}>
          <div className="container-fluid">
            <nav className="custom-navbar">
              <div className="d-none d-lg-block">
                <button
                  className="btn"
                  type="button"
                  onClick={toggleDropdown}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {/* Current Site Logo */}
                  {site && (
                    <Link href={site.URL}>
                      <Image
                        src={site.logo}
                        alt={site.Slug}
                        width={400}
                        height={42}
                        
                      /></Link>
                  )}
                  {/* Dropdown Icon */}
                  {/* <i
                    className={`bx ${dropdownOpen ? "bx-chevron-up" : "bx-chevron-down"
                      }`}
                    style={{
                      marginLeft: "10px",
                      fontSize: "1.5rem",
                      color: "#000",
                    }}
                  ></i> */}
                </button>
                {/* Dropdown List */}
                {/* <ul
                  className={`dropdown-menu ${dropdownOpen ? "show" : ""}`}
                  style={{
                    display: dropdownOpen ? "block" : "none",
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    backgroundColor: "#fff",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    zIndex: 1000,
                    padding: "10px",
                    borderRadius: "4px",
                  }}
                >
                  {site.sites.map(({ Slug, url, logo }) => (
                    <li key={Slug}>
                      <Link href={url} className="border-item">
                        <Image
                          src={logo}
                          alt={Slug}
                          width={400}
                          height={42}

                        />
                      </Link>
                    </li>
                  ))}
                </ul> */}
              </div>

              <div className="custom-navbar-nav-container">
                <ul className="custom-navbar-nav"></ul>

                <div className="others-option d-lg-flex align-items-center">
                  <ul className="custom-navbar-nav" style={{ margin: 0, padding: '10px 0' }}>
                    {site.IncludeRealty && <li className="custom-nav-item">
                      <Link href="/realty" className="custom-nav-link d-lg-block text-dark">
                        Properties
                      </Link>
                    </li>}
                    <li className="custom-nav-item">
                      <Link href="/sell" className="custom-nav-link d-lg-block text-dark">
                        Sell
                      </Link>
                    </li>
                    <li className="custom-nav-item">
                      <Link href="/business" className="custom-nav-link d-lg-block text-dark">
                        Directory
                      </Link>
                    </li>
                     <li className="custom-nav-item">
                      <Link href="/merchants-media-pros" className="custom-nav-link d-lg-block text-dark">
                        Merchants & Media Pros
                      </Link>
                    </li>
                    <li className="custom-nav-item">
                      <Link href="/blog" className="custom-nav-link d-lg-block text-dark">
                        Blog
                      </Link>
                    </li>
                   
                    <li className="custom-nav-item">
                      <Link href="https://www.realtydirections.com/" className="custom-nav-link d-lg-block text-dark" target="_blank">
                        Corporate Site
                      </Link>
                    </li>
                    <UserMenu className="custom-nav-link d-lg-block text-dark" />
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

export default NavbarTwo;

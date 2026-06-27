"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from 'next/image';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSites } from "@/contexts/SitesContext";
import UserMenu from "./UserMenu";
import LoginModal from "@/components/Auth/LoginModal";
import { getClientUser, subscribeAuth } from "@/utils/auth/session";

const Navbar = () => {
  const { site, loading, error } = useSites();

  const [displayAuth, setDisplayAuth] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();

  // Handle sticky menu on scroll
  const showStickyMenu = useCallback(() => {
    setSticky(window.scrollY >= 80);
  }, []);

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
      return () => {
        window.removeEventListener("scroll", showStickyMenu);
        subscription?.unsubscribe?.();
      };
    }
  }, [showStickyMenu]);

  const toggleMenu = useCallback(() => {
    setShowMenu(prev => !prev);
  }, []);

  const toggleDropdown = useCallback(() => {
    setDropdownOpen(prev => !prev);
  }, []);

  const handleAddBusiness = (e) => {
    e.preventDefault();
    if (user) {
        router.push('/dashboard/add-business');
    } else {
        setShowLoginModal(true);
    }
  };

  if (loading || !site) return null; // Wait until site data is ready
  if (error) {
    console.error("Error loading site data:", error);
    return null;
  }

  // Render logo and dropdown menu
  const renderLogoDropdown = (mainlogoWidth = 250, logoWidth = 250) => (
    <>
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
        {site && (
          <Link href={site.URL}>
            <Image
              src={site.logo}
              alt={site.Slug}
              width={mainlogoWidth}
              height={42}

            />
          </Link>
        )}
        {/* <i
          className={`bx ${dropdownOpen ? "bx-chevron-up" : "bx-chevron-down"}`}
          style={{
            marginLeft: "10px",
            fontSize: "1.5rem",
            color: "#000",
          }}
        ></i> */}
      </button>
      {/* Dropdown Menu */}
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
        {site?.sites?.map(({ Slug, url, logo }) => (
          <li key={Slug}>
            <Link href={url}>
              <Image
                src={logo}
                alt={Slug}
                width={logoWidth}
                height={42}

              />
            </Link>
          </li>
        ))}
      </ul> */}
    </>
  );

  return (
    <>
      <div className={displayAuth ? "body_overlay open" : "body_overlay"}></div>
      <div
        className={
          sticky
            ? "is-sticky navbar-area navbar-style-two"
            : "navbar-area navbar-style-two"
        }
      >
        <div className="miran-responsive-nav">
          <div className="container">
            <div className="miran-responsive-menu">
              <div onClick={() => toggleMenu()} className="hamburger-menu">
                {showMenu ? (
                  <i className="bx bx-x"></i>
                ) : (
                  <i className="bx bx-menu"></i>
                )}
              </div>
              <div className="logo">
                {renderLogoDropdown(250)}
              </div>
            </div>
          </div>
        </div>

        <div className={showMenu ? "miran-nav show" : "miran-nav"}>
          <div className="container-fluid">
            <nav className="custom-navbar">
              <div className="d-none d-lg-block">
                {renderLogoDropdown(400)}
              </div>

              <div className="custom-navbar-nav-container">
                <ul className="custom-navbar-nav">
                  {/* Left side nav items if any */}
                </ul>

                <div className="others-option d-lg-flex align-items-center">
                  <ul className="custom-navbar-nav">
                   
                    {site.IncludeRealty && <li className="custom-nav-item">
                      <Link href="/realty" className="custom-nav-link d-lg-block text-lg-white text-dark">
                        Properties
                      </Link>
                    </li>}
                    <li className="custom-nav-item">
                      <Link href="/sell" className="custom-nav-link d-lg-block text-lg-white text-dark">
                        Sell
                      </Link>
                    </li>
                    <li className="custom-nav-item">
                      <Link href="/business" className="custom-nav-link d-lg-block text-lg-white text-dark">
                        Directory
                      </Link>
                    </li>
                    <li className="custom-nav-item">
                      <Link href="/merchants-media-pros" className="custom-nav-link d-lg-block text-lg-white text-dark">
                        Merchants & Media Pros
                      </Link>
                    </li>
                    <li className="custom-nav-item">
                      <Link href="/blog" className="custom-nav-link d-lg-block text-lg-white text-dark">
                        Blog
                      </Link>
                    </li>
                    
                    <li className="custom-nav-item">
                      <Link href="https://www.realtydirections.com/" className="custom-nav-link d-lg-block text-lg-white text-dark">
                        Corporate Site
                      </Link>
                    </li>
                    <UserMenu className="custom-nav-link d-lg-block text-lg-white text-dark" />
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

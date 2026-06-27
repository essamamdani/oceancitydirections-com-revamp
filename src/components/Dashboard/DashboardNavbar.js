"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSites } from "@/contexts/SitesContext";
import { getSiteName } from "@/lib/helper";

const DashboardNavbar = () => {
  const { site } = useSites();
  const siteName = site ? getSiteName(site) : (process.env.NEXT_PUBLIC_SITE_NAME || 'Realty Directions');
  
  const pathname = usePathname();
 
  const [isActiveSideMenu, setActiveSideMenu] = useState("false");
  const handleToggleSideMenu = () => {
    setActiveSideMenu(!isActiveSideMenu);
  };

  return (
    <>
      <div
        className="sidemenu-burger-menu d-xl-none" onClick={handleToggleSideMenu}
      >
        <i className='bx bx-menu-alt-right'></i>
      </div>

      <div 
        className={`sidemenu-area ${
          isActiveSideMenu ? "" : "active-sidemenu-area"
        }`}
      >
        <div className="sidemenu-header">
          <Link href="/" className="navbar-brand d-flex align-items-center">
            <Image
              src={`/images/${process.env.NEXT_PUBLIC_SLUG}-logo.svg`}
              alt={siteName}
              width={127}
              height={42}
              
            />
          </Link>

          <div
            className="responsive-burger-menu d-block d-lg-none" onClick={handleToggleSideMenu}
          >
            <i className="bx bx-x"></i>
          </div>
        </div>

        <div className="sidemenu-body">
          <ul
            className="sidemenu-nav metisMenu h-100"
            id="sidemenu-nav"
            data-simplebar
          >
            <li className="nav-item-title">Main</li>

            <li className="nav-item">
              <Link
                href="/dashboard/"
                className={`nav-link ${
                  pathname == "/dashboard/" && "active"
                }`}
              >
                <span className="icon">
                  <i className="bx bx-home-circle"></i>
                </span>
                <span className="menu-title">Dashboard</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link
                href="/dashboard/messages/"
                className={`nav-link ${
                  pathname == "/dashboard/messages/" && "active"
                }`}
              >
                <span className="icon">
                  <i className="bx bx-envelope-open"></i>
                </span>
                <span className="menu-title">Messages</span>
                <span className="badge">3</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link
                href="/dashboard/bookings/"
                className={`nav-link ${
                  pathname == "/dashboard/bookings" && "active"
                }`}
              >
                <span className="icon">
                  <i className="bx bx-copy"></i>
                </span>
                <span className="menu-title">Bookings</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link
                href="/dashboard/wallet/"
                className={`nav-link ${
                  pathname == "/dashboard/wallet/" && "active"
                }`}
              >
                <span className="icon">
                  <i className="bx bx-wallet"></i>
                </span>
                <span className="menu-title">Wallet</span>
              </Link>
            </li>

            <li className="nav-item-title">Listings</li>

            <li className="nav-item">
              <a
                href="#"
                className="collapsed-nav-link nav-link"
             
              >
                <span className="icon">
                  <i className="bx bx-layer"></i>
                </span>
                <span className="menu-title">My Listings</span>
              </a>

              <ul
                className="sidemenu-nav-second-level show"
              >
                <li className="nav-item active-section">
                  <Link
                    href="/dashboard/my-listing/active/"
                    className={`nav-link ${
                      pathname == "/dashboard/my-listing/active/" && "active"
                    }`}
                  >
                    <span className="menu-title">Active</span>
                    <span className="badge">5</span>
                  </Link>
                </li>

                <li className="nav-item active-section">
                  <Link
                    href="/dashboard/my-listing/pending/"
                    className={`nav-link ${
                      pathname == "/dashboard/my-listing/pending/" &&
                      "active"
                    }`}
                  >
                    <span className="menu-title">Pending</span>
                    <span className="badge yellow">1</span>
                  </Link>
                </li>

                <li className="nav-item active-section">
                  <Link
                    href="/dashboard/my-listing/expired/"
                    className={`nav-link ${
                      pathname == "/dashboard/my-listing/expired" && "active"
                    }`}
                  >
                    <span className="menu-title">Expired</span>
                    <span className="badge red">2</span>
                  </Link>
                </li>
              </ul>
            </li>

            <li className="nav-item">
              <Link
                href="/dashboard/reviews/"
                className={`nav-link ${
                  pathname == "/dashboard/reviews/" && "active"
                }`}
              >
                <span className="icon">
                  <i className="bx bx-star"></i>
                </span>
                <span className="menu-title">Reviews</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link
                href="/dashboard/bookmarks/"
                className={`nav-link ${
                  pathname == "/dashboard/bookmarks" && "active"
                }`}
              >
                <span className="icon">
                  <i className="bx bx-heart"></i>
                </span>
                <span className="menu-title">Bookmarks</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link
                href="/dashboard/add-listing/"
                className={`nav-link ${
                  pathname == "/dashboard/add-listing/" && "active"
                }`}
              >
                <span className="icon">
                  <i className="bx bx-plus-circle"></i>
                </span>
                <span className="menu-title">Add Listings</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link
                href="/dashboard/invoice/"
                className={`nav-link ${
                  pathname == "/dashboard/invoice/" && "active"
                }`}
              >
                <span className="icon">
                  <i className="bx bx-certification"></i>
                </span>
                <span className="menu-title">Invoice</span>
              </Link>
            </li>

            <li className="nav-item-title">Account</li>

            <li className="nav-item">
              <Link
                href="/dashboard/profile/"
                className={`nav-link ${
                  pathname == "/dashboard/profile" && "active"
                }`}
              >
                <span className="icon">
                  <i className="bx bxs-user-circle"></i>
                </span>
                <span className="menu-title">Profile</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link href="#">
                <span className="icon">
                  <i className="bx bx-log-out"></i>
                </span>
                <span className="menu-title">Logout</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default DashboardNavbar;

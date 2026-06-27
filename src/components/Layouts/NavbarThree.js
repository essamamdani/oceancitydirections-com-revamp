"use client";

import React, { useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { useSites } from "@/contexts/SitesContext";
import { getSiteName } from "@/lib/helper";

const NavbarThree = () => {
  const { site } = useSites();
  const siteName = site ? getSiteName(site) : (process.env.NEXT_PUBLIC_SITE_NAME || 'Realty Directions');

  const pathname = usePathname();

  const [showMenu, setshowMenu] = useState(false);
  const [displayMiniAuth, setDisplayMiniAuth] = useState(false);
  const [displayDropdownProfile, setDisplayDropdownProfile] = useState(false);

  const toggleMiniAuth = () => {
    setDisplayMiniAuth(!displayMiniAuth);
  };

  const toggleMenu = () => {
    setshowMenu(!showMenu);
  };

  const toggleDropdownProfile = () => {
    setDisplayDropdownProfile(!displayDropdownProfile);
  };

  return (
    <>
      <div className="navbar-area">
        <div className="miran-responsive-nav">
          <div className="miran-responsive-menu">
            <div
              onClick={() => toggleMenu()}
              className="hamburger-menu hamburger-two dashboard-hamburger"
            >
              {showMenu ? (
                <i className="bx bx-x"></i>
              ) : (
                <i className="bx bx-menu"></i>
              )}
            </div>
            <div className="logo">
              <Link href="/">
              <Image
                    src={`/images/${process.env.NEXT_PUBLIC_SLUG}-logo.svg`}
                    alt={siteName}
                    width={250}
                    height={42}
                    
                  />
              </Link>
            </div>
          </div>
        </div>

        <div className={showMenu ? "miran-nav show" : "miran-nav"}>
          <nav className="navbar navbar-expand-md navbar-light">
            <div className="collapse navbar-collapse mean-menu">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link href="#" className="dropdown-toggle nav-link">
                    Home
                  </Link>

                  <ul className="dropdown-menu">
                    <li className="nav-item">
                      <Link
                        href="/"
                        className={`nav-link ${pathname == "/" && "active"}`}
                      >
                        Home Demo - 1
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        href="/"
                        className={`nav-link ${
                          pathname == "/" && "active"
                        }`}
                      >
                        Home Demo - 2
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        href="/home-3/"
                        className={`nav-link ${
                          pathname == "/home-3/" && "active"
                        }`}
                      >
                        Home Demo - 3
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        href="/home-4/"
                        className={`nav-link ${
                          pathname == "/home-4/" && "active"
                        }`}
                      >
                        Home Demo - 4
                      </Link>
                    </li>
                  </ul>
                </li>

                <li className="nav-item">
                  <Link href="#" className="dropdown-toggle nav-link">
                    Listings
                  </Link>

                  <ul className="dropdown-menu">
                    <li className="nav-item">
                      <Link href="#" className="nav-link">
                        List Layout <i className="bx bx-chevron-right"></i>
                      </Link>

                      <ul className="dropdown-menu">
                        <li className="nav-item">
                          <Link
                            href="/vertical-listings-left-sidebar/"
                            className={`nav-link ${
                              pathname == "/vertical-listings-left-sidebar/" &&
                              "active"
                            }`}
                          >
                            Left Sidebar
                          </Link>
                        </li>

                        <li className="nav-item">
                          <Link
                            href="/vertical-listings-right-sidebar/"
                            className={`nav-link ${
                              pathname == "/vertical-listings-right-sidebar/" &&
                              "active"
                            }`}
                          >
                            Right Sidebar
                          </Link>
                        </li>

                        <li className="nav-item">
                          <Link
                            href="/vertical-listings-full-width/"
                            className={`nav-link ${
                              pathname == "/vertical-listings-full-width/" &&
                              "active"
                            }`}
                          >
                            Full Width
                          </Link>
                        </li>

                        <li className="nav-item">
                          <Link
                            href="/vertical-listings-with-map/"
                            className={`nav-link ${
                              pathname == "/vertical-listings-with-map/" &&
                              "active"
                            }`}
                          >
                            Full Width + Map
                          </Link>
                        </li>

                        <li className="nav-item">
                          <Link
                            href="/vertical-listings-full-map/"
                            className={`nav-link ${
                              pathname == "/vertical-listings-full-map/" &&
                              "active"
                            }`}
                          >
                            Full Width + Full Map
                          </Link>
                        </li>
                      </ul>
                    </li>

                    <li className="nav-item">
                      <Link href="#" className="nav-link">
                        Grid Layout <i className="bx bx-chevron-right"></i>
                      </Link>

                      <ul className="dropdown-menu">
                        <li className="nav-item">
                          <Link
                            href="/grid-listings-with-left-sidebar/"
                            className={`nav-link ${
                              pathname == "/grid-listings-with-left-sidebar/" &&
                              "active"
                            }`}
                          >
                            Left Sidebar
                          </Link>
                        </li>

                        <li className="nav-item">
                          <Link
                            href="/grid-listings-with-right-sidebar/"
                            className={`nav-link ${
                              pathname ==
                                "/grid-listings-with-right-sidebar/" && "active"
                            }`}
                          >
                            Right Sidebar
                          </Link>
                        </li>

                        <li className="nav-item">
                          <Link
                            href="/grid-listings-full-width/"
                            className={`nav-link ${
                              pathname == "/grid-listings-full-width/" &&
                              "active"
                            }`}
                          >
                            Full Width
                          </Link>
                        </li>

                        <li className="nav-item">
                          <Link
                            href="/grid-listings-with-map/"
                            className={`nav-link ${
                              pathname == "/grid-listings-with-map/" && "active"
                            }`}
                          >
                            Full Width + Map
                          </Link>
                        </li>

                        <li className="nav-item">
                          <Link
                            href="/grid-listings-full-map/"
                            className={`nav-link ${
                              pathname == "/grid-listings-full-map/" && "active"
                            }`}
                          >
                            Full Width + Full Map
                          </Link>
                        </li>
                      </ul>
                    </li>

                    <li className="nav-item">
                      <Link
                        href="/single-listings/"
                        className={`nav-link ${
                          pathname == "/single-listings/" && "active"
                        }`}
                      >
                        Listings Details
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        href="/destinations/"
                        className={`nav-link ${
                          pathname == "/destinations/" && "active"
                        }`}
                      >
                        Top Place
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        href="/categories/"
                        className={`nav-link ${
                          pathname == "/categories/" && "active"
                        }`}
                      >
                        Categories
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        href="/user-profile/"
                        className={`nav-link ${
                          pathname == "/user-profile/" && "active"
                        }`}
                      >
                        Author Profile
                      </Link>
                    </li>
                  </ul>
                </li>

                <li className="nav-item">
                  <Link href="#" className="dropdown-toggle nav-link">
                    User Panel
                  </Link>

                  <ul className="dropdown-menu">
                    <li className="nav-item">
                      <Link
                        href="/dashboard/"
                        className={`nav-link ${
                          pathname == "/dashboard/" && "active"
                        }`}
                      >
                        Dashboard
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        href="/dashboard/messages/"
                        className={`nav-link ${
                          pathname == "/dashboard/messages/" && "active"
                        }`}
                      >
                        Messages
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        href="/dashboard/bookings/"
                        className={`nav-link ${
                          pathname == "/dashboard/bookings/" && "active"
                        }`}
                      >
                        Bookings
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        href="/dashboard/wallet/"
                        className={`nav-link ${
                          pathname == "/dashboard/wallet/" && "active"
                        }`}
                      >
                        Wallet
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        href="/dashboard/my-listing/active/"
                        className={`nav-link ${
                          pathname == "/dashboard/my-listing/active/" &&
                          "active"
                        }`}
                      >
                        My Listings
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        href="/dashboard/reviews/"
                        className={`nav-link ${
                          pathname == "/dashboard/reviews/" && "active"
                        }`}
                      >
                        Reviews
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        href="/dashboard/bookmarks/"
                        className={`nav-link ${
                          pathname == "/dashboard/bookmarks/" && "active"
                        }`}
                      >
                        Bookmarks
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        href="/dashboard/add-listing/"
                        className={`nav-link ${
                          pathname == "/dashboard/add-listing/" && "active"
                        }`}
                      >
                        Add Listings
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        href="/dashboard/profile/"
                        className={`nav-link ${
                          pathname == "/dashboard/profile/" && "active"
                        }`}
                      >
                        My Profile
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        href="/dashboard/invoice/"
                        className={`nav-link ${
                          pathname == "/dashboard/invoice/" && "active"
                        }`}
                      >
                        Invoice
                      </Link>
                    </li>
                  </ul>
                </li>

                <li className="nav-item">
                  <Link href="#" className="dropdown-toggle nav-link">
                    Shop
                  </Link>

                  <ul className="dropdown-menu">
                    <li className="nav-item">
                      <Link
                        href="/products/"
                        className={`nav-link ${
                          pathname == "/products/" && "active"
                        }`}
                      >
                        Products List
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        href="/cart/"
                        className={`nav-link ${
                          pathname == "/cart/" && "active"
                        }`}
                      >
                        Cart
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        href="/checkout/"
                        className={`nav-link ${
                          pathname == "/checkout/" && "active"
                        }`}
                      >
                        Checkout
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        href="/products/details/"
                        className={`nav-link ${
                          pathname == "/products/details/" && "active"
                        }`}
                      >
                        Products Details
                      </Link>
                    </li>
                  </ul>
                </li>

                <li className="nav-item">
                  <Link href="#" className="dropdown-toggle nav-link">
                    Blog
                  </Link>

                  <ul className="dropdown-menu">
                    <li className="nav-item">
                      <Link
                        href="/blog/"
                        className={`nav-link ${
                          pathname == "/blog/" && "active"
                        }`}
                      >
                        Grid (2 in Row)
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        href="/blog/2/"
                        className={`nav-link ${
                          pathname == "/blog/2/" && "active"
                        }`}
                      >
                        Grid (3 in Row)
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        href="/blog/3//"
                        className={`nav-link ${
                          pathname == "/blog/3//" && "active"
                        }`}
                      >
                        Grid (Full Width)
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        href="/blog/4/"
                        className={`nav-link ${
                          pathname == "/blog/4/" && "active"
                        }`}
                      >
                        Right Sidebar
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        href="/blog/5/"
                        className={`nav-link ${
                          pathname == "/blog/5/" && "active"
                        }`}
                      >
                        Left Sidebar
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link href="#" className="nav-link">
                        Single Post <i className="bx bx-chevron-right"></i>
                      </Link>

                      <ul className="dropdown-menu">
                        <li className="nav-item">
                          <Link
                            href="/blog/details/"
                            className={`nav-link ${
                              pathname == "/blog/details/" && "active"
                            }`}
                          >
                            Default
                          </Link>
                        </li>

                        <li className="nav-item">
                          <Link
                            href="/blog/details/2/"
                            className={`nav-link ${
                              pathname == "/blog/details/2/" && "active"
                            }`}
                          >
                            With Video
                          </Link>
                        </li>

                        <li className="nav-item">
                          <Link
                            href="/blog/details/3/"
                            className={`nav-link ${
                              pathname == "/blog/details/3/" && "active"
                            }`}
                          >
                            With Image Slider
                          </Link>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>

                <li className="nav-item">
                  <Link href="#" className="dropdown-toggle nav-link">
                    Pages
                  </Link>

                  <ul className="dropdown-menu">
                    <li className="nav-item">
                      <Link
                        href="/about/"
                        className={`nav-link ${
                          pathname == "/about/" && "active"
                        }`}
                      >
                        About Us
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        href="/how-it-works/"
                        className={`nav-link ${
                          pathname == "/how-it-works/" && "active"
                        }`}
                      >
                        How It Work
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        href="/pricing/"
                        className={`nav-link ${
                          pathname == "/pricing/" && "active"
                        }`}
                      >
                        Pricing
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        href="/gallery/"
                        className={`nav-link ${
                          pathname == "/gallery/" && "active"
                        }`}
                      >
                        Gallery
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link href="#" className="nav-link">
                        Events <i className="bx bx-chevron-right"></i>
                      </Link>

                      <ul className="dropdown-menu">
                        <li className="nav-item">
                          <Link
                            href="/events/"
                            className={`nav-link ${
                              pathname == "/events/" && "active"
                            }`}
                          >
                            Events
                          </Link>
                        </li>

                        <li className="nav-item">
                          <Link
                            href="/events/details/"
                            className={`nav-link ${
                              pathname == "/events/details/" && "active"
                            }`}
                          >
                            Events Details
                          </Link>
                        </li>
                      </ul>
                    </li>

                    <li className="nav-item">
                      <Link
                        href="/testimonials/"
                        className={`nav-link ${
                          pathname == "/testimonials/" && "active"
                        }`}
                      >
                        Testimonials
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        href="/faq/"
                        className={`nav-link ${
                          pathname == "/faq/" && "active"
                        }`}
                      >
                        FAQ
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        href="/404/"
                        className={`nav-link ${
                          pathname == "/404/" && "active"
                        }`}
                      >
                        404 Error
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        href="/coming-soon/"
                        className={`nav-link ${
                          pathname == "/coming-soon/" && "active"
                        }`}
                      >
                        Coming Soon
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        href="/contact/"
                        className={`nav-link ${
                          pathname == "/contact/" && "active"
                        }`}
                      >
                        Contact
                      </Link>
                    </li>
                  </ul>
                </li>
              </ul>

              <div className="others-option d-flex align-items-center">
                <div className="option-item">
                  <div className="dropdown profile-nav-item menu-profile-one">
                    <Link
                      href="#"
                      className="dropdown-toggle"
                      role="button"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      <div className="menu-profile">
                        <Image
                          src="/images/user1.jpg"
                          className="rounded-circle"
                          alt="image"
                          width={300}
                          height={300}
                        />
                        <span className="name" onClick={toggleDropdownProfile}>
                          My Account
                        </span>
                      </div>
                    </Link>

                    <div
                      className={
                        displayDropdownProfile
                          ? "dropdown-menu show"
                          : "dropdown-menu"
                      }
                    >
                      <div className="dropdown-header d-flex flex-column align-items-center">
                        <div className="figure mb-3">
                          <Image
                            src="/images/user1.jpg"
                            className="rounded-circle"
                            alt="image"
                            width={300}
                            height={300}
                          />
                        </div>

                        <div className="info text-center">
                          <span className="name">Andy Smith</span>
                          <p className="mb-3 email">hello@androsmith.com</p>
                        </div>
                      </div>

                      <div className="dropdown-body">
                        <ul className="profile-nav p-0 pt-3">
                          <li className="nav-item">
                            <Link href="/dashboard/" className="nav-link">
                              <i className="bx bx-user"></i>{" "}
                              <span>Dashboard</span>
                            </Link>
                          </li>

                          <li className="nav-item">
                            <Link
                              href="/dashboard/messages/"
                              className="nav-link"
                            >
                              <i className="bx bx-envelope"></i>
                              <span>Messages</span>
                            </Link>
                          </li>

                          <li className="nav-item">
                            <Link
                              href="/dashboard/bookings"
                              className="nav-link"
                            >
                              <i className="bx bx-edit-alt"></i>{" "}
                              <span>Bookings</span>
                            </Link>
                          </li>

                          <li className="nav-item">
                            <Link
                              href="/dashboard/profile/"
                              className="nav-link"
                            >
                              <i className="bx bx-cog"></i>{" "}
                              <span>Settings</span>
                            </Link>
                          </li>
                        </ul>
                      </div>

                      <div className="dropdown-footer">
                        <ul className="profile-nav">
                          <li className="nav-item">
                            <Link href="/" className="nav-link">
                              <i className="bx bx-log-out"></i>{" "}
                              <span>Logout</span>
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="option-item">
                  <Link
                    href="/dashboard/add-listing"
                    className="default-btn button-one"
                  >
                    <i className="flaticon-more"></i> Add Listing
                  </Link>
                </div>
              </div>
            </div>
          </nav>
        </div>

        <div className="others-option-for-responsive">
          <div className="container">
            <div className="dot-menu" onClick={toggleMiniAuth}>
              <div className="inner">
                <div className="circle circle-one"></div>
                <div className="circle circle-two"></div>
                <div className="circle circle-three"></div>
              </div>
            </div>

            <div className={displayMiniAuth ? "container active" : "container"}>
              <div className="option-inner">
                <div className="others-option">
                  <div className="option-item">
                    <div className="dropdown profile-nav-item">
                      <Link
                        href="#"
                        className="dropdown-toggle"
                        role="button"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        <div className="menu-profile">
                          <Image
                            src="/images/user1.jpg"
                            className="rounded-circle"
                            alt="image"
                            width={300}
                            height={300}
                          />
                          <span
                            className="name"
                            onClick={toggleDropdownProfile}
                          >
                            My Account
                          </span>
                        </div>
                      </Link>

                      <div
                        className={
                          displayDropdownProfile
                            ? "dropdown-menu show"
                            : "dropdown-menu"
                        }
                      >
                        <div className="dropdown-header d-flex flex-column align-items-center">
                          <div className="figure mb-3">
                            <Image
                              src="/images/user1.jpg"
                              className="rounded-circle"
                              alt="image"
                              width={300}
                              height={300}
                            />
                          </div>

                          <div className="info text-center">
                            <span className="name">Andy Smith</span>
                            <p className="mb-3 email">hello@androsmith.com</p>
                          </div>
                        </div>

                        <div className="dropdown-body">
                          <ul className="profile-nav p-0 pt-3">
                            <li className="nav-item">
                              <Link href="/" className="nav-link">
                                <i className="bx bx-user"></i>{" "}
                                <span>Dashboard</span>
                              </Link>
                            </li>

                            <li className="nav-item">
                              <Link
                                href="/dashboard/messages/"
                                className="nav-link"
                              >
                                <i className="bx bx-envelope"></i>{" "}
                                <span>Messages</span>
                              </Link>
                            </li>

                            <li className="nav-item">
                              <Link
                                href="/dashboard/bookmarks/"
                                className="nav-link"
                              >
                                <i className="bx bx-edit-alt"></i>{" "}
                                <span>Bookings</span>
                              </Link>
                            </li>

                            <li className="nav-item">
                              <Link
                                href="/dashboard/profile/"
                                className="nav-link"
                              >
                                <i className="bx bx-cog"></i>{" "}
                                <span>Settings</span>
                              </Link>
                            </li>
                          </ul>
                        </div>

                        <div className="dropdown-footer">
                          <ul className="profile-nav">
                            <li className="nav-item">
                              <Link href="/" className="nav-link">
                                <i className="bx bx-log-out"></i>{" "}
                                <span>Logout</span>
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="option-item">
                    <Link href="/dashboard/add-listing" className="default-btn">
                      <i className="flaticon-more"></i> Add Listing
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NavbarThree;

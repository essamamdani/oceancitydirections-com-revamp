"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import Link from "next/link";
import Sidebar from "./Sidebar";
import Image from "next/image";

const UserProfileContent = () => {
  return (
    <>
      <div className="author-area ptb-100">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 col-md-12">
              <Sidebar />
            </div>

            <div className="col-lg-8 col-md-12">
              <div className="author-all-listings">
                <h2>James Listings</h2>

                <div className="row">
                  <div className="col-xl-6 col-lg-6 col-md-6">
                    <div className="single-listings-box">
                      <div className="listings-image">
                        <Image
                          src="/images/listings/listings7.jpg"
                          alt="image"
                          width={790}
                          height={525}
                        />
                        <Link href="/single-listings/" className="link-btn" aria-label="View details"></Link>

                        <button type="button" className="bookmark-save" aria-label="Save bookmark">
                          <i className="flaticon-heart"></i>
                        </button>
                        <Link href="#" className="category">
                          <i className="flaticon-cooking"></i>
                        </Link>
                      </div>

                      <div className="listings-content">
                        <div className="author">
                          <div className="d-flex align-items-center">
                            <Image
                              src="/images/user3.jpg"
                              alt="image"
                              width={300}
                              height={300}
                            />
                            <span>James</span>
                          </div>
                        </div>
                        <ul className="listings-meta">
                          <li>
                            <Link href="#">
                              <i className="flaticon-furniture-and-household"></i>
                              Restaurant
                            </Link>
                          </li>
                          <li>
                            <Link href="#">
                              <i className="flaticon-pin"></i> Francisco, USA
                            </Link>
                          </li>
                        </ul>
                        <h3>
                          <Link href="/single-listings/">
                            The Mad Made Grill
                          </Link>
                        </h3>
                        <span className="status">
                          <i className="flaticon-save"></i> Open Now
                        </span>
                        <div
                          className="
                          d-flex
                          align-items-center
                          justify-content-between
                        "
                        >
                          <div className="rating">
                            <i className="bx bxs-star"></i>
                            <i className="bx bxs-star"></i>
                            <i className="bx bxs-star"></i>
                            <i className="bx bxs-star"></i>
                            <i className="bx bxs-star"></i>
                            <span className="count">(18)</span>
                          </div>
                          <div className="price">
                            Start From <span>$121</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-6 col-lg-6 col-md-6">
                    <div className="single-listings-box">
                      <div className="listings-image">
                        <Swiper
                          loop={true}
                          navigation={true}
                          modules={[Navigation]}
                          className="listings-image-slides"
                        >
                          <SwiperSlide>
                            <div className="single-image">
                              <Image
                                src="/images/listings/listings4.jpg"
                                alt="image"
                                width={790}
                                height={525}
                              />
                              <Link href="/single-listings" className="link-btn" aria-label="View details"></Link>
                            </div>
                          </SwiperSlide>

                          <SwiperSlide>
                            <div className="single-image">
                              <Image
                                src="/images/listings/listings2.jpg"
                                alt="image"
                                width={790}
                                height={525}
                              />
                              <Link href="/single-listings" className="link-btn" aria-label="View details"></Link>
                            </div>
                          </SwiperSlide>
                        </Swiper>

                        <button type="button" className="bookmark-save" aria-label="Save bookmark">
                          <i className="flaticon-heart"></i>
                        </button>
                        <Link href="#" className="category">
                          <i className="flaticon-cooking"></i>
                        </Link>
                      </div>

                      <div className="listings-content">
                        <div className="author">
                          <div className="d-flex align-items-center">
                            <Image
                              src="/images/user2.jpg"
                              alt="image"
                              width={300}
                              height={300}
                            />
                            <span>Sarah</span>
                          </div>
                        </div>
                        <ul className="listings-meta">
                          <li>
                            <Link href="#">
                              <i className="flaticon-hotel"></i> Hotel
                            </Link>
                          </li>
                          <li>
                            <Link href="#">
                              <i className="flaticon-pin"></i> Los Angeles, USA
                            </Link>
                          </li>
                        </ul>
                        <h3>
                          <Link href="/single-listings/">
                            The Beverly Hills Hotel
                          </Link>
                        </h3>
                        <span className="status">
                          <i className="flaticon-save"></i> Open Now
                        </span>
                        <div
                          className="
                          d-flex
                          align-items-center
                          justify-content-between
                        "
                        >
                          <div className="rating">
                            <i className="bx bxs-star"></i>
                            <i className="bx bxs-star"></i>
                            <i className="bx bxs-star"></i>
                            <i className="bx bxs-star"></i>
                            <i className="bx bx-star"></i>
                            <span className="count">(10)</span>
                          </div>
                          <div className="price">
                            Start From <span>$200</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-6 col-lg-6 col-md-6">
                    <div className="single-listings-box">
                      <div className="listings-image">
                        <Image
                          src="/images/listings/listings8.jpg"
                          alt="image"
                          width={790}
                          height={525}
                        />
                        <Link href="/single-listings/" className="link-btn" aria-label="View details"></Link>

                        <button type="button" className="bookmark-save" aria-label="Save bookmark">
                          <i className="flaticon-heart"></i>
                        </button>
                        <Link href="#" className="category">
                          <i className="flaticon-cooking"></i>
                        </Link>
                      </div>

                      <div className="listings-content">
                        <div className="author">
                          <div className="d-flex align-items-center">
                            <Image
                              src="/images/user5.jpg"
                              alt="image"
                              width={300}
                              height={300}
                            />
                            <span>Lina</span>
                          </div>
                        </div>
                        <ul className="listings-meta">
                          <li>
                            <Link href="#">
                              <i className="flaticon-shopping-bags"></i>{" "}
                              Shopping
                            </Link>
                          </li>
                          <li>
                            <Link href="#">
                              <i className="flaticon-pin"></i> Seattle, USA
                            </Link>
                          </li>
                        </ul>
                        <h3>
                          <Link href="/single-listings/">
                            Blue Water Shopping City
                          </Link>
                        </h3>
                        <span className="status">
                          <i className="flaticon-save"></i> Open Now
                        </span>
                        <div
                          className="
                          d-flex
                          align-items-center
                          justify-content-between
                        "
                        >
                          <div className="rating">
                            <i className="bx bxs-star"></i>
                            <i className="bx bxs-star"></i>
                            <i className="bx bxs-star"></i>
                            <i className="bx bxs-star"></i>
                            <i className="bx bxs-star"></i>
                            <span className="count">(55)</span>
                          </div>
                          <div className="price">
                            Start From <span>$500</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-6 col-lg-6 col-md-6">
                    <div className="single-listings-box">
                      <div className="listings-image">
                        <Image
                          src="/images/listings/listings1.jpg"
                          alt="image"
                          width={790}
                          height={525}
                        />
                        <Link href="/single-listings/" className="link-btn" aria-label="View details"></Link>

                        <button type="button" className="bookmark-save" aria-label="Save bookmark">
                          <i className="flaticon-heart"></i>
                        </button>
                        <Link href="#" className="category">
                          <i className="flaticon-cooking"></i>
                        </Link>
                      </div>

                      <div className="listings-content">
                        <div className="author">
                          <div className="d-flex align-items-center">
                            <Image
                              src="/images/user1.jpg"
                              alt="image"
                              width={300}
                              height={300}
                            />
                            <span>Taylor</span>
                          </div>
                        </div>
                        <ul className="listings-meta">
                          <li>
                            <Link href="#">
                              <i className="flaticon-furniture-and-household"></i>
                              Restaurant
                            </Link>
                          </li>
                          <li>
                            <Link href="#">
                              <i className="flaticon-pin"></i> New York, USA
                            </Link>
                          </li>
                        </ul>
                        <h3>
                          <Link href="/single-listings/">
                            Chipotle Mexican Grill
                          </Link>
                        </h3>
                        <span className="status">
                          <i className="flaticon-save"></i> Open Now
                        </span>
                        <div
                          className="
                          d-flex
                          align-items-center
                          justify-content-between
                        "
                        >
                          <div className="rating">
                            <i className="bx bxs-star"></i>
                            <i className="bx bxs-star"></i>
                            <i className="bx bxs-star"></i>
                            <i className="bx bxs-star"></i>
                            <i className="bx bxs-star"></i>
                            <span className="count">(45)</span>
                          </div>
                          <div className="price">
                            Start From <span>$150</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-6 col-lg-6 col-md-6">
                    <div className="single-listings-box">
                      <div className="listings-image">
                        <Image
                          src="/images/listings/listings3.jpg"
                          alt="image"
                          width={790}
                          height={525}
                        />
                        <Link href="/single-listings/" className="link-btn" aria-label="View details"></Link>

                        <button type="button" className="bookmark-save" aria-label="Save bookmark">
                          <i className="flaticon-heart"></i>
                        </button>
                        <Link href="#" className="category">
                          <i className="flaticon-cooking"></i>
                        </Link>
                      </div>

                      <div className="listings-content">
                        <div className="author">
                          <div className="d-flex align-items-center">
                            <Image
                              src="/images/user3.jpg"
                              alt="image"
                              width={300}
                              height={300}
                            />
                            <span>James</span>
                          </div>
                        </div>
                        <ul className="listings-meta">
                          <li>
                            <Link href="#">
                              <i className="flaticon-shopping-bags"></i>{" "}
                              Shopping
                            </Link>
                          </li>
                          <li>
                            <Link href="#">
                              <i className="flaticon-pin"></i> Bangkok, Thailand
                            </Link>
                          </li>
                        </ul>
                        <h3>
                          <Link href="/single-listings/">
                            Central Shopping Center
                          </Link>
                        </h3>
                        <span className="status status-close">
                          <i className="flaticon-save"></i> Close Now
                        </span>
                        <div
                          className="
                          d-flex
                          align-items-center
                          justify-content-between
                        "
                        >
                          <div className="rating">
                            <i className="bx bxs-star"></i>
                            <i className="bx bxs-star"></i>
                            <i className="bx bxs-star"></i>
                            <i className="bx bxs-star"></i>
                            <i className="bx bxs-star-half"></i>
                            <span className="count">(35)</span>
                          </div>
                          <div className="price">
                            Start From <span>$110</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-6 col-lg-6 col-md-6">
                    <div className="single-listings-box">
                      <div className="listings-image">
                        <Swiper
                          loop={true}
                          navigation={true}
                          modules={[Navigation]}
                          className="listings-image-slides"
                        >
                          <SwiperSlide>
                            <div className="single-image">
                              <Image
                                src="/images/listings/listings4.jpg"
                                alt="image"
                                width={790}
                                height={525}
                              />
                              <Link href="/single-listings" className="link-btn" aria-label="View details"></Link>
                            </div>
                          </SwiperSlide>

                          <SwiperSlide>
                            <div className="single-image">
                              <Image
                                src="/images/listings/listings2.jpg"
                                alt="image"
                                width={790}
                                height={525}
                              />
                              <Link href="/single-listings" className="link-btn" aria-label="View details"></Link>
                            </div>
                          </SwiperSlide>
                        </Swiper>

                        <button type="button" className="bookmark-save" aria-label="Save bookmark">
                          <i className="flaticon-heart"></i>
                        </button>
                        <Link href="#" className="category">
                          <i className="flaticon-cooking"></i>
                        </Link>
                      </div>

                      <div className="listings-content">
                        <div className="author">
                          <div className="d-flex align-items-center">
                            <Image
                              src="/images/user4.jpg"
                              alt="image"
                              width={300}
                              height={300}
                            />
                            <span>Andy</span>
                          </div>
                        </div>
                        <ul className="listings-meta">
                          <li>
                            <Link href="#">
                              <i className="flaticon-cleansing"></i> Beauty
                            </Link>
                          </li>
                          <li>
                            <Link href="#">
                              <i className="flaticon-pin"></i> Suwanee, USA
                            </Link>
                          </li>
                        </ul>
                        <h3>
                          <Link href="/single-listings/">
                            Indice Beauty Center
                          </Link>
                        </h3>
                        <span className="status">
                          <i className="flaticon-save"></i> Open Now
                        </span>
                        <div
                          className="
                          d-flex
                          align-items-center
                          justify-content-between
                        "
                        >
                          <div className="rating">
                            <i className="bx bxs-star"></i>
                            <i className="bx bxs-star"></i>
                            <i className="bx bxs-star"></i>
                            <i className="bx bx-star"></i>
                            <i className="bx bx-star"></i>
                            <span className="count">(15)</span>
                          </div>
                          <div className="price">
                            Start From <span>$100</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-12 col-md-12">
                    <div className="pagination-area text-center">
                      <a href="#" className="prev page-numbers">
                        <i className="bx bx-chevrons-left"></i>
                      </a>
                      <span
                        className="page-numbers current"
                        aria-current="page"
                      >
                        1
                      </span>
                      <a href="#" className="page-numbers">
                        2
                      </a>
                      <a href="#" className="page-numbers">
                        3
                      </a>
                      <a href="#" className="page-numbers">
                        4
                      </a>
                      <a href="#" className="next page-numbers">
                        <i className="bx bx-chevrons-right"></i>
                      </a>
                    </div>
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

export default UserProfileContent;

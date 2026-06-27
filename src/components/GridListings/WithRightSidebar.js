"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import Sidebar from "../Listings/Sidebar";

const WithRightSidebar = () => {
  return (
    <>
      <div className="listings-area ptb-100">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 col-md-12">
              <div className="listings-grid-sorting row align-items-center">
                <div className="col-lg-5 col-md-6 result-count">
                  <p>
                    We found <span className="count">9</span> listings available
                    for you
                  </p>
                </div>

                <div className="col-lg-7 col-md-6 ordering">
                  <div className="d-flex justify-content-end">
                    <div className="select-box">
                      <label>Sort By:</label>
                      <select className="blog-select">
                        <option>Recommended</option>
                        <option>Default</option>
                        <option>Popularity</option>
                        <option>Latest</option>
                        <option>Price: low to high</option>
                        <option>Price: high to low</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-xl-6 col-lg-6 col-md-6">
                  <div className="single-listings-box">
                    <div className="listings-image">
                      <Image
                        src="/images/listings/listings1.jpg"
                        alt="image"
                        width={790}
                        height={525}
                      />
                      <Link href="/single-listings" className="link-btn" aria-label="View details"></Link>

                      <button type="button" className="bookmark-save" aria-label="Save bookmark">
                        <i className="flaticon-heart"></i>
                      </button>
                      <button type="button" className="category" aria-label="Category">
                        <i className="flaticon-cooking"></i>
                      </button>
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
                        <Link href="/single-listings">
                          Chipotle Mexican Grill
                        </Link>
                      </h3>
                      <span className="status">
                        <i className="flaticon-save"></i> Open Now
                      </span>
                      <div className="d-flex align-items-center justify-content-between">
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
                      <Swiper
                        loop={true}
                        navigation={true}
                        modules={[Navigation]}
                        className="listings-image-slides"
                      >
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
                      </Swiper>

                      <button type="button" className="bookmark-save" aria-label="Save bookmark">
                        <i className="flaticon-heart"></i>
                      </button>
                      <button type="button" className="category" aria-label="Category">
                        <i className="flaticon-cooking"></i>
                      </button>
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
                            <i className="flaticon-furniture-and-household"></i>
                            Hotel
                          </Link>
                        </li>
                        <li>
                          <Link href="#">
                            <i className="flaticon-pin"></i> Los Angeles, USA
                          </Link>
                        </li>
                      </ul>
                      <h3>
                        <Link href="/single-listings">
                          The Beverly Hills Hotel
                        </Link>
                      </h3>
                      <span className="status">
                        <i className="flaticon-save"></i> Open Now
                      </span>
                      <div className="d-flex align-items-center justify-content-between">
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
                        src="/images/listings/listings3.jpg"
                        alt="image"
                        width={790}
                        height={525}
                      />
                      <Link href="/single-listings" className="link-btn" aria-label="View details"></Link>

                      <button type="button" className="bookmark-save" aria-label="Save bookmark">
                        <i className="flaticon-heart"></i>
                      </button>
                      <button type="button" className="category" aria-label="Category">
                        <i className="flaticon-cooking"></i>
                      </button>
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
                            <i className="flaticon-shopping-bags"></i> Shopping
                          </Link>
                        </li>
                        <li>
                          <Link href="#">
                            <i className="flaticon-pin"></i> Bangkok, Thailand
                          </Link>
                        </li>
                      </ul>
                      <h3>
                        <Link href="/single-listings">
                          Central Shopping Center
                        </Link>
                      </h3>
                      <span className="status status-close">
                        <i className="flaticon-save"></i> Close Now
                      </span>
                      <div className="d-flex align-items-center justify-content-between">
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
                              src="/images/listings/listings5.jpg"
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
                              src="/images/listings/listings6.jpg"
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
                      <button type="button" className="category" aria-label="Category">
                        <i className="flaticon-cooking"></i>
                      </button>
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
                        <Link href="/single-listings">
                          Indice Beauty Center
                        </Link>
                      </h3>
                      <span className="status">
                        <i className="flaticon-save"></i> Open Now
                      </span>
                      <div className="d-flex align-items-center justify-content-between">
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

                <div className="col-xl-6 col-lg-6 col-md-6">
                  <div className="single-listings-box">
                    <div className="listings-image">
                      <Image
                        src="/images/listings/listings7.jpg"
                        alt="image"
                        width={790}
                        height={525}
                      />
                      <Link href="/single-listings" className="link-btn" aria-label="View details"></Link>

                      <button type="button" className="bookmark-save" aria-label="Save bookmark">
                        <i className="flaticon-heart"></i>
                      </button>
                      <button type="button" className="category" aria-label="Category">
                        <i className="flaticon-cooking"></i>
                      </button>
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
                        <Link href="/single-listings">The Mad Made Grill</Link>
                      </h3>
                      <span className="status">
                        <i className="flaticon-save"></i> Open Now
                      </span>
                      <div className="d-flex align-items-center justify-content-between">
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
                      <button type="button" className="category" aria-label="Category">
                        <i className="flaticon-cooking"></i>
                      </button>
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
                        <Link href="/single-listings">
                          The Beverly Hills Hotel
                        </Link>
                      </h3>
                      <span className="status">
                        <i className="flaticon-save"></i> Open Now
                      </span>
                      <div className="d-flex align-items-center justify-content-between">
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
                        src="/images/listings/listings13.jpg"
                        alt="image"
                        width={790}
                        height={525}
                      />
                      <Link href="/single-listings" className="link-btn" aria-label="View details"></Link>

                      <button type="button" className="bookmark-save" aria-label="Save bookmark">
                        <i className="flaticon-heart"></i>
                      </button>
                      <button type="button" className="category" aria-label="Category">
                        <i className="flaticon-cooking"></i>
                      </button>
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
                            <i className="flaticon-shopping-bags"></i> Fitness
                          </Link>
                        </li>
                        <li>
                          <Link href="#">
                            <i className="flaticon-pin"></i> Bangkok, Thailand
                          </Link>
                        </li>
                      </ul>
                      <h3>
                        <Link href="/single-listings">Power House Gym</Link>
                      </h3>
                      <span className="status status-close">
                        <i className="flaticon-save"></i> Close Now
                      </span>
                      <div className="d-flex align-items-center justify-content-between">
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
                              src="/images/listings/listings14.jpg"
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
                              src="/images/listings/listings15.jpg"
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
                      <button type="button" className="category" aria-label="Category">
                        <i className="flaticon-cooking"></i>
                      </button>
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
                        <Link href="/single-listings">
                          Divine Beauty Parlour & Spa
                        </Link>
                      </h3>
                      <span className="status">
                        <i className="flaticon-save"></i> Open Now
                      </span>
                      <div className="d-flex align-items-center justify-content-between">
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

                <div className="col-xl-12 col-lg-12 col-md-12">
                  <div className="pagination-area text-center">
                    <a href="#" className="prev page-numbers">
                      <i className="bx bx-chevrons-left"></i>
                    </a>
                    <span className="page-numbers current" aria-current="page">
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

            <div className="col-lg-4 col-md-12">
              <Sidebar />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WithRightSidebar;

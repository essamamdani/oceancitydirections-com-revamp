"use client";

import React from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import Image from "next/image";

const BookmarkListings = () => {
  return (
    <>
      <div className="listing-area">
        <div className="row">
          <div className="col-xl-4 col-lg-6 col-md-6">
            <div className="single-listings-box">
              <div className="listings-image">
                <Image
                  src="/images/listings/listings1.jpg"
                  alt="image"
                  width={790}
                  height={525}
                />
                <Link href="/single-listings" className="link-btn" aria-label="View details"></Link>
              </div>

              <div className="listings-content">
                <ul className="listings-meta">
                  <li>
                    <Link href="#">
                      <i className="flaticon-furniture-and-household"></i>{" "}
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
                  <Link href="/single-listings">Chipotle Mexican Grill</Link>
                </h3>
                <div className="d-flex align-items-center justify-content-between">
                  <div className="rating">
                    <i className="bx bxs-star"></i>
                    <i className="bx bxs-star"></i>
                    <i className="bx bxs-star"></i>
                    <i className="bx bxs-star"></i>
                    <i className="bx bxs-star"></i>
                    <span className="count">(45)</span>
                  </div>
                </div>
              </div>

              <div className="listings-footer">
                <button type="button" className="default-btn">
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div className="col-xl-4 col-lg-6 col-md-6">
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
              </div>

              <div className="listings-content">
                <ul className="listings-meta">
                  <li>
                    <Link href="#">
                      <i className="flaticon-furniture-and-household"></i> Hotel
                    </Link>
                  </li>
                  <li>
                    <Link href="#">
                      <i className="flaticon-pin"></i> Los Angeles, USA
                    </Link>
                  </li>
                </ul>
                <h3>
                  <Link href="/single-listings">The Beverly Hills Hotel</Link>
                </h3>
                <div className="d-flex align-items-center justify-content-between">
                  <div className="rating">
                    <i className="bx bxs-star"></i>
                    <i className="bx bxs-star"></i>
                    <i className="bx bxs-star"></i>
                    <i className="bx bxs-star"></i>
                    <i className="bx bx-star"></i>
                    <span className="count">(10)</span>
                  </div>
                </div>
              </div>

              <div className="listings-footer">
                <button type="button" className="default-btn">
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div className="col-xl-4 col-lg-6 col-md-6">
            <div className="single-listings-box">
              <div className="listings-image">
                <Image
                  src="/images/listings/listings3.jpg"
                  alt="image"
                  width={790}
                  height={525}
                />
                <Link href="/single-listings" className="link-btn" aria-label="View details"></Link>
              </div>

              <div className="listings-content">
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
                  <Link href="/single-listings">Central Shopping Center</Link>
                </h3>
                <div className="d-flex align-items-center justify-content-between">
                  <div className="rating">
                    <i className="bx bxs-star"></i>
                    <i className="bx bxs-star"></i>
                    <i className="bx bxs-star"></i>
                    <i className="bx bxs-star"></i>
                    <i className="bx bxs-star-half"></i>
                    <span className="count">(35)</span>
                  </div>
                </div>
              </div>

              <div className="listings-footer">
                <button type="button" className="default-btn">
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div className="col-xl-4 col-lg-6 col-md-6">
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
              </div>

              <div className="listings-content">
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
                  <Link href="/single-listings">Indice Beauty Center</Link>
                </h3>
                <div className="d-flex align-items-center justify-content-between">
                  <div className="rating">
                    <i className="bx bxs-star"></i>
                    <i className="bx bxs-star"></i>
                    <i className="bx bxs-star"></i>
                    <i className="bx bx-star"></i>
                    <i className="bx bx-star"></i>
                    <span className="count">(15)</span>
                  </div>
                </div>
              </div>

              <div className="listings-footer">
                <button type="button" className="default-btn">
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div className="col-xl-4 col-lg-6 col-md-6">
            <div className="single-listings-box">
              <div className="listings-image">
                <Image
                  src="/images/listings/listings7.jpg"
                  alt="image"
                  width={790}
                  height={525}
                />
                <Link href="/single-listings" className="link-btn" aria-label="View details"></Link>
              </div>

              <div className="listings-content">
                <ul className="listings-meta">
                  <li>
                    <Link href="#">
                      <i className="flaticon-furniture-and-household"></i>{" "}
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
                <div className="d-flex align-items-center justify-content-between">
                  <div className="rating">
                    <i className="bx bxs-star"></i>
                    <i className="bx bxs-star"></i>
                    <i className="bx bxs-star"></i>
                    <i className="bx bxs-star"></i>
                    <i className="bx bxs-star"></i>
                    <span className="count">(18)</span>
                  </div>
                </div>
              </div>

              <div className="listings-footer">
                <button type="button" className="default-btn">
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div className="col-xl-4 col-lg-6 col-md-6">
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
              </div>

              <div className="listings-content">
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
                  <Link href="/single-listings">The Beverly Hills Hotel</Link>
                </h3>
                <div className="d-flex align-items-center justify-content-between">
                  <div className="rating">
                    <i className="bx bxs-star"></i>
                    <i className="bx bxs-star"></i>
                    <i className="bx bxs-star"></i>
                    <i className="bx bxs-star"></i>
                    <i className="bx bx-star"></i>
                    <span className="count">(10)</span>
                  </div>
                </div>
              </div>

              <div className="listings-footer">
                <button type="button" className="default-btn">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookmarkListings;

"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

const MostVisitedListing = () => {
  return (
    <>
      <section className="listings-area listings-area-three pt-100 pb-70">
        <div className="container">
          <div className="section-title">
            <h2>Most Visited Listings</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis
              ipsum suspendisse ultrices gravida. Risus commodo viverra.
            </p>
          </div>

          <Tabs>
            <div className="shorting-menu">
              <TabList>
                <Tab>
                  <button className="filter" data-filter="all">
                    <i className="flaticon-category"></i> All
                  </button>
                </Tab>

                <Tab>
                  <button className="filter" data-filter=".restaurant">
                    <i className="flaticon-cooking"></i> Restaurant
                  </button>
                </Tab>

                <Tab>
                  <button className="filter" data-filter=".shopping">
                    <i className="flaticon-shopping-bags"></i> Shopping
                  </button>
                </Tab>

                <Tab>
                  <button className="filter" data-filter=".hotel">
                    <i className="flaticon-hotel"></i> Hotel
                  </button>
                </Tab>

                <Tab>
                  <button className="filter" data-filter=".fitness">
                    <i className="flaticon-exercise"></i> Fitness
                  </button>
                </Tab>

                <Tab>
                  <button className="filter" data-filter=".beautySpa">
                    <i className="flaticon-cleansing"></i> Beauty & Spa
                  </button>
                </Tab>
              </TabList>
            </div>

            <div className="shorting">
              <div className="row">
                <TabPanel>
                  <div className="row justify-content-center">
                    <div className="col-xl-4 col-lg-6 col-md-6 restaurant">
                      <div className="single-listings-box without-boxshadow">
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
                              <Link href="/single-listings">
                                <i className="flaticon-furniture-and-household"></i>{" "}
                                Restaurant
                              </Link>
                            </li>
                            <li>
                              <Link href="/single-listings">
                                <i className="flaticon-pin"></i> Francisco, USA
                              </Link>
                            </li>
                          </ul>

                          <h3>
                            <Link href="/single-listings">
                              The Mad Made Grill
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
                              <span className="count">(18)</span>
                            </div>
                            <div className="price">
                              Start From <span>$121</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-xl-4 col-lg-6 col-md-6 hotel">
                      <div className="single-listings-box without-boxshadow">
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
                                  src="/images/listings/listings3.jpg"
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
                              <Link href="/single-listings">
                                <i className="flaticon-hotel"></i> Hotel
                              </Link>
                            </li>
                            <li>
                              <Link href="/single-listings">
                                <i className="flaticon-pin"></i> Los Angeles,
                                USA
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

                    <div className="col-xl-4 col-lg-6 col-md-6 shopping">
                      <div className="single-listings-box without-boxshadow">
                        <div className="listings-image">
                          <Image
                            src="/images/listings/listings8.jpg"
                            alt="image"
                            width={790}
                            height={525}
                          />
                          <Link href="/single-listings" className="link-btn" aria-label="View details"></Link>

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
                              <Link href="/single-listings">
                                <i className="flaticon-shopping-bags"></i>{" "}
                                Shopping
                              </Link>
                            </li>
                            <li>
                              <Link href="/single-listings">
                                <i className="flaticon-pin"></i> Seattle, USA
                              </Link>
                            </li>
                          </ul>

                          <h3>
                            <Link href="/single-listings">
                              Blue Water Shopping City
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
                              <span className="count">(55)</span>
                            </div>
                            <div className="price">
                              Start From <span>$500</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-xl-4 col-lg-6 col-md-6 restaurant">
                      <div className="single-listings-box without-boxshadow">
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
                              <Link href="/single-listings">
                                <i className="flaticon-furniture-and-household"></i>{" "}
                                Restaurant
                              </Link>
                            </li>
                            <li>
                              <Link href="/single-listings">
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

                    <div className="col-xl-4 col-lg-6 col-md-6 shopping">
                      <div className="single-listings-box without-boxshadow">
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
                              <Link href="/single-listings">
                                <i className="flaticon-shopping-bags"></i>{" "}
                                Shopping
                              </Link>
                            </li>
                            <li>
                              <Link href="/single-listings">
                                <i className="flaticon-pin"></i> Bangkok,
                                Thailand
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

                    <div className="col-xl-4 col-lg-6 col-md-6 beautySpa fitness">
                      <div className="single-listings-box without-boxshadow">
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
                                  src="/images/listings/listings3.jpg"
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
                              <Link href="/single-listings">
                                <i className="flaticon-cleansing"></i> Beauty
                              </Link>
                            </li>
                            <li>
                              <Link href="/single-listings">
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
                  </div>
                </TabPanel>

                <TabPanel>
                  <div className="row justify-content-center">
                    <div className="col-xl-4 col-lg-6 col-md-6 restaurant">
                      <div className="single-listings-box without-boxshadow">
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
                              <Link href="/single-listings">
                                <i className="flaticon-furniture-and-household"></i>{" "}
                                Restaurant
                              </Link>
                            </li>
                            <li>
                              <Link href="/single-listings">
                                <i className="flaticon-pin"></i> Francisco, USA
                              </Link>
                            </li>
                          </ul>
                          <h3>
                            <Link href="/single-listings">
                              The Mad Made Grill
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
                              <span className="count">(18)</span>
                            </div>
                            <div className="price">
                              Start From <span>$121</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-xl-4 col-lg-6 col-md-6 restaurant">
                      <div className="single-listings-box without-boxshadow">
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
                              <Link href="/single-listings">
                                <i className="flaticon-furniture-and-household"></i>{" "}
                                Restaurant
                              </Link>
                            </li>
                            <li>
                              <Link href="/single-listings">
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
                  </div>
                </TabPanel>

                <TabPanel>
                  <div className="row justify-content-center">
                    <div className="col-xl-4 col-lg-6 col-md-6 shopping">
                      <div className="single-listings-box without-boxshadow">
                        <div className="listings-image">
                          <Image
                            src="/images/listings/listings8.jpg"
                            alt="image"
                            width={790}
                            height={525}
                          />
                          <Link href="/single-listings" className="link-btn" aria-label="View details"></Link>

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
                              <Link href="/single-listings">
                                <i className="flaticon-shopping-bags"></i>{" "}
                                Shopping
                              </Link>
                            </li>
                            <li>
                              <Link href="/single-listings">
                                <i className="flaticon-pin"></i> Seattle, USA
                              </Link>
                            </li>
                          </ul>
                          <h3>
                            <Link href="/single-listings">
                              Blue Water Shopping City
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
                              <span className="count">(55)</span>
                            </div>
                            <div className="price">
                              Start From <span>$500</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-xl-4 col-lg-6 col-md-6 shopping">
                      <div className="single-listings-box without-boxshadow">
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
                              <Link href="/single-listings">
                                <i className="flaticon-shopping-bags"></i>{" "}
                                Shopping
                              </Link>
                            </li>
                            <li>
                              <Link href="/single-listings">
                                <i className="flaticon-pin"></i> Bangkok,
                                Thailand
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
                  </div>
                </TabPanel>

                <TabPanel>
                  <div className="row justify-content-center">
                    <div className="col-lg-4 col-md-6 hotel">
                      <div className="single-listings-box without-boxshadow">
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
                                  src="/images/listings/listings3.jpg"
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
                              <Link href="/single-listings">
                                <i className="flaticon-hotel"></i> Hotel
                              </Link>
                            </li>
                            <li>
                              <Link href="/single-listings">
                                <i className="flaticon-pin"></i> Los Angeles,
                                USA
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
                  </div>
                </TabPanel>

                <TabPanel>
                  <div className="row justify-content-center">
                    <div className="col-lg-4 col-md-6 beautySpa fitness">
                      <div className="single-listings-box without-boxshadow">
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
                                  src="/images/listings/listings3.jpg"
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
                              <Link href="/single-listings">
                                <i className="flaticon-cleansing"></i> Beauty
                              </Link>
                            </li>
                            <li>
                              <Link href="/single-listings">
                                <i className="flaticon-pin"></i> Suwanee, USA
                              </Link>
                            </li>
                          </ul>
                          <h3>
                            <Link href="/single-listings" className="link-btn">
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
                  </div>
                </TabPanel>

                <TabPanel>
                  <div className="row justify-content-center">
                    <div className="col-xl-4 col-lg-6 col-md-6 shopping">
                      <div className="single-listings-box without-boxshadow">
                        <div className="listings-image">
                          <Image
                            src="/images/listings/listings8.jpg"
                            alt="image"
                            width={790}
                            height={525}
                          />
                          <Link href="/single-listings" className="link-btn" aria-label="View details"></Link>

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
                              <Link href="/single-listings">
                                <i className="flaticon-shopping-bags"></i>{" "}
                                Shopping
                              </Link>
                            </li>
                            <li>
                              <Link href="/single-listings">
                                <i className="flaticon-pin"></i> Seattle, USA
                              </Link>
                            </li>
                          </ul>
                          <h3>
                            <Link href="/single-listings" className="link-btn">
                              Blue Water Shopping City
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
                              <span className="count">(55)</span>
                            </div>
                            <div className="price">
                              Start From <span>$500</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-xl-4 col-lg-6 col-md-6 shopping">
                      <div className="single-listings-box without-boxshadow">
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
                              <Link href="/single-listings">
                                <i className="flaticon-shopping-bags"></i>{" "}
                                Shopping
                              </Link>
                            </li>
                            <li>
                              <Link href="/single-listings">
                                <i className="flaticon-pin"></i> Bangkok,
                                Thailand
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
                  </div>
                </TabPanel>
              </div>
            </div>
          </Tabs>
        </div>
      </section>
    </>
  );
};

export default MostVisitedListing;

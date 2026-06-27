"use client";

import React from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import Image from "next/image";

const PlacesArea = () => {
  return (
    <>
      <section className="places-area pt-100 pb-0">
        <div className="container">
          <div className="section-title">
            <h2>Popular Places for Future Trips</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis
              ipsum suspendisse ultrices gravida. Risus commodo viverra.
            </p>
          </div>

          <div className="row">
            <div className="col-lg-6 col-md-12">
              <div className="places-image text-center">
                <Image src="/images/boy-girl.png" alt="image" width={524} height={520} />
              </div>
            </div>

            <div className="col-lg-6 col-md-12">
              <Swiper
                spaceBetween={15}
                pagination={{
                  clickable: true,
                }}
                breakpoints={{
                  0: {
                    slidesPerView: 1,
                  },
                  768: {
                    slidesPerView: 2,
                  },
                }}
                modules={[Pagination]}
                className="places-slides"
              >
                <SwiperSlide>
                  <div className="single-places-box">
                    <div className="image">
                      <Link href="/destinations">
                        <Image
                          src="/images/destinations/destinations11.jpg"
                          alt="image"
                          width={580}
                          height={600}
                        />
                      </Link>
                      <div className="country">FRANCE</div>
                    </div>
                    <div className="content">
                      <h3>Paris</h3>
                      <span>20 Places</span>
                    </div>
                    <Link href="/destinations" className="link-btn" aria-label="View details"></Link>
                  </div>
                </SwiperSlide>

                <SwiperSlide>
                  <div className="single-places-box">
                    <div className="image">
                      <Image
                        src="/images/destinations/destinations12.jpg"
                        alt="image"
                        width={580}
                        height={600}
                      />
                      <div className="country">UNITED KINGDOM</div>
                    </div>
                    <div className="content">
                      <h3>London</h3>
                      <span>15 Places</span>
                    </div>
                    <Link href="/destinations" className="link-btn" aria-label="View details"></Link>
                  </div>
                </SwiperSlide>

                <SwiperSlide>
                  <div className="single-places-box">
                    <div className="image">
                      <Image
                        src="/images/destinations/destinations13.jpg"
                        alt="image"
                        width={580}
                        height={600}
                      />
                      <div className="country">ABUDABI</div>
                    </div>
                    <div className="content">
                      <h3>Dubai</h3>
                      <span>21 Places</span>
                    </div>
                    <Link href="/destinations" className="link-btn" aria-label="View details"></Link>
                  </div>
                </SwiperSlide>
              </Swiper>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PlacesArea;

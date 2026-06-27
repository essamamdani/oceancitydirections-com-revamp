"use client";
import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import RealtySearch from "./BothBusinessRealtySearch";
import BusinessSearch from "./OnlyBusinessSearch";
import { useSites } from "@/contexts/SitesContext";


const Banner = () => {
  const { site, loading, error } = useSites();

  if (loading || !site || error) {
    return null;
  }
  return (
    <section className="home-slider-area">
      <Swiper
        pagination={{ clickable: true }}
        modules={[Pagination]}
        className="home-slides"
      >
        {site.slides?.swiper?.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="single-banner-item" style={{ position: "relative" }}>
              <Image 
                src={slide.img} 
                alt={`Banner ${index + 1}`} 
                fill 
                priority={index === 0}
                style={{ objectFit: 'cover' }} 
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="banner-content">
        <h1 className="banner-two-heading">
          <Swiper
            autoplay={{
              delay: 5000,
              pauseOnMouseEnter: true,
            }}
            modules={[Autoplay]}
          >
            {site.IncludeRealty && (
              <>
                <SwiperSlide key="homes-sale">
                  Search <span className="color-0ec6c6">Homes</span> For Sale
                </SwiperSlide>
                <SwiperSlide key="homes-rent">
                  Search <span className="color-0ec6c6">Homes</span> For Rent
                </SwiperSlide>
              </>
            )}
            <SwiperSlide key="hotels">
              Find Nearby <span className="color-0ec6c6">Hotels</span>
            </SwiperSlide>
            <SwiperSlide key="restaurants">
              Find Nearby <span className="color-0ec6c6">Restaurants</span>
            </SwiperSlide>
            <SwiperSlide key="shopping">
              Find Nearby <span className="color-0ec6c6">Shopping</span>
            </SwiperSlide>
          </Swiper>
        </h1>

        {site.IncludeRealty === false ? (
          <><p className="mb-2">Explore top-rated attractions, activities, and more...</p><BusinessSearch /></>
        ) : (
          <><p className="mb-2">Explore real estate, top-rated attractions, activities, and more...</p><RealtySearch /></>
        )}

      </div>
    </section>
  );
};

export default Banner;

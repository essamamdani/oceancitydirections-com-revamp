"use client";
  
import React from "react";
import Link from 'next/link';
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

const Banner = () => {
  return (
    <>
      <section 
        className='banner-wrapper-area'
        style={{
          backgroundImage: `url(/images/main-banner-bg3.jpg)`,
        }}
      >
        <div className='container'>
          <div className='banner-wrapper-content'>
            <h1 className='banner-three-heading'>
              <Swiper
                autoplay={{
                  delay: 5000,
                  pauseOnMouseEnter: true,
                }}
                modules={[Autoplay]}
              >
                <SwiperSlide>
                  Find Nearby <span className="color-0ec6c6">Hotels</span>
                </SwiperSlide>

                <SwiperSlide>
                  Find Nearby <span className="color-0ec6c6">Restaurants</span>
                </SwiperSlide>

                <SwiperSlide>
                  Find Nearby <span className="color-0ec6c6">Beauty</span>
                </SwiperSlide>

                <SwiperSlide>
                  Find Nearby <span className="color-0ec6c6">Fitness</span>
                </SwiperSlide>
                
                <SwiperSlide>
                  Find Nearby <span className="color-0ec6c6">Shopping</span>
                </SwiperSlide>
              </Swiper>
            </h1>

            <p>Expolore top-rated attractions, activities and more...</p>
            
            <form>
              <div className='row m-0 align-items-center'>
                <div className='col-lg-4 col-md-12 p-0'>
                  <div className='form-group'>
                    <label>
                      <i className='flaticon-search'></i>
                    </label>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='What are you looking for?'
                    />
                  </div>
                </div>

                <div className='col-lg-3 col-md-6 p-0'>
                  <div className='form-group'>
                    <label>
                      <i className='flaticon-pin'></i>
                    </label>
                    <input
                      type='text'
                      className='form-control'
                      placeholder='Location'
                    />
                  </div>
                </div>

                <div className='col-lg-3 col-md-6 p-0'>
                  <div className='form-group category-select banner-three-select-custom'>
                    <label className='category-icon'>
                      <i className='flaticon-category'></i>
                    </label>
                    <select className='banner-form-select-two'>
                      <option>All Categories</option>
                      <option>Restaurants</option>
                      <option>Events</option>
                      <option>Clothing</option>
                      <option>Bank</option>
                      <option>Fitness</option>
                      <option>Bookstore</option>
                      <option>Shopping</option>
                      <option>Hotels</option>
                      <option>Hospitals</option>
                      <option>Culture</option>
                      <option>Beauty</option>
                    </select>
                  </div>
                </div>

                <div className='col-lg-2 col-md-12 p-0'>
                  <div className='submit-btn'>
                    <button type='submit'>Search Now</button>
                  </div>
                </div>
              </div>
            </form>
            
            <ul className='popular-search-list'>
              <li>Popular:</li>
              <li>
                <Link href='/grid-listings-with-map'>
                  Restaurants
                </Link>
              </li>
              <li>
                <Link href='/grid-listings-with-map'>
                  Events
                </Link>
              </li>
              <li>
                <Link href='/grid-listings-with-map'>
                  Clothing
                </Link>
              </li>
              <li>
                <Link href='/grid-listings-with-map'>
                  Bank
                </Link>
              </li>
              <li>
                <Link href='/grid-listings-with-map'>
                  Fitness
                </Link>
              </li>
              <li>
                <Link href='/grid-listings-with-map'>
                  Bookstore
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
};

export default Banner;

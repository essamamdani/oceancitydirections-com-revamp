"use client";
  
import React from "react";
import Link from "next/link";
import { GoogleMapsEmbed } from '@next/third-parties/google'

const PageHeader = () => {
  return (
    <>
      <div className="page-title-bg map-home-area">
        <div id="main-full-map" className="full-width-map">
          <GoogleMapsEmbed
            apiKey={process.env.NEXT_PUBLIC_MAP_API}
            height="100%"
            width="100%"
            mode="place"
            loading="lazy"
            zoom={14}
            q={"121 King St, Melbourne VIC 3000, Australia"}
          />
        </div>
        
        <form>
          <div className="row m-0 align-items-center">
            <div className="col-lg-4 col-md-12 p-0">
              <div className="form-group">
                <label>
                  <i className="flaticon-search"></i>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="What are you looking for?"
                />
              </div>
            </div>

            <div className="col-lg-3 col-md-6 p-0">
              <div className="form-group">
                <label>
                  <i className="flaticon-pin"></i>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Location"
                />
              </div>
            </div>

            <div className="col-lg-3 col-md-6 p-0">
              <div className="form-group category-select pagebanner-select-custom">
                <label className="category-icon">
                  <i className="flaticon-category"></i>
                </label>
                <select className="banner-form-select-popularplacefilter">
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

            <div className="col-lg-2 col-md-12 p-0">
              <div className="submit-btn">
                <button type="submit">Search Now</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default PageHeader;

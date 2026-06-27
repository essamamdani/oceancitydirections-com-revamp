"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

const Destinations = ({ titleTwo }) => {
  // Explicit and consistent class assignment
  const colClass = "col-lg-3 col-sm-12 col-md-12";

  return (
    <section className="destinations-area pt-100">
      <div className="container">
        {titleTwo && (
          <div className="section-title text-left">
            <h2>Explore Destinations</h2>
            <Link href="#" className="link-btn">
              Show All <i className="flaticon-right-chevron"></i>
            </Link>
          </div>
        )}

        <div className="row">
          {/* Use the consistent colClass */}
          <div className={colClass}>
            <div className="single-destinations-box color-box-shadow">
              <Image
                src="/images/destinations/destinations10.jpg"
                alt="image"
                width={385}
                height={360}
              />
              <div className="country">JAPAN</div>
              <div className="content">
                <h3>Osaka</h3>
                <span>30 Places</span>
              </div>
              <Link href="/grid-listings-with-map" className="link-btn" aria-label="View details"></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Destinations;
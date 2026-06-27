"use client";

import React from "react";
import Image from "next/image";

const BusinessArea = () => {
  return (
    <>
      <section className="claim-your-business-area bg-f9f9f9 ptb-100">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-12">
              <div className="claim-your-business-content">
                <h2>Claim Your Business Listing for FREE!</h2>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing, sed do
                  eiusmod tempor.
                </p>
                <form>
                  <div className="row">
                    <div className="col-lg-12 col-md-6 col-sm-6">
                      <div className="form-group">
                        <label>Your Full Name</label>
                        <input
                          type="text"
                          placeholder="Enter your name"
                          className="form-control"
                        />
                      </div>
                    </div>

                    <div className="col-lg-12 col-md-6 col-sm-6">
                      <div className="form-group">
                        <label>Your Email Adress</label>
                        <input
                          type="email"
                          placeholder="Enter your email"
                          className="form-control"
                        />
                      </div>
                    </div>

                    <div className="col-lg-12 col-md-6 col-sm-6">
                      <div className="form-group">
                        <label>Your Phone Number</label>
                        <input
                          type="text"
                          placeholder="Enter your phone number"
                          className="form-control"
                        />
                      </div>
                    </div>

                    <div className="col-lg-12 col-md-6 col-sm-6">
                      <div className="form-group">
                        <label>Your Business Name</label>
                        <input
                          type="text"
                          placeholder="Enter your busines name"
                          className="form-control"
                        />
                      </div>
                    </div>

                    <div className="col-lg-12 col-md-12 col-sm-12">
                      <button type="submit" className="default-btn">
                        Submit Now
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <div className="col-lg-6 col-md-12">
              <div className="claim-your-business-image text-center">
                <Image
                  src="/images/claim-your-business.png"
                  alt="image"
                  width={605}
                  height={625}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BusinessArea;

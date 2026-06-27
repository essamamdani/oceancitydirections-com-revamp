"use client";

import React from "react";
import Image from "next/image";

const Sidebar = () => {
  return (
    <>
      <div className="author-sidebar">
        <div className="user-profile">
          <div className="d-flex align-items-center">
            <Image
              src="/images/user3.jpg"
              alt="image"
              width={300}
              height={300}
            />

            <div className="title">
              <h4>James Andy</h4>
              <span className="sub-title">Own Company</span>
              <div className="rating d-flex align-items-center">
                <span className="bx bxs-star checked"></span>
                <span className="bx bxs-star checked"></span>
                <span className="bx bxs-star checked"></span>
                <span className="bx bxs-star checked"></span>
                <span className="bx bxs-star checked"></span>
                <span className="rating-count">(5 reviews)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="user-contact-info">
          <h3>Contact</h3>

          <ul className="user-contact">
            <li>
              <a href="tel:+44457895789">
                <i className="bx bx-phone-call"></i> (+44) - 45789 - 5789
              </a>
            </li>
            <li>
              <a href="mailto:hello@jamesandy.com">
                <i className="bx bx-envelope"></i> hello@jamesandy.com
              </a>
            </li>
          </ul>

          <ul className="social-profiles">
            <li>
              <a
                href="https://www.facebook.com/"
                className="facebook"
                target="_blank"
              >
                <i className="bx bxl-facebook"></i> Facebook
              </a>
            </li>
            <li>
              <a
                href="https://www.twitter.com/"
                className="twitter"
                target="_blank"
              >
                <i className="bx bxl-twitter"></i> Twitter
              </a>
            </li>
          </ul>

          <form>
            <div className="row">
              <div className="col-lg-12 col-md-6">
                <div className="form-group">
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    id="name"
                    required
                    placeholder="Your name"
                  />
                </div>
              </div>

              <div className="col-lg-12 col-md-6">
                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    id="email"
                    required
                    placeholder="Your email address"
                  />
                </div>
              </div>

              <div className="col-lg-12 col-md-12">
                <div className="form-group">
                  <input
                    type="text"
                    name="phone_number"
                    className="form-control"
                    id="phone_number"
                    required
                    placeholder="Your phone number"
                  />
                </div>
              </div>

              <div className="col-lg-12 col-md-12">
                <div className="form-group">
                  <textarea
                    name="message"
                    id="message"
                    className="form-control"
                    cols="30"
                    rows="6"
                    required
                    placeholder="Write your message..."
                  ></textarea>
                </div>
              </div>

              <div className="col-lg-12 col-md-12">
                <button type="submit" className="default-btn">
                  Send Message
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

const VisitorReviews = () => {
  return (
    <>
      <div className="visitor-reviews-box">
        <h3>Visitor Reviews</h3>

        <div className="user-review">
          <Image
            src="/images/user4.jpg"
            className="user"
            alt="image"
            width={300}
            height={300}
          />
          <div className="review-rating">
            <div className="review-stars">
              <i className="bx bxs-star"></i>
              <i className="bx bxs-star"></i>
              <i className="bx bxs-star"></i>
              <i className="bx bxs-star"></i>
              <i className="bx bxs-star"></i>
            </div>
            <span className="d-inline-block">
              James Anderson{" "}
              <span>
                on <Link href="#">Farmis Hotel</Link>
              </span>
            </span>
          </div>
          <span className="date">
            <i className="bx bx-calendar"></i> 20 June 2020
          </span>
          <p>
            Very well built theme, could be happier with it. Can wait for future
            updates to see what else they add in.
          </p>

          <div className="review-image">
            <div className="row">
              <div className="col-lg-3 col-md-3 col-sm-4 col-6">
                <Image
                  src="/images/gallery/gallery1.jpg"
                  alt="image"
                  width={750}
                  height={500}
                />
              </div>
              <div className="col-lg-3 col-md-3 col-sm-4 col-6">
                <Image
                  src="/images/gallery/gallery2.jpg"
                  alt="image"
                  width={750}
                  height={500}
                />
              </div>
              <div className="col-lg-3 col-md-3 col-sm-4 col-6">
                <Image
                  src="/images/gallery/gallery3.jpg"
                  alt="image"
                  width={750}
                  height={500}
                />
              </div>
            </div>
          </div>

          <div className="btn-box">
            <Link href="#" className="default-btn">
              <i className="bx bx-reply"></i> Reply
            </Link>
            <button type="button" className="default-btn danger ml-3">
              <i className="bx bx-trash"></i> Delete
            </button>
          </div>
        </div>

        <div className="user-review">
          <Image
            src="/images/user2.jpg"
            className="user"
            alt="image"
            width={300}
            height={300}
          />
          <div className="review-rating">
            <div className="review-stars">
              <i className="bx bxs-star"></i>
              <i className="bx bxs-star"></i>
              <i className="bx bxs-star"></i>
              <i className="bx bxs-star"></i>
              <i className="bx bxs-star-half"></i>
            </div>
            <span className="d-inline-block">
              Sarah Taylor{" "}
              <span>
                on <Link href="#">Shopping Complex</Link>
              </span>
            </span>
          </div>
          <span className="date">
            <i className="bx bx-calendar"></i> 19 June 2020
          </span>
          <p>
            Very well built theme, couldn be happier with it. Can wait for
            future updates to see what else they add in.
          </p>
          <div className="review-image">
            <div className="row">
              <div className="col-lg-3 col-md-3 col-sm-4 col-6">
                <Image
                  src="/images/gallery/gallery1.jpg"
                  alt="image"
                  width={750}
                  height={500}
                />
              </div>
            </div>
          </div>
          <div className="btn-box">
            <Link href="#" className="default-btn">
              <i className="bx bx-reply"></i> Reply
            </Link>
            <button type="submit" className="default-btn danger ml-3">
              <i className="bx bx-trash"></i> Delete
            </button>
          </div>
        </div>

        <div className="user-review">
          <Image
            src="/images/user3.jpg"
            className="user"
            alt="image"
            width={300}
            height={300}
          />
          <div className="review-rating">
            <div className="review-stars">
              <i className="bx bxs-star"></i>
              <i className="bx bxs-star"></i>
              <i className="bx bxs-star"></i>
              <i className="bx bxs-star"></i>
              <i className="bx bx-star"></i>
            </div>
            <span className="d-inline-block">
              David Warner{" "}
              <span>
                on <Link href="#">Gym Training</Link>
              </span>
            </span>
          </div>
          <span className="date">
            <i className="bx bx-calendar"></i> 18 June 2020
          </span>
          <p>
            Very well built theme, couldn be happier with it. Can wait for
            future updates to see what else they add in.
          </p>
          <div className="btn-box">
            <Link href="#" className="default-btn">
              <i className="bx bx-reply"></i> Reply
            </Link>
            <button type="button" className="default-btn danger ml-3">
              <i className="bx bx-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VisitorReviews;

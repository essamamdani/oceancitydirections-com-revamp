"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

const ProductList = () => {
  return (
    <>
      <div className="products-area ptb-100">
        <div className="container">
          <div className="miran-grid-sorting row align-items-center">
            <div className="col-lg-6 col-md-6 result-count">
              <p>
                We found <span className="count">6</span> products available for
                you
              </p>
            </div>

            <div className="col-lg-6 col-md-6 ordering">
              <div className="select-box">
                <label>Sort By:</label>
                <select className="shop-select">
                  <option>Default</option>
                  <option>Popularity</option>
                  <option>Latest</option>
                  <option>Price: low to high</option>
                  <option>Price: high to low</option>
                </select>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-4 col-md-6 col-sm-6">
              <div className="single-products-box">
                <div className="products-image">
                  <Link href="/products/details">
                    <Image
                      src="/images/products/products-img1.jpg"
                      className="main-image"
                      alt="image"
                      width={670}
                      height={800}
                    />
                  </Link>
                </div>

                <div className="products-content">
                  <h3>
                    <Link href="/products/details">Note Book Mockup</Link>
                  </h3>
                  <div className="price">
                    <span className="old-price me-2">$321</span>
                    <span className="new-price">$250</span>
                  </div>
                  <button type="button" className="add-to-cart">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 col-sm-6">
              <div className="single-products-box">
                <div className="products-image">
                  <Link href="/products/details">
                    <Image
                      src="/images/products/products-img2.jpg"
                      className="main-image"
                      alt="image"
                      width={670}
                      height={800}
                    />
                  </Link>
                  <div className="sale-tag">Sale!</div>
                </div>

                <div className="products-content">
                  <h3>
                    <Link href="/products/details">Motivational Book Cover</Link>
                  </h3>
                  <div className="price">
                    <span className="old-price me-2">$210</span>
                    <span className="new-price">$200</span>
                  </div>
                  <button type="button" className="add-to-cart">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 col-sm-6">
              <div className="single-products-box">
                <div className="products-image">
                  <Link href="/products/details">
                    <Image
                      src="/images/products/products-img3.jpg"
                      className="main-image"
                      alt="image"
                      width={670}
                      height={800}
                    />
                  </Link>
                </div>

                <div className="products-content">
                  <h3>
                    <Link href="/products/details">Book Cover Softcover</Link>
                  </h3>
                  <div className="price">
                    <span className="old-price me-2">$210</span>
                    <span className="new-price">$200</span>
                  </div>
                  <button type="button" className="add-to-cart">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 col-sm-6">
              <div className="single-products-box">
                <div className="products-image">
                  <Link href="/products/details">
                    <Image
                      src="/images/products/products-img4.jpg"
                      className="main-image"
                      alt="image"
                      width={670}
                      height={800}
                    />
                  </Link>
                </div>

                <div className="products-content">
                  <h3>
                    <Link href="/products/details">Stop and Take a Second</Link>
                  </h3>
                  <div className="price">
                    <span className="new-price">$150</span>
                  </div>
                  <button type="button" className="add-to-cart">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 col-sm-6">
              <div className="single-products-box">
                <div className="products-image">
                  <Link href="/products/details">
                    <Image
                      src="/images/products/products-img5.jpg"
                      className="main-image"
                      alt="image"
                      width={670}
                      height={800}
                    />
                  </Link>
                </div>

                <div className="products-content">
                  <h3>
                    <Link href="/products/details">Real Life Fairytale</Link>
                  </h3>
                  <div className="price">
                    <span className="new-price">$240</span>
                  </div>
                  <button type="button" className="add-to-cart">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 col-sm-6">
              <div className="single-products-box">
                <div className="products-image">
                  <Link href="/products/details">
                    <Image
                      src="/images/products/products-img6.jpg"
                      className="main-image"
                      alt="image"
                      width={670}
                      height={800}
                    />
                  </Link>
                  <div className="new-tag">New!</div>
                </div>

                <div className="products-content">
                  <h3>
                    <Link href="/products/details">Running From Me</Link>
                  </h3>
                  <div className="price">
                    <span className="old-price me-2">$150</span>
                    <span className="new-price">$100</span>
                  </div>
                  <button type="button" className="add-to-cart">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>

            <div className="col-lg-12 col-md-12 col-sm-12">
              <div className="pagination-area text-center">
                <a href="#" className="prev page-numbers">
                  <i className="bx bx-chevrons-left"></i>
                </a>
                <span className="page-numbers current" aria-current="page">
                  1
                </span>
                <a href="#" className="page-numbers">
                  2
                </a>
                <a href="#" className="page-numbers">
                  3
                </a>
                <a href="#" className="page-numbers">
                  4
                </a>
                <a href="#" className="next page-numbers">
                  <i className="bx bx-chevrons-right"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductList;

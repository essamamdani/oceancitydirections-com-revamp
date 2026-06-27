"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

const BlogPostGrid2 = () => {
  return (
    <>
      <div className="blog-area bg-f9f9f9 ptb-100">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 col-md-6">
              <div className="single-blog-post">
                <div className="post-image">
                  <Link href="/blog/details/" className="d-block">
                    <Image
                      src="/images/blog/blog4.jpg"
                      alt="image"
                      width={780}
                      height={500}
                    />
                  </Link>
                </div>

                <div className="post-content">
                  <ul className="post-meta d-flex align-items-center">
                    <li>
                      <div className="d-flex align-items-center">
                        <Image
                          src="/images/user1.jpg"
                          alt="image"
                          width={300}
                          height={300}
                        />
                        <span>
                          <Link href="#">Taylor</Link>
                        </span>
                      </div>
                    </li>
                    <li>
                      <i className="flaticon-calendar"></i> Aug 7, 2020
                    </li>
                  </ul>
                  <h3>
                    <Link href="/blog/details/">
                      10 Types of Social Proof & What Makes Them Effective
                    </Link>
                  </h3>
                  <Link href="/blog/details/" className="link-btn">
                    <i className="flaticon-right-arrow"></i>
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-lg-6 col-md-6">
              <div className="single-blog-post">
                <div className="post-image">
                  <Link href="/blog/details/" className="d-block">
                    <Image
                      src="/images/blog/blog5.jpg"
                      alt="image"
                      width={780}
                      height={500}
                    />
                  </Link>
                </div>

                <div className="post-content">
                  <ul className="post-meta d-flex align-items-center">
                    <li>
                      <div className="d-flex align-items-center">
                        <Image
                          src="/images/user2.jpg"
                          alt="image"
                          width={300}
                          height={300}
                        />
                        <span>
                          <Link href="#">Sarah</Link>
                        </span>
                      </div>
                    </li>
                    <li>
                      <i className="flaticon-calendar"></i> Aug 6, 2020
                    </li>
                  </ul>
                  <h3>
                    <Link href="/blog/details/">
                      Tech Products That Make It Easier to Stay Home
                    </Link>
                  </h3>
                  <Link href="/blog/details/" className="link-btn">
                    <i className="flaticon-right-arrow"></i>
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-lg-6 col-md-6">
              <div className="single-blog-post">
                <div className="post-image">
                  <Link href="/blog/details/" className="d-block">
                    <Image
                      src="/images/blog/blog6.jpg"
                      alt="image"
                      width={780}
                      height={500}
                    />
                  </Link>
                </div>

                <div className="post-content">
                  <ul className="post-meta d-flex align-items-center">
                    <li>
                      <div className="d-flex align-items-center">
                        <Image
                          src="/images/user3.jpg"
                          alt="image"
                          width={300}
                          height={300}
                        />
                        <span>
                          <Link href="#">Andy</Link>
                        </span>
                      </div>
                    </li>
                    <li>
                      <i className="flaticon-calendar"></i> Aug 5, 2020
                    </li>
                  </ul>
                  <h3>
                    <Link href="/blog/details/">
                      13 Feel-Good Restaurant Stories from the Pandemic
                    </Link>
                  </h3>
                  <Link href="/blog/details/" className="link-btn">
                    <i className="flaticon-right-arrow"></i>
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-lg-6 col-md-6">
              <div className="single-blog-post">
                <div className="post-image">
                  <Link href="/blog/details/" className="d-block">
                    <Image
                      src="/images/blog/blog7.jpg"
                      alt="image"
                      width={780}
                      height={500}
                    />
                  </Link>
                </div>

                <div className="post-content">
                  <ul className="post-meta d-flex align-items-center">
                    <li>
                      <div className="d-flex align-items-center">
                        <Image
                          src="/images/user1.jpg"
                          alt="image"
                          width={300}
                          height={300}
                        />
                        <span>
                          <Link href="#">Taylor</Link>
                        </span>
                      </div>
                    </li>
                    <li>
                      <i className="flaticon-calendar"></i> Aug 4, 2020
                    </li>
                  </ul>
                  <h3>
                    <Link href="/blog/details/">
                      5 Ways to Convert Customers Into Advocates Brand
                    </Link>
                  </h3>
                  <Link href="/blog/details/" className="link-btn">
                    <i className="flaticon-right-arrow"></i>
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-lg-6 col-md-6">
              <div className="single-blog-post">
                <div className="post-image">
                  <Link href="/blog/details/" className="d-block">
                    <Image
                      src="/images/blog/blog8.jpg"
                      alt="image"
                      width={780}
                      height={500}
                    />
                  </Link>
                </div>

                <div className="post-content">
                  <ul className="post-meta d-flex align-items-center">
                    <li>
                      <div className="d-flex align-items-center">
                        <Image
                          src="/images/user2.jpg"
                          alt="image"
                          width={300}
                          height={300}
                        />
                        <span>
                          <Link href="#">Sarah</Link>
                        </span>
                      </div>
                    </li>
                    <li>
                      <i className="flaticon-calendar"></i> Aug 3, 2020
                    </li>
                  </ul>
                  <h3>
                    <Link href="/blog/details/">
                      Indice Tips To-Go: Getting Started With Analytics
                    </Link>
                  </h3>
                  <Link href="/blog/details/" className="link-btn">
                    <i className="flaticon-right-arrow"></i>
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-lg-6 col-md-6">
              <div className="single-blog-post">
                <div className="post-image">
                  <Link href="/blog/details/" className="d-block">
                    <Image
                      src="/images/blog/blog9.jpg"
                      alt="image"
                      width={780}
                      height={500}
                    />
                  </Link>
                </div>

                <div className="post-content">
                  <ul className="post-meta d-flex align-items-center">
                    <li>
                      <div className="d-flex align-items-center">
                        <Image
                          src="/images/user3.jpg"
                          alt="image"
                          width={300}
                          height={300}
                        />
                        <span>
                          <Link href="#">Andy</Link>
                        </span>
                      </div>
                    </li>
                    <li>
                      <i className="flaticon-calendar"></i> Aug 2, 2020
                    </li>
                  </ul>
                  <h3>
                    <Link href="/blog/details/">
                      How to Beat the High Cost of Customer Questions
                    </Link>
                  </h3>
                  <Link href="/blog/details/" className="link-btn">
                    <i className="flaticon-right-arrow"></i>
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-lg-12 col-md-12">
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

export default BlogPostGrid2;

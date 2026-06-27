"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

const Blog = () => {
  return (
    <>
      <section className="blog-area pt-100 pb-70">
        <div className="container">
          <div className="section-title">
            <h2>Indice Recent News</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis
              ipsum suspendisse ultrices gravida. Risus commodo viverra.
            </p>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-4 col-md-6">
              <div className="single-blog-post without-boxshadow">
                <div className="post-image">
                  <Link href="/blog/details" className="d-block">
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
                    <Link href="/blog/details">
                      10 Types of Social Proof and What Makes Them Effective
                    </Link>
                  </h3>
                  <Link href="/blog/details" className="link-btn">
                    <i className="flaticon-right-arrow"></i>
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="single-blog-post without-boxshadow">
                <div className="post-image">
                  <Link href="/blog/details" className="d-block">
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
                    <Link href="/blog/details">
                      Tech Products That Make It Easier to Stay Home
                    </Link>
                  </h3>
                  <Link href="/blog/details" className="link-btn">
                    <i className="flaticon-right-arrow"></i>
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <div className="single-blog-post without-boxshadow">
                <div className="post-image">
                  <Link href="/blog/details" className="d-block">
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
                    <Link href="/blog/details">
                      13 Feel-Good Restaurant Stories from the Pandemic
                    </Link>
                  </h3>
                  <Link href="/blog/details" className="link-btn">
                    <i className="flaticon-right-arrow"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Blog;

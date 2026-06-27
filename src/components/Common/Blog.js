"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

const Blog = ({ bgColor }) => {
  return (
    <>
      <section className={`blog-area ${bgColor} with-events pt-100 pb-70`}>
        <div className="container">
          <div className="row">
            <div className="col-lg-8 col-md-12">
              <div className="blog-item-list">
                <h2>Indice Recent Activities</h2>

                <div className="row">
                  <div className="col-lg-6 col-md-6">
                    <div className="single-blog-post">
                      <div className="post-image">
                        <Link href="/blog/details" className="d-block">
                          <Image
                            src="/images/blog/blog1.jpg"
                            alt="image"
                            width={780}
                            height={680}
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
                            10 Types of Social Proof and What Makes Them
                            Effective
                          </Link>
                        </h3>
                        <Link href="/blog/details" className="link-btn">
                          <i className="flaticon-right-arrow"></i>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-6 col-md-6">
                    <div className="single-blog-post">
                      <div className="post-image">
                        <Link href="/blog/details" className="d-block">
                          <Image
                            src="/images/blog/blog2.jpg"
                            alt="image"
                            width={780}
                            height={680}
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
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-12">
              <div className="events-item-list">
                <h2>Upcoming Events</h2>

                <div className="single-events-item">
                  <span className="meta">
                    <i className="flaticon-calendar"></i> Thu, Jul 30, 11:30 am
                    - 10:00 pm
                  </span>
                  <h3>
                    <Link href="/events/details">
                      International Agriculture and Technology Summit
                    </Link>
                  </h3>

                  <Link href="/blog/details" className="link-btn">
                    <i className="flaticon-right-arrow"></i>
                  </Link>
                </div>

                <div className="single-events-item">
                  <span className="meta">
                    <i className="flaticon-calendar"></i> Thu, Jul 29, 11:30 am
                    - 10:00 pm
                  </span>
                  <h3>
                    <Link href="/blog/details">
                      Digital Marketing: Customer Engagement & Social Media
                    </Link>
                  </h3>

                  <Link href="/blog/details" className="link-btn">
                    <i className="flaticon-right-arrow"></i>
                  </Link>
                </div>

                <div className="single-events-item">
                  <span className="meta">
                    <i className="flaticon-calendar"></i> Thu, Jul 28, 11:30 am
                    - 10:00 pm
                  </span>
                  <h3>
                    <Link href="/blog/details">
                      Internet of Things Forum Africa Exhibition (IOTFA)
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

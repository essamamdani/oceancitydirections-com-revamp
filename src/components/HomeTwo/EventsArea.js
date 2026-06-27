"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

const EventsArea = () => {
  return (
    <>
      <section className="events-area pt-100 pb-70">
        <div className="container">
          <div className="section-title">
            <h2>Upcoming Events</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis
              ipsum suspendisse ultrices gravida. Risus commodo viverra.
            </p>
          </div>

          <div className="row">
            <div className="col-lg-6 col-md-12">
              <div className="events-box">
                <Image
                  src="/images/events/events-big.jpg"
                  alt="image"
                  width={595}
                  height={450}
                />
                <div className="content">
                  <h3>Global Robotics Summit & Festival</h3>
                  <span className="meta">
                    <i className="flaticon-calendar"></i> Thu, Jul 30, 11:30 am
                    - 10:00 pm
                  </span>
                </div>
                <Link href="/events/details" className="link-btn" aria-label="View details"></Link>
              </div>
            </div>

            <div className="col-lg-6 col-md-12">
              <div className="events-item-list">
                <div className="single-events-box">
                  <div className="row m-0">
                    <div className="col-lg-4 col-md-4 p-0">
                      <div
                        className="image"
                        style={{
                          backgroundImage: `url(/images/events/events1.jpg)`,
                        }}
                      >
                        <Image
                          src="/images/events/events1.jpg"
                          alt="image"
                          width={610}
                          height={540}
                        />
                        <Link href="/events/details" className="link-btn" aria-label="View details"></Link>
                      </div>
                    </div>

                    <div className="col-lg-8 col-md-8 p-0">
                      <div className="content">
                        <span className="meta">
                          <i className="flaticon-calendar"></i> Thu, Jul 30,
                          11:30 am - 10:00 pm
                        </span>
                        <h3>
                          <Link href="/events/details">
                            Internet of Things Forum Africa Exhibition (IOTFA)
                          </Link>
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="single-events-box">
                  <div className="row m-0">
                    <div className="col-lg-4 col-md-4 p-0">
                      <div
                        className="image"
                        style={{
                          backgroundImage: `url(/images/events/events2.jpg)`,
                        }}
                      >
                        <Image
                          src="/images/events/events2.jpg"
                          alt="image"
                          width={610}
                          height={540}
                        />
                        <Link href="/events/details" className="link-btn" aria-label="View details"></Link>
                      </div>
                    </div>

                    <div className="col-lg-8 col-md-8 p-0">
                      <div className="content">
                        <span className="meta">
                          <i className="flaticon-calendar"></i> Thu, Jul 30,
                          11:30 am - 10:00 pm
                        </span>
                        <h3>
                          <Link href="/events/details">
                            Digital Marketing: Customer Engagement & Social
                            Media
                          </Link>
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="single-events-box">
                  <div className="row m-0">
                    <div className="col-lg-4 col-md-4 p-0">
                      <div
                        className="image"
                        style={{
                          backgroundImage: `url(/images/events/events3.jpg)`,
                        }}
                      >
                        <Image
                          src="/images/events/events3.jpg"
                          alt="image"
                          width={610}
                          height={540}
                        />
                        <Link href="/events/details" className="link-btn" aria-label="View details"></Link>
                      </div>
                    </div>

                    <div className="col-lg-8 col-md-8 p-0">
                      <div className="content">
                        <span className="meta">
                          <i className="flaticon-calendar"></i> Thu, Jul 30,
                          11:30 am - 10:00 pm
                        </span>
                        <h3>
                          <Link href="/events/details">
                            International Agriculture and Technology Summit
                          </Link>
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default EventsArea;

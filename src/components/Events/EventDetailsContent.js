"use client";

import React from "react";
import Image from "next/image";
import { GoogleMapsEmbed } from '@next/third-parties/google'
import Countdown from "./Countdown";
import EventsInfo from "./EventsInfo";

const EventDetailsContent = () => {
  return (
    <>
      <div className="events-details-area bg-f9f9f9 ptb-100">
        <div className="container">
          <div className="events-details-image">
            <Image
              src="/images/events/events-details.jpg"
              alt="image"
              width={1200}
              height={450}
            />

            {/* Countdown */}
            <Countdown />
          </div>

          <div className="row">
            <div className="col-lg-8 col-md-12">
              <div className="events-details-header">
                <ul>
                  <li>
                    <i className="bx bx-calendar"></i>Dec 1, 2020 - Dec 31, 2020
                  </li>
                  <li>
                    <i className="bx bx-map"></i>Rome, Italy
                  </li>
                  <li>
                    <i className="bx bx-time"></i>12:00 AM - 12:00 PM
                  </li>
                </ul>
              </div>

              <div className="events-details-location">
                <div id="map">
                  <GoogleMapsEmbed
                    apiKey={process.env.NEXT_PUBLIC_MAP_API}
                    height="300px"
                    width="100%"
                    mode="place"
                    loading="lazy"
                    zoom={12}
                    q={"Colosseum, Rome, Italy"}
                  />
                </div>
              </div>

              <div className="events-details-desc">
                <h3>About The Event</h3>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Quis ipsum suspendisse ultrices gravida. Risus commodo viverra
                  maecenas accumsan lacus vel facilisis.
                </p>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Quis ipsum suspendisse ultrices gravida. Risus commodo viverra
                  maecenas accumsan lacus vel facilisis.
                </p>
                <h3>Where the event?</h3>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Quis ipsum suspendisse ultrices gravida. Risus commodo viverra
                  maecenas accumsan lacus vel facilisis.
                </p>
                <h3>Who this event is for?</h3>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Quis ipsum suspendisse ultrices gravida. Risus commodo viverra
                  maecenas accumsan lacus vel facilisis.
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-12">
              <EventsInfo />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventDetailsContent;

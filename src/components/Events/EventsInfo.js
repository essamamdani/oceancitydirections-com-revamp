import React from "react";
import Image from "next/image";

const EventsInfo = () => {
  return (
    <>
      <div className="events-details-info">
        <ul className="info">
          <li className="price">
            <div className="d-flex justify-content-between align-items-center">
              <span>Cost</span>
              $149
            </div>
          </li>
          <li>
            <div className="d-flex justify-content-between align-items-center">
              <span>Total Slot</span>
              1500
            </div>
          </li>
          <li>
            <div className="d-flex justify-content-between align-items-center">
              <span>Booked Slot</span>
              350
            </div>
          </li>
          <li>
            <div className="d-flex justify-content-between align-items-center">
              <span>Pay With</span>
              <div className="payment-method">
                <Image
                  src="/images/payment/img1.png"
                  className="shadow"
                  alt="image"
                  width={40}
                  height={28}
                />
                <Image
                  src="/images/payment/img2.png"
                  className="shadow"
                  alt="image"
                  width={40}
                  height={28}
                />
                <Image
                  src="/images/payment/img3.png"
                  className="shadow"
                  alt="image"
                  width={40}
                  height={28}
                />
                <Image
                  src="/images/payment/img4.png"
                  className="shadow"
                  alt="image"
                  width={40}
                  height={28}
                />
              </div>
            </div>
          </li>
        </ul>

        <div className="btn-box">
          <button type="button" className="default-btn w-100">
            <i className="flaticon-user"></i>Book Now<span></span>
          </button>
          <p>
            You must <a href="#">login</a> before register event.
          </p>
        </div>

        <div className="events-share">
          <div className="share-info">
            <span>
              Share This Course <i className="flaticon-share"></i>
            </span>

            <ul className="social-link">
              <li>
                <a
                  href="https://www.facebook.com/"
                  className="d-block"
                  target="_blank"
                >
                  <i className="bx bxl-facebook"></i>
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/"
                  className="d-block"
                  target="_blank"
                >
                  <i className="bx bxl-twitter"></i>
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/"
                  className="d-block"
                  target="_blank"
                >
                  <i className="bx bxl-instagram"></i>
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/"
                  className="d-block"
                  target="_blank"
                >
                  <i className="bx bxl-linkedin"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventsInfo;

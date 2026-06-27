"use client";

import React from "react";
import Image from "next/image";

const ProfileDetailsForm = () => {
  return (
    <>
      <div className="my-profile-box">
        <h3>Profile Details</h3>

        <form>
          <div className="row">
            <div className="col-lg-12 col-md-12">
              <div className="form-group profile-box">
                <Image
                  src="/images/user1.jpg"
                  alt="image"
                  width={300}
                  height={300}
                />
                <div className="file-upload">
                  <input
                    type="file"
                    name="file"
                    id="file"
                    className="inputfile"
                  />
                  <label htmlFor="file">
                    <i className="bx bx-upload"></i> Upload Photo
                  </label>
                </div>
              </div>
            </div>

            <div className="col-lg-12 col-md-12">
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  className="form-control"
                  defaultValue="Andy Smith"
                />
              </div>
            </div>

            <div className="col-xl-6 col-lg-12 col-md-12">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  defaultValue="hello@andysmith.com"
                />
              </div>
            </div>

            <div className="col-xl-6 col-lg-12 col-md-12">
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  className="form-control"
                  defaultValue="+88 (123) 123456"
                />
              </div>
            </div>

            <div className="col-xl-6 col-lg-12 col-md-12">
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  className="form-control"
                  defaultValue="Wonder Street, USA, New York"
                />
              </div>
            </div>

            <div className="col-xl-6 col-lg-12 col-md-12">
              <div className="form-group">
                <label>Website</label>
                <input
                  type="text"
                  className="form-control"
                  defaultValue="EnvyTheme.com"
                />
              </div>
            </div>

            <div className="col-lg-12 col-md-12">
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  cols="30"
                  rows="6"
                  placeholder="Short description about you..."
                  className="form-control"
                ></textarea>
              </div>
            </div>

            <div className="col-xl-6 col-lg-12 col-md-12">
              <div className="form-group">
                <label>Facebook URL</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="https://www.facebook.com/"
                />
              </div>
            </div>

            <div className="col-xl-6 col-lg-12 col-md-12">
              <div className="form-group">
                <label>Twitter URL</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="https://twitter.com/"
                />
              </div>
            </div>

            <div className="col-xl-6 col-lg-12 col-md-12">
              <div className="form-group">
                <label>Linkedin URL</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="https://www.linkedin.com/"
                />
              </div>
            </div>

            <div className="col-xl-6 col-lg-12 col-md-12">
              <div className="form-group">
                <label>Instagram URL</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="https://instagram.com/"
                />
              </div>
            </div>

            <div className="col-lg-12 col-md-12">
              <div className="form-group">
                <button type="submit">Save Change</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default ProfileDetailsForm;

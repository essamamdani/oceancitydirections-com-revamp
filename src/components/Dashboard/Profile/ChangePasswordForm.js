"use client";
  
import React from "react"; 

const ChangePasswordForm = () => {
  return (
    <>
      <div className="my-profile-box">
        <h3>Change Password</h3>

        <form>
          <div className="row">
            <div className="col-lg-12 col-md-12">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  defaultValue="123456"
                />
              </div>
            </div>

            <div className="col-lg-12 col-md-12">
              <div className="form-group">
                <label>New Password</label>
                <input type="password" className="form-control" />
              </div>
            </div>

            <div className="col-lg-12 col-md-12">
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" className="form-control" />
              </div>
            </div>

            <div className="col-lg-12 col-md-12">
              <div className="form-group">
                <button type="submit">Change Password</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default ChangePasswordForm;

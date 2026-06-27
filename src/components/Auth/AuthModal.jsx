"use client";
import React from "react";
import AuthForm from "./AuthForm";

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  return (
    <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Authentication</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <AuthForm
              initialMode="login"
              onSuccess={(user) => {
                if (onSuccess) onSuccess(user);
                onClose();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;


"use client";
import React, { useState, useEffect } from "react";

const RoleSelectionModal = ({ isOpen, onClose, onContinue, initialRole }) => {
  const [selectedRole, setSelectedRole] = useState("consumer");

  useEffect(() => {
    if (initialRole) {
      setSelectedRole(initialRole);
    }
  }, [initialRole]);

  if (!isOpen) return null;

  const roles = [
    {
      id: "consumer",
      title: "Home Buyer or Seller and Business Search",
      description: "Search for properties & see the nearby local business",
      icon: "bx bx-home-alt"
    },
    {
      id: "claimer",
      title: "Business Owner",
      description: "Claim or Submit a New Business Listing. (Registration includes access to upload a video to your Business Listing Page)",
      icon: "bx bx-restaurant"
    },
    {
      id: "media_pro",
      title: "Media Professional (Coming Soon)",
      description: "Videographers & Content Creators. Also Media Entities that Claim or Submit Business Listings on behalf of another business owner. (Registration includes access to a Pro Video Channel at VideoHomes.com)",
      icon: "bx bx-camera-movie"
    }
  ];

  return (
    <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1055 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
           <div className="modal-header border-0 pb-0">
             <button type="button" className="btn-close" onClick={onClose}></button>
           </div>
          <div className="modal-body text-center pt-0 pb-5 px-5">
            <h3 className="mb-2">Join as</h3>
            <p className="text-muted mb-4">What's the Best Match? All have access to Property and Business Search</p>
            
            <div className="d-flex flex-column gap-3">
              {roles.map((role) => (
                <div 
                  key={role.id} 
                  className={`card p-3 text-start cursor-pointer`}
                  style={{ 
                    cursor: 'pointer', 
                    border: selectedRole === role.id ? '2px solid var(--mainColor)' : '1px solid #dee2e6',
                    transition: 'all 0.2s',
                    backgroundColor: selectedRole === role.id ? '#f8f9fa' : 'white'
                  }}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0 me-3">
                      <i className={`${role.icon} fs-1`} style={{ color: selectedRole === role.id ? 'var(--mainColor)' : '#6c757d' }}></i>
                    </div>
                    <div>
                      <h5 className="mb-1" style={{ color: selectedRole === role.id ? 'var(--mainColor)' : 'inherit' }}>{role.title}</h5>
                      <p className="mb-0 text-muted small">{role.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              className="default-btn w-100 mt-4" 
              onClick={() => onContinue(selectedRole)}
            >
              Continue <i className="bx bx-right-arrow-alt"></i>
            </button>
            
            <p className="mt-3 text-muted small">
              Tip: click outside the modal or press Esc to close.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionModal;

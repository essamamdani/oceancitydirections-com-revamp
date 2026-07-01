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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-2xl w-full p-8 relative space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <button 
          type="button" 
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition" 
          onClick={onClose}
          aria-label="Close modal"
        >
          <i className="bx bx-x text-2xl"></i>
        </button>

        <div className="text-center space-y-2">
          <h3 className="text-2xl font-extrabold text-slate-900 font-serif">Join as</h3>
          <p className="text-xs font-semibold text-slate-400">
            What's the Best Match? All have access to Property and Business Search
          </p>
        </div>
        
        <div className="space-y-3">
          {roles.map((role) => (
            <div 
              key={role.id} 
              className={`p-4 rounded-2xl border-2 text-left cursor-pointer transition-all duration-200 flex items-start gap-4 ${
                selectedRole === role.id 
                  ? "border-orange-500 bg-orange-50/10" 
                  : "border-slate-100 hover:border-slate-200 bg-white"
              }`}
              onClick={() => setSelectedRole(role.id)}
            >
              <div className={`p-3 rounded-xl shrink-0 ${selectedRole === role.id ? "bg-orange-100 text-orange-600" : "bg-slate-50 text-slate-400"}`}>
                <i className={`${role.icon} text-2xl`}></i>
              </div>
              <div className="space-y-1">
                <h4 className={`text-sm font-bold ${selectedRole === role.id ? "text-orange-600" : "text-slate-800"}`}>
                  {role.title}
                </h4>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  {role.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <button 
          className="w-full bg-[#08738a] hover:bg-[#075362] text-white rounded-xl py-3.5 font-bold transition text-xs uppercase tracking-wider shadow-md shadow-[#08738a]/20 transform hover:-translate-y-0.5 duration-200 flex items-center justify-center gap-2" 
          onClick={() => onContinue(selectedRole)}
        >
          Continue
          <i className="bx bx-right-arrow-alt text-lg"></i>
        </button>
        
        <p className="text-center text-[10px] text-slate-400 font-semibold">
          Tip: click the X button or press outside to close this selection.
        </p>
      </div>
    </div>
  );
};

export default RoleSelectionModal;

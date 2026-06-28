"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Layouts/Navbar";
import Footer from "@/components/Layouts/Footer";
import AuthForm from "@/components/Auth/AuthForm";
import RoleSelectionModal from "@/components/Auth/RoleSelectionModal";
import { useSearchParams } from "next/navigation";

// Simple function to get user from localStorage
function getUserFromStorage() {
  if (typeof window === 'undefined') return null;
  try {
    // Ensure cookie exists, otherwise invalid state
    if (!document.cookie.includes('auth-token=')) {
      localStorage.removeItem('auth-user');
      localStorage.removeItem('auth-token');
      return null;
    }
    const userStr = localStorage.getItem('auth-user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const urlRole = searchParams.get("role");

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState("consumer");
  const [selectedProfessionSlug, setSelectedProfessionSlug] = useState("local-business");
  const [loading, setLoading] = useState(true);

  const roleToProfessionSlug = {
    consumer: 'local-business',
    claimer: 'local-business',
    media_pro: 'media-pros',
  };

  useEffect(() => {
    // Check if already logged in
    const user = getUserFromStorage();
    if (user) {
      window.location.replace('/dashboard');
    } else {
      setLoading(false);
      // Show profession selector unless role already provided via URL
      if (!urlRole) {
        setShowRoleModal(true);
      }
    }

    if (urlRole && ['consumer', 'claimer', 'media_pro'].includes(urlRole)) {
      setSelectedRole(urlRole);
      setSelectedProfessionSlug(roleToProfessionSlug[urlRole] || 'local-business');
    }
  }, [urlRole]);

  // Safety timeout: always show form after 3 seconds max
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSuccess = () => {
    window.location.replace('/dashboard');
  };

  const handleRoleContinue = (role) => {
    setSelectedRole(role);
    setSelectedProfessionSlug(roleToProfessionSlug[role] || 'local-business');
    setShowRoleModal(false);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="pt-100 pb-100 text-center">
          <div className="container">
            <div className="spinner-border text-primary"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="pt-100 pb-100">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-12">
              <AuthForm initialMode="register" onSuccess={handleSuccess} role={selectedRole} defaultProfessionSlug={selectedProfessionSlug} />
            </div>
          </div>
        </div>
      </div>
      
      <RoleSelectionModal 
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onContinue={handleRoleContinue}
        initialRole={selectedRole}
      />
    </>
  );
}

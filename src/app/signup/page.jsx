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

export default function SignupPage() {
  const searchParams = useSearchParams();
  const urlRole = searchParams.get("role");

  const [showRoleModal, setShowRoleModal] = useState(true);
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
    <div className="min-h-screen bg-gradient-to-br from-[#dfeee9] via-[#fbfaf7] to-[#dfeee9]/30 flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-16 px-4">
        {!showRoleModal && (
          <AuthForm initialMode="register" onSuccess={handleSuccess} role={selectedRole} defaultProfessionSlug={selectedProfessionSlug} />
        )}
      </div>
      
      <RoleSelectionModal 
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onContinue={handleRoleContinue}
        initialRole={selectedRole}
      />
    </div>
  );
}

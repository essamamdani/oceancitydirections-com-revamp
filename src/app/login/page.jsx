"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Layouts/Navbar";
import AuthForm from "@/components/Auth/AuthForm";

function getUserFromStorage() {
  if (typeof window === 'undefined') return null;
  try {
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

export default function LoginPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getUserFromStorage();
    if (user) {
      window.location.replace('/dashboard');
    } else {
      setLoading(false);
    }
  }, []);

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
        <AuthForm initialMode="login" onSuccess={handleSuccess} />
      </div>
    </div>
  );
}

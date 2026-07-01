"use client";
import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

function PasswordForm() {
  const [password, setPassword] = useState("");
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error("Please enter a password");
      return;
    }

    // Set cookie client-side
    document.cookie = `site_password=${encodeURIComponent(password)}; path=/; max-age=604800; SameSite=Lax`;
    
    // Redirect to the original destination
    toast.success("Bypass cookie set! Redirecting...");
    setTimeout(() => {
      window.location.href = next;
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dfeee9] via-[#fbfaf7] to-[#dfeee9]/30 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-2xl p-8 space-y-6 text-center">
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-orange-105 text-orange-600 flex items-center justify-center mx-auto shadow-xs border border-orange-200">
            <i className="bx bx-lock-alt text-3xl"></i>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-serif">Staging Environment</h2>
          <p className="text-xs font-semibold text-slate-400 max-w-sm mx-auto leading-relaxed">
            This site is currently password protected for development. Please enter the site password to view the staging pages.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
            <input
              type="password"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition duration-200 placeholder-slate-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#08738a] hover:bg-[#075362] text-white rounded-xl py-3.5 font-bold transition text-xs uppercase tracking-wider shadow-md shadow-[#08738a]/20 transform hover:-translate-y-0.5 duration-200 flex items-center justify-center gap-2"
          >
            Enter Site
            <i className="bx bx-right-arrow-alt text-lg"></i>
          </button>
        </form>
      </div>
      <Toaster />
    </div>
  );
}

export default function PasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading lock screen...</div>}>
      <PasswordForm />
    </Suspense>
  );
}

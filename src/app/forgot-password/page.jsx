"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Layouts/Navbar";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

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

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = getUserFromStorage();
    if (user) {
      window.location.replace('/dashboard');
    } else {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    
    try {
        const result = await authClient.forgetPassword({
            email,
            redirectTo: "/update-password"
        });
        
        if (result.error) {
            throw new Error(result.error.message || 'Request failed');
        } else {
            toast.success("Check your email for reset instructions");
            router.push("/login");
        }
    } catch (err) {
        toast.error(err.message || "Failed to send reset link");
    } finally {
        setProcessing(false);
    }
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
        <div className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-extrabold text-slate-900 font-serif">Reset Password</h3>
            <p className="text-xs font-semibold text-slate-400">
              Enter your email to receive password reset instructions
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Email address</label>
              <input
                type="email"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition duration-200 placeholder-slate-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#08738a] hover:bg-[#075362] text-white rounded-xl py-3.5 font-bold transition text-xs uppercase tracking-wider shadow-md shadow-[#08738a]/20 transform hover:-translate-y-0.5 duration-200" 
              disabled={processing}
            >
              {processing ? "Processing..." : "Reset Password"}
            </button>
          </form>

          <div className="text-center text-xs font-semibold text-slate-400 border-t border-slate-100 pt-4">
            Remember your password?{" "}
            <button 
              type="button"
              className="text-orange-600 hover:text-orange-700 font-bold ml-1 hover:underline" 
              onClick={() => router.push("/login")}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

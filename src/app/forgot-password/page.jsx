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
    <>
      <Navbar />
      <div className="pt-100 pb-100">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-12">
              <div className="auth-form-container">
                <h3 className="mb-4 text-center">Reset Password</h3>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Email address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your email to reset password"
                    />
                  </div>

                  <button type="submit" className="default-btn w-100" disabled={processing}>
                    {processing ? "Processing..." : "Reset Password"}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <div>
                    Remember your password?{" "}
                    <button 
                      type="button"
                      className="btn btn-link p-0 text-decoration-none" 
                      style={{ color: 'var(--mainColor)', fontWeight: 'bold' }} 
                      onClick={() => router.push("/login")}
                    >
                      Login
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

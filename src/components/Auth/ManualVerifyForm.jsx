"use client";
import React, { useState } from "react";
import toast from 'react-hot-toast';
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";

const ManualVerifyForm = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Better Auth - resend verification email
            const res = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (!res.ok) {
                const error = await res.text();
                throw new Error(error || 'Failed to resend verification');
            }

            toast.success("Verification email sent! Please check your inbox.");
        } catch (err) {
            toast.error(err.message || "Request failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-form-container mt-4 text-start">
            <h5 className="mb-3 text-center">Email Verification</h5>
            <p className="text-center text-muted small mb-4">
                Enter your email to receive a verification link
            </p>
            
            <form onSubmit={handleSubmit}>
                <div className="form-group mb-3">
                    <label>Email Address</label>
                    <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="your@email.com"
                    />
                </div>
                
                <button 
                    type="submit" 
                    className="default-btn w-100"
                    disabled={loading}
                >
                    {loading ? 'Sending...' : 'Resend Verification Email'}
                </button>
            </form>
        </div>
    );
};

export default ManualVerifyForm;

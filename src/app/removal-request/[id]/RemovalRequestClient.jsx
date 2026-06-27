"use client";
import React, { useState } from "react";
import NavbarTwo from "@/components/Layouts/NavbarTwo";
import Footer from "@/components/Layouts/Footer";
import toast from 'react-hot-toast';
import { useRouter } from "next/navigation";

export default function RemovalRequestPage({ business }) {
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        reason: "",
    });

    const formatPhone = (value) => {
        const digits = value.replace(/\D/g, '').slice(0, 10);
        if (digits.length <= 3) return digits;
        if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch("/api/removal-request/public", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    businessId: business.id,
                    ...formData,
                }),
            });

            const result = await response.json();
            if (response.ok) {
                toast.success("Removal request submitted successfully.");
                router.push("/");
            } else {
                toast.error(result.error || "Failed to submit request.");
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("An error occurred.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <NavbarTwo />
            <div className="pt-100 pb-100">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-6 col-md-12">
                            <div className="login-content">
                                <div className="text-center mb-4">
                                    <h2>Request Business Removal</h2>
                                    <p className="text-muted">
                                        Requesting removal for: <strong>{business.title}</strong>
                                        <br />
                                        {business.city}, {business.state}
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="form-group mb-3">
                                        <label className="form-label">Your Name *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            placeholder="Enter your name"
                                        />
                                    </div>

                                    <div className="form-group mb-3">
                                        <label className="form-label">Your Email *</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            placeholder="Enter your email"
                                        />
                                    </div>

                                    <div className="form-group mb-3">
                                        <label className="form-label">Your Phone *</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                                            required
                                            placeholder="(555) 555-5555"
                                            maxLength={14}
                                        />
                                    </div>

                                    <div className="form-group mb-3">
                                        <label className="form-label">Reason for Removal *</label>
                                        <textarea
                                            className="form-control"
                                            rows="4"
                                            value={formData.reason}
                                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                            required
                                            placeholder="Please explain why this business should be removed..."
                                        ></textarea>
                                    </div>

                                    <button type="submit" className="default-btn w-100" disabled={submitting}>
                                        {submitting ? "Submitting..." : "Submit Request"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

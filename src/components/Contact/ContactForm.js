
"use client";
import React, { useState } from "react";
import Image from "next/image";
import { toast, Toaster } from "react-hot-toast";
import Turnstile from "../Common/Turnstile";
import { useSites } from "@/contexts/SitesContext";

const ContactForm = () => {
  const { site } = useSites();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    businessName: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [cfToken, setCfToken] = useState(null);

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cfToken) {
      toast.error("Please complete the security check.");
      return;
    }

    setLoading(true);

    const payload = {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      phone_number: formData.phone,
      select: formData.subject,
      message: `Business Name: ${formData.businessName}\n\n${formData.message}`,
      cf_token: cfToken
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success("Message sent successfully!");
        setFormData({ firstName: "", lastName: "", businessName: "", email: "", phone: "", subject: "", message: "" });
      } else {
        toast.error("Failed to send message. Please try again later.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.");
    }
    setLoading(false);
  };

  return (
    <>
      <Toaster position="top-right" />
      <section className="contact-area pt-5 pb-100">
        <div className="container">
          <div className="section-title">
            <h2>Contact Us Today!</h2>
            <p>We’d love to hear from you. Your email will stay private, and required fields are marked with *.</p>
          </div>

          <div className="row">
            <div className="col-lg-6 col-md-12">
              <div className="contact-image">
                <Image src="/images/contact.png" alt="Contact Us" width={750} height={620} />
              </div>
            </div>

            <div className="col-lg-6 col-md-12">
              <div className="contact-form">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-lg-12 col-md-6">
                      <div className="form-group">
                        <input type="text" name="firstName" className="form-control" value={formData.firstName} onChange={handleChange} required placeholder="First name *" />
                      </div>
                    </div>

                    <div className="col-lg-12 col-md-6">
                      <div className="form-group">
                        <input type="text" name="lastName" className="form-control" value={formData.lastName} onChange={handleChange} required placeholder="Last name *" />
                      </div>
                    </div>

                    <div className="col-lg-12 col-md-6">
                      <div className="form-group">
                        <input type="text" name="businessName" className="form-control" value={formData.businessName} onChange={handleChange} placeholder="Business name (optional)" />
                      </div>
                    </div>

                    <div className="col-lg-12 col-md-6">
                      <div className="form-group">
                        <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required placeholder="Contact email *" />
                      </div>
                    </div>
                    
                    <div className="col-lg-12 col-md-6">
                      <div className="form-group">
                        <input type="tel" name="phone" className="form-control" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })} placeholder="(555) 555-5555" maxLength={14} />
                      </div>
                    </div>

                    <div className="col-lg-12 col-md-6">
                      <div className="form-group position-relative">
                        <select name="subject" className="form-select form-control" value={formData.subject} onChange={handleChange} required>
                          <option value="">Select a Subject *</option>
                          <option value="1">Add My Business</option>
                          <option value="2">Edit My Business</option>
                          <option value="3">Remove My Business</option>
                          <option value="4">General Inquiry</option>
                        </select>
                        <i className="bi bi-caret-down-fill position-absolute" style={{ right: "15px", top: "50%", transform: "translateY(-50%)" }}></i>
                      </div>
                    </div>

                    <div className="col-lg-12 col-md-12">
                      <div className="form-group">
                        <textarea name="message" className="form-control" cols="30" rows="6" value={formData.message} onChange={handleChange} required placeholder="Write your message... *"></textarea>
                      </div>
                    </div>

                    <div className="col-lg-12 col-md-12">
                      <Turnstile onVerify={setCfToken} siteKey={site?.turnstile_site_key} />
                    </div>

                    <div className="col-lg-12 col-md-12">
                      <button type="submit" className="default-btn" disabled={loading}>
                        {loading ? "Sending..." : "Send Message"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactForm;

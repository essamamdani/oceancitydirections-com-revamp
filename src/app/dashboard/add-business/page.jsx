"use client";
import React, { useState, useEffect } from "react";
import logger from '@/lib/logger'
import { getClientUser } from "@/utils/auth/session";

import toast from 'react-hot-toast';
import Navbar from "@/components/Layouts/Navbar";
import Footer from "@/components/Layouts/Footer";
import { useRouter } from "next/navigation";
import AddressAutocomplete from "@/components/Form/AddressAutocomplete";
import Image from "next/image";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import { addBusinessAction } from "../actions";

import VideoUploadModal from "@/components/Common/VideoUploadModal";

export default function AddBusinessPage() {
    const [saving, setSaving] = useState(false);
    const [uploadingMain, setUploadingMain] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        phone: "",
        email: "",
        website: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        lat: "",
        long: "",
        main_image: "",
        cover_image: "",
        logo: "",
        description: "",
        category: ""
    });
    const [categories, setCategories] = useState([]);
    const [isAddressSelected, setIsAddressSelected] = useState(false);
    const router = useRouter();

    const formatPhone = (value) => {
        const digits = value.replace(/\D/g, '').slice(0, 10);
        if (digits.length <= 3) return digits;
        if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    };

    // Build a business-like object for VideoUploadModal
    const businessForModal = {
        title: formData.title,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        slug: formData.slug || formData.title?.toLowerCase().replace(/\s+/g, '-'),
        category_id: formData.category,
    };

    useEffect(() => {
        const init = async () => {
            try {
                const [catRes, { user }] = await Promise.all([
                    fetch('/api/categories'),
                    getClientUser(),
                ]);
                if (catRes.ok) setCategories(await catRes.json());
                if (user?.email) setFormData(prev => ({ ...prev, email: user.email }));
            } catch (error) {
                console.error('Init error:', error);
            }
        };
        init();
    }, []);

    const handlePlaceSelected = (place) => {
        const addressComponents = place.address_components;
        let city = "", state = "", zip = "", county = "";

        addressComponents.forEach((component) => {
            if (component.types.includes("locality")) city = component.long_name;
            if (component.types.includes("administrative_area_level_1")) state = component.long_name;
            if (component.types.includes("administrative_area_level_2")) county = component.long_name;
            if (component.types.includes("postal_code")) zip = component.long_name;
        });

        if (!county && place.geometry && place.geometry.location) {
            try {
                const lat = typeof place.geometry.location.lat === 'function' ? place.geometry.location.lat() : place.geometry.location.lat;
                const lng = typeof place.geometry.location.lng === 'function' ? place.geometry.location.lng() : place.geometry.location.lng;
                fetch(`/api/geocode?lat=${lat}&lng=${lng}`)
                    .then(res => res.json())
                    .then(data => { if (data.county) setFormData(prev => ({ ...prev, county: data.county })); })
                    .catch(err => console.error("Reverse geocoding failed", err));
            } catch (e) { console.error("Error preparing auto-county fetch", e); }
        }

        if (!county && city === "Baltimore" && (state === "Maryland" || state === "MD")) {
            county = "Baltimore City";
        }

        if (county) {
            county = county.replace(/ County$/i, "").trim();
        }

        let formattedAddress = place.formatted_address
            .replace(/, USA$/, "")
            .replace(/, United States$/, "");

        setFormData((prev) => ({
            ...prev,
            address: formattedAddress,
            city,
            state,
            zip,
            county,
            lat: place.geometry.location.lat(),
            long: place.geometry.location.lng(),
        }));
        setIsAddressSelected(true);
    };

    const handleImageUpload = async (e, field, setLoadingFn) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoadingFn(true);
        const fd = new FormData();
        fd.append("file", file);

        try {
            const res = await fetch("/api/upload-to-r2", { method: "POST", body: fd });
            const data = await res.json();
            if (res.ok) {
                setFormData((prev) => ({ ...prev, [field]: data.url }));
                toast.success("Image uploaded successfully");
            } else {
                toast.error("Image upload failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Image upload failed");
        } finally {
            setLoadingFn(false);
        }
    };

    const handleVideoUploadSuccess = (videoData) => {
        setFormData((prev) => ({
            ...prev,
            video_url: videoData.videoUrl,
            video_id: videoData.videoId,
            video_thumbnail: videoData.thumbnail,
        }));
        setShowVideoModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAddressSelected) {
            toast.error("Please select an address from the autocomplete suggestions.");
            return;
        }

        setSaving(true);

        try {
            const result = await addBusinessAction(formData);

            if (result.success) {
                toast.success("Business submitted for review.");
                router.push("/dashboard");
            } else {
                toast.error(result.error || "Failed to submit business.");
            }
        } catch (err) {
            console.error("Submission error:", err);
            toast.error("An error occurred.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Navbar />
            <section className="dashboard-area ptb-100 bg-f9f9f9">
                <div className="container">
                    <div className="row">
                        {/* Sidebar */}
                        <div className="col-lg-3 col-md-12 mb-4 mb-lg-0">
                            <DashboardSidebar />
                        </div>

                        {/* Main Content */}
                        <div className="col-lg-9 col-md-12">
                            <div className="bg-white rounded-4 shadow-sm p-4 p-md-5">
                                <div className="mb-4 pb-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <h2 className="fw-bold mb-1" style={{ fontSize: '1.8rem' }}>Add New Business</h2>
                                    <p className="text-muted mb-0">Submit your business for listing</p>
                                </div>

                                {/* ── MEDIA UPLOADS ── */}
                                <div className="row g-4 mb-4">
                                    {/* Main Image */}
                                    <div className="col-md-4">
                                        <div className="upload-card h-100">
                                            <div className="upload-card-header">
                                                <i className="bx bx-image me-2"></i>Main Image
                                            </div>
                                            <div className="upload-zone">
                                                {formData.main_image ? (
                                                    <div className="position-relative">
                                                        <Image
                                                            src={formData.main_image}
                                                            alt="Main"
                                                            width={300}
                                                            height={160}
                                                            style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8 }}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                                                            onClick={() => setFormData(p => ({ ...p, main_image: '' }))}
                                                            style={{ borderRadius: '50%', width: 28, height: 28, padding: 0, lineHeight: 1 }}
                                                        >×</button>
                                                    </div>
                                                ) : (
                                                    <label className="upload-placeholder" htmlFor="main-image-upload">
                                                        {uploadingMain ? (
                                                            <><div className="spinner-border spinner-border-sm text-primary mb-2"></div><span>Uploading...</span></>
                                                        ) : (
                                                            <><i className="bx bx-cloud-upload" style={{ fontSize: '2.5rem', color: '#adb5bd' }}></i><span className="text-muted small mt-1">Click to upload main image</span></>
                                                        )}
                                                    </label>
                                                )}
                                                <input
                                                    id="main-image-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    className="d-none"
                                                    onChange={(e) => handleImageUpload(e, 'main_image', setUploadingMain)}
                                                    disabled={uploadingMain}
                                                />
                                                {formData.main_image && (
                                                    <label htmlFor="main-image-upload" className="btn btn-sm btn-outline-secondary w-100 mt-2" style={{ cursor: 'pointer' }}>
                                                        Change Image
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Logo */}
                                    <div className="col-md-4">
                                        <div className="upload-card h-100">
                                            <div className="upload-card-header">
                                                <i className="bx bx-id-card me-2"></i>Logo
                                            </div>
                                            <div className="upload-zone">
                                                {formData.logo ? (
                                                    <div className="position-relative text-center">
                                                        <Image
                                                            src={formData.logo}
                                                            alt="Logo"
                                                            width={120}
                                                            height={120}
                                                            style={{ width: 120, height: 120, objectFit: 'contain', borderRadius: 8, border: '1px solid #eee' }}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                                                            onClick={() => setFormData(p => ({ ...p, logo: '' }))}
                                                            style={{ borderRadius: '50%', width: 28, height: 28, padding: 0, lineHeight: 1 }}
                                                        >×</button>
                                                    </div>
                                                ) : (
                                                    <label className="upload-placeholder" htmlFor="logo-upload">
                                                        {uploadingLogo ? (
                                                            <><div className="spinner-border spinner-border-sm text-primary mb-2"></div><span>Uploading...</span></>
                                                        ) : (
                                                            <><i className="bx bx-image-alt" style={{ fontSize: '2.5rem', color: '#adb5bd' }}></i><span className="text-muted small mt-1">Click to upload logo</span></>
                                                        )}
                                                    </label>
                                                )}
                                                <input
                                                    id="logo-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    className="d-none"
                                                    onChange={(e) => handleImageUpload(e, 'logo', setUploadingLogo)}
                                                    disabled={uploadingLogo}
                                                />
                                                {formData.logo && (
                                                    <label htmlFor="logo-upload" className="btn btn-sm btn-outline-secondary w-100 mt-2" style={{ cursor: 'pointer' }}>
                                                        Change Logo
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Video */}
                                    <div className="col-md-4">
                                        <div className="upload-card h-100">
                                            <div className="upload-card-header d-flex justify-content-between align-items-center">
                                                <span><i className="bx bx-video me-2"></i>Business Video</span>
                                                <span className="badge bg-dark" style={{ fontSize: '0.65rem' }}>VideoHomes</span>
                                            </div>
                                            <div className="upload-zone">
                                                {formData.video_url ? (
                                                    <div className="position-relative">
                                                        <video
                                                            src={formData.video_url}
                                                            poster={formData.video_thumbnail || undefined}
                                                            className="w-100 rounded"
                                                            style={{ height: 130, objectFit: 'cover' }}
                                                            controls
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                                                            onClick={() => setFormData(p => ({ ...p, video_url: '', video_id: '', video_thumbnail: '' }))}
                                                            style={{ borderRadius: '50%', width: 28, height: 28, padding: 0, lineHeight: 1 }}
                                                        >×</button>
                                                    </div>
                                                ) : (
                                                    <div className="upload-placeholder" style={{ cursor: 'pointer' }} onClick={() => setShowVideoModal(true)}>
                                                        <i className="bx bx-movie-play" style={{ fontSize: '2.5rem', color: '#adb5bd' }}></i>
                                                        <span className="text-muted small mt-1 text-center">
                                                            Add a video showcase<br />
                                                            <span style={{ fontSize: '0.7rem' }}>MP4 · Max 100MB</span>
                                                        </span>
                                                        <button type="button" className="btn btn-sm btn-primary mt-2 px-3">
                                                            Upload Video
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ── FORM ── */}
                                <form onSubmit={handleSubmit} className="mt-2">
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Business Title</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Category</label>
                                        <input
                                            list="category-list"
                                            className="form-control"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            placeholder="Search category..."
                                            required
                                        />
                                        <datalist id="category-list">
                                            {categories.map((c) => (
                                                <option key={c.id} value={c.name} />
                                            ))}
                                        </datalist>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Description</label>
                                        <textarea
                                            className="form-control"
                                            rows="4"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            required
                                        ></textarea>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-semibold">Phone Number</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                                                placeholder="(555) 555-5555"
                                                maxLength={14}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label fw-semibold">Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                readOnly={!!formData.email}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Website</label>
                                        <input
                                            type="url"
                                            className="form-control"
                                            value={formData.website}
                                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                            onBlur={(e) => {
                                                let val = e.target.value;
                                                if (val && !/^https?:\/\//i.test(val)) {
                                                    setFormData(prev => ({ ...prev, website: 'https://' + val }));
                                                }
                                            }}
                                            placeholder="https://example.com"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label fw-semibold">Address</label>
                                        <AddressAutocomplete
                                            defaultValue={formData.address}
                                            onPlaceSelected={handlePlaceSelected}
                                            onInputChange={() => setIsAddressSelected(false)}
                                        />
                                    </div>

                                    <input type="hidden" name="city" value={formData.city || ''} />
                                    <input type="hidden" name="state" value={formData.state || ''} />
                                    <input type="hidden" name="zip" value={formData.zip || ''} />
                                    <input type="hidden" name="county" value={formData.county || ''} />
                                    <input type="hidden" name="lat" value={formData.lat || ''} />
                                    <input type="hidden" name="long" value={formData.long || ''} />

                                    <button type="submit" className="default-btn w-100" disabled={saving}>
                                        {saving ? "Submitting..." : "Submit Business"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <VideoUploadModal
                isOpen={showVideoModal}
                onClose={() => setShowVideoModal(false)}
                business={businessForModal}
                onSuccess={handleVideoUploadSuccess}
            />

            <style jsx>{`
                .bg-f9f9f9 { background-color: #f9f9f9 !important; }
                .rounded-4 { border-radius: 1rem !important; }
                .upload-card {
                    background: #fff;
                    border: 1px solid #e9ecef;
                    border-radius: 12px;
                    overflow: hidden;
                }
                .upload-card-header {
                    background: #f8f9fa;
                    padding: 10px 16px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    border-bottom: 1px solid #e9ecef;
                    display: flex;
                    align-items: center;
                }
                .upload-zone {
                    padding: 16px;
                }
                .upload-placeholder {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 130px;
                    background: #f8f9fa;
                    border: 2px dashed #dee2e6;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: border-color 0.2s;
                    width: 100%;
                    padding: 12px;
                }
                .upload-placeholder:hover {
                    border-color: var(--mainColor);
                }
            `}</style>
        </>
    );
}

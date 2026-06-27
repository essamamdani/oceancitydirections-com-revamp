"use client";
import React, { useEffect, useState } from "react";
import logger from '@/lib/logger'

import toast from 'react-hot-toast';
import NavbarTwo from "@/components/Layouts/NavbarTwo";
import Footer from "@/components/Layouts/Footer";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import { useRouter } from "next/navigation";
import AddressAutocomplete from "@/components/Form/AddressAutocomplete";
import Image from "next/image";
import ConfirmModal from "@/components/Common/ConfirmModal";
import VideoUploadModal from "@/components/Common/VideoUploadModal";

import { getSession } from "@/lib/auth-client";
import { getBusinessForEdit, saveBusinessEditAction } from "../../actions";

export default function EditBusinessPage({ params }) {
    const [user, setUser] = useState(null);
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [claimStatus, setClaimStatus] = useState(null);
    const [claimData, setClaimData] = useState(null);

    // Checkboxes
    const [checks, setChecks] = useState({
        mainImage: false,
        logo: false,
        description: false
    });

    const [isAddressSelected, setIsAddressSelected] = useState(true);

    const formatPhone = (value) => {
        const digits = value.replace(/\D/g, '').slice(0, 10);
        if (digits.length <= 3) return digits;
        if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    };

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        lat: "",
        long: "",
        main_image: "",
        logo: "",
        description: "",
        county: ""
    });
    const router = useRouter();
    const { id } = React.use(params);

    useEffect(() => {
        const fetchBusiness = async () => {
            const { data: sessionData } = await getSession();
            const user = sessionData?.user;
            
            if (!user) {
                router.push("/login");
                return;
            }
            setUser(user);

            const result = await getBusinessForEdit(id);

            if (result.error || !result.data) {
                toast.error(result.error || "Business not found or access denied.");
                router.push("/dashboard");
                return;
            }

            const data = result.data;

            // Allow editing when user either owns the business or has an open claim
            // We must use the API to fetch claims because they are in the Auth DB
            let myClaim = null;
            try {
                const claimsRes = await fetch('/api/claims/list', { cache: 'no-store' });
                if (claimsRes.ok) {
                    const claimsData = await claimsRes.json();
                    myClaim = claimsData.data?.find(c => 
                        c.business_id == id && 
                        ['pending', 'under_review', 'approved'].includes(c.status)
                    );
                }
            } catch (err) {
                console.error("Error fetching claims for edit validation:", err);
            }

            if (data.claimed_by !== user.id && !myClaim?.id) {
                toast.error("You need to claim this business before editing.");
                router.push("/dashboard");
                return;
            }

            setBusiness(data);
            if (myClaim) {
                setClaimStatus(myClaim.status);
                setClaimData(myClaim);
            } else if (data.claimed_by === user.id) {
                // If claimed directly on business table but no active claim record (legacy or direct add), 
                // we consider it Claimed/Approved unless there is a pending claim.
                setClaimStatus('approved');
            }

            // Use proposed data if available (and not empty) and the claim is still pending/under_review.
            // If the claim is approved, we prioritize the live data.
            const sourceData = (myClaim?.proposed_data && Object.keys(myClaim.proposed_data).length > 0 && ['pending', 'under_review'].includes(myClaim.status))
                ? myClaim.proposed_data
                : data;

            setFormData({
                title: sourceData.title || "",
                phone: sourceData.phone || "",
                address: sourceData.address || "",
                city: sourceData.city || "",
                state: sourceData.state || "",
                zip: sourceData.zip || "",
                lat: sourceData.lat || sourceData.latitude || "",
                long: sourceData.long || sourceData.longitude || "",
                main_image: sourceData.main_image || "",
                logo: sourceData.logo || "",
                description: sourceData.description || "",
                county: sourceData.county || (sourceData.city === 'Baltimore' ? 'Baltimore City' : "") || ""
            });
            setLoading(false);
        };

        fetchBusiness();
    }, [id, router]);

    const handlePlaceSelected = (place) => {
        setIsAddressSelected(true);
        const addressComponents = place.address_components;
        let city = "", state = "", zip = "", county = "";

        addressComponents.forEach((component) => {
            if (component.types.includes("locality")) city = component.long_name;
            if (component.types.includes("administrative_area_level_1")) state = component.short_name;
            if (component.types.includes("administrative_area_level_2")) county = component.long_name;
            if (component.types.includes("postal_code")) zip = component.long_name;
        });

        // ---------------------------------------------------------
        // AUTOMATIC REVERSE GEOCODING FALLBACK (Safety Net)
        // If county is missing, fetch it using Lat/Long
        // ---------------------------------------------------------
        if (!county && place.geometry && place.geometry.location) {
            try {
                const lat = typeof place.geometry.location.lat === 'function' ? place.geometry.location.lat() : place.geometry.location.lat;
                const lng = typeof place.geometry.location.lng === 'function' ? place.geometry.location.lng() : place.geometry.location.lng;

                fetch(`/api/geocode?lat=${lat}&lng=${lng}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.county) {
                            logger.log("Recovered missing county:", data.county);
                            setFormData(prev => ({ ...prev, county: data.county }));
                        }
                    })
                    .catch(err => console.error("Reverse geocoding failed", err));

            } catch (e) {
                console.error("Error preparing auto-county fetch", e);
            }
        }

        // Fallback for Baltimore City independent city issue
        if (!county && city === "Baltimore" && (state === "Maryland" || state === "MD" || state === "Md")) {
            county = "Baltimore City";
        }

        // Clean County
        if (county) {
            county = county.replace(/ County$/i, "").trim();
        }

        setFormData((prev) => ({
            ...prev,
            address: place.formatted_address,
            city,
            state,
            zip,
            county,
            lat: place.geometry.location.lat(),
            long: place.geometry.location.lng(),
        }));
    };

    const handleImageUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);

        try {
            const res = await fetch("/api/upload-to-r2", {
                method: "POST",
                body: uploadFormData,
            });
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
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAddressSelected) {
            toast.error("Please select an address from the autocomplete suggestions.");
            return;
        }
        if (!checks.mainImage && formData.main_image) {
            toast.error("Please confirm the Main Image or remove it.");
            return;
        }
        if (!checks.logo && formData.logo) {
            toast.error("Please confirm the Logo or remove it.");
            return;
        }
        if (!checks.description && formData.description) {
            toast.error("Please confirm the Description or remove it.");
            return;
        }

        setSaving(true);

        try {
            const result = await saveBusinessEditAction({
                business_id: business.id,
                proposed_data: { ...formData },
                proposed_update_slug: formData.title || formData.address ? `${formData.title || business.title && ''}--${formData.address || business.address && ''}` : null,
            });

            if (result.success) {
                toast.success("Changes submitted for review.");
                router.push("/dashboard");
            } else {
                toast.error(result.error || "Failed to submit changes.");
            }
        } catch (err) {
            console.error("Update error:", err);
            toast.error("An error occurred.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            // We use the admin delete API but we need to ensure the user owns it. 
            // The API should probably be protected or we check on server side.
            // Since we don't have a user-facing delete API yet that permanently deletes,
            // we might need to create one or use existing if it supports it.
            // Existing `api/admin/claims/delete` deletes the CLAIM, not the business (usually).
            // Existing `api/removal-request` is soft delete request.
            // User asked "actually delete it from database permanently".
            // I'll create a new server action or API route for this specific owner-delete action.
            // Or use Supabase client directly if RLS allows it (unlikely for permanent delete usually).

            const response = await fetch(`/api/claims/delete-business`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ business_id: business.id })
            });

            if (response.ok) {
                toast.success("Business deleted permanently.");
                router.push("/dashboard");
            } else {
                toast.error("Failed to delete business.");
            }
        } catch (error) {
            console.error("Delete error", error);
            toast.error("An error occurred");
        } finally {
            setDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    if (loading) return (
        <>
            <NavbarTwo />
            <div className="text-center pt-100">Loading...</div>
        </>
    );

    const getStatusBadge = (status) => {
        if (status === 'approved') return <span className="badge bg-success">Approved</span>;
        if (status === 'pending') return <span className="badge bg-warning text-dark">Pending</span>;
        if (status === 'under_review') return <span className="badge bg-info text-dark">Under Review</span>;
        return <span className="badge bg-secondary">{status}</span>;
    };

    return (
        <>
            <NavbarTwo />
            <section className="dashboard-area ptb-100 bg-f9f9f9">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-3 col-md-12 mb-4 mb-lg-0">
                            <DashboardSidebar user={user} />
                        </div>
                        <div className="col-lg-9 col-md-12">
                            <div className="bg-white rounded-4 shadow-sm p-4 p-md-5">
                                <div className="mb-4 pb-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                                        <h2 className="fw-bold mb-1" style={{ fontSize: '1.8rem' }}>Edit Business</h2>
                                        {(business.update_slug || business.slug) && (
                                            <a
                                                href={`/s/${business.update_slug || business.slug}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="btn btn-sm btn-outline-primary"
                                            >
                                                <i className="bx bx-link-external me-1"></i>View Listing
                                            </a>
                                        )}
                                    </div>
                                    <p className="text-muted mb-0">{business.title}</p>
                                    <div className="mt-2">
                                        Status: {getStatusBadge(claimStatus || 'unknown')}
                                    </div>
                                </div>

                                {(claimStatus === 'under_review' || claimStatus === 'pending') && claimData?.proposed_data && (
                                    <div className="alert alert-info mb-4">
                                        <strong>Note:</strong> You have pending changes under review. The form below shows your latest saved drafts (if any) or current live data.
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
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
                                                        <>
                                                            <div className="position-relative">
                                                                <Image
                                                                    src={formData.main_image}
                                                                    alt="Business"
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
                                                            <div className="form-check mt-2">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    id="checkMainImage"
                                                                    checked={checks.mainImage}
                                                                    onChange={e => setChecks({ ...checks, mainImage: e.target.checked })}
                                                                />
                                                                <label className="form-check-label small" htmlFor="checkMainImage">
                                                                    I confirm this image is correct
                                                                </label>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <label className="upload-placeholder" htmlFor="main-image-upload">
                                                            {uploading ? (
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
                                                        onChange={(e) => handleImageUpload(e, 'main_image')}
                                                        disabled={uploading}
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
                                                        <>
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
                                                            <div className="form-check mt-2">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    id="checkLogo"
                                                                    checked={checks.logo}
                                                                    onChange={e => setChecks({ ...checks, logo: e.target.checked })}
                                                                />
                                                                <label className="form-check-label small" htmlFor="checkLogo">
                                                                    I confirm this logo is correct
                                                                </label>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <label className="upload-placeholder" htmlFor="logo-upload">
                                                            {uploading ? (
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
                                                        onChange={(e) => handleImageUpload(e, 'logo')}
                                                        disabled={uploading}
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
                                                    <div className="upload-placeholder" style={{ cursor: 'pointer' }} onClick={() => setUploadModalOpen(true)}>
                                                        <i className="bx bx-movie-play" style={{ fontSize: '2.5rem', color: '#adb5bd' }}></i>
                                                        <span className="text-muted small mt-1 text-center">
                                                            Add a video showcase<br />
                                                            <span style={{ fontSize: '0.7rem' }}>MP4 · Max 100MB</span>
                                                        </span>
                                                        <button type="button" className="btn btn-sm btn-primary mt-2 px-3">
                                                            Upload Video
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

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
                                        <label className="form-label fw-semibold">Description</label>
                                        <textarea
                                            className="form-control"
                                            rows="4"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            required
                                        ></textarea>
                                        <div className="form-check mt-2">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="checkDescription"
                                                checked={checks.description}
                                                onChange={e => setChecks({ ...checks, description: e.target.checked })}
                                            />
                                            <label className="form-check-label small" htmlFor="checkDescription">
                                                I confirm this Description is correct
                                            </label>
                                        </div>
                                    </div>

                                    <div className="mb-3">
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

                                    <button type="submit" className="default-btn w-100 mb-3" disabled={saving}>
                                        {saving ? "Saving..." : "Save Changes"}
                                    </button>

                                    {claimStatus === 'approved' && (
                                        <button
                                            type="button"
                                            className="btn w-100 text-danger"
                                            onClick={() => setIsDeleteModalOpen(true)}
                                            style={{ background: 'none', border: 'none', textDecoration: 'underline' }}
                                        >
                                            Remove Business (Permanently)
                                        </button>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="Delete Business Permanently"
                message="Are you sure you want to delete this business? This action cannot be undone and will permanently remove the business from the Website."
                confirmText={deleting ? "Deleting..." : "Yes, Delete Permanently"}
                cancelText="Cancel"
                onConfirm={handleDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
                onClose={() => setIsDeleteModalOpen(false)}
            />

            <VideoUploadModal
                isOpen={uploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
                business={business}
                onSuccess={(videoData) => {
                    setFormData(prev => ({
                        ...prev,
                        video_url: videoData.videoUrl,
                        video_id: videoData.videoId,
                        video_thumbnail: videoData.thumbnail,
                    }));
                    toast.success("Video attached! Save changes to submit.");
                    setUploadModalOpen(false);
                }}
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

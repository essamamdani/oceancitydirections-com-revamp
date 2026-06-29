"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Navbar from "@/components/Layouts/Navbar";
import { getSession } from "@/lib/auth-client";

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fullName, setFullName] = useState("");
    const [website, setWebsite] = useState("");
    const [phone, setPhone] = useState("");
    const [saving, setSaving] = useState(false);

    const formatPhone = (value) => {
        const digits = value.replace(/\D/g, '').slice(0, 10);
        if (digits.length <= 3) return digits;
        if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    };
    const router = useRouter();

    useEffect(() => {
        const init = async () => {
            const { data } = await getSession();
            const authUser = data?.user;
            
            if (!authUser) {
                router.push("/login");
                return;
            }
            
            setUser(authUser);
            setFullName(authUser.name || "");
            setPhone((authUser as any).phone || "");
            setWebsite((authUser as any).website || "");
            setLoading(false);
        };

        init();
    }, [router]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);

        const phoneRegex = /^\+1\d{10}$/;
        if (!fullName.trim()) {
            toast.error("Full name is required");
            setSaving(false);
            return;
        }
        if (phone && !phoneRegex.test(phone)) {
            toast.error("Phone must be US format +1 followed by 10 digits");
            setSaving(false);
            return;
        }

        // Better Auth update via API
        const res = await fetch('/api/profile/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: fullName,
                phone,
                website,
            })
        });

        if (!res.ok) {
            const error = await res.text();
            toast.error(error || "Failed to update profile");
        } else {
            toast.success("Profile updated successfully");
            router.refresh();
        }
        setSaving(false);
    };

    if (loading) {
        return <div className="ptb-100 text-center">Loading...</div>;
    }

    return (
        <>
        <Navbar />
        <section className="user-area-all-style ptb-100">
            <div className="container">
                <div className="section-title">
                    <h2>Edit Profile</h2>
                </div>
                <div className="row">
                    <div className="col-lg-8 col-md-12 offset-lg-2">
                        <div className="contact-form-action">
                            <form onSubmit={handleUpdateProfile}>
                                <div className="row">
                                     <div className="col-lg-12 col-md-12">
                                        <div className="form-group">
                                            <label>Full Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-12 col-md-12">
                                        <div className="form-group">
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={user?.email || ''}
                                                disabled
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-12 col-md-12">
                                        <div className="form-group">
                                            <label>Phone Number</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                value={phone}
                                                onChange={(e) => setPhone(formatPhone(e.target.value))}
                                                placeholder="(555) 555-5555"
                                                maxLength={14}
                                            />
                                        </div>
                                    </div>
                                   
                                    <div className="col-lg-12 col-md-12">
                                        <div className="form-group">
                                            <label>Website</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={website}
                                                onChange={(e) => setWebsite(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-12 col-md-12">
                                        <button type="submit" className="default-btn" disabled={saving}>
                                            {saving ? "Saving..." : "Save Changes"}
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

export default ProfilePage;

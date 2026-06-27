"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import NavbarTwo from "@/components/Layouts/NavbarTwo";
import DashboardSidebar from "@/components/Dashboard/DashboardSidebar";
import { authClient } from "@/lib/auth-client";

import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [fullName, setFullName] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [saving, setSaving] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const router = useRouter();
    const { refreshUser } = useAuth(); // Import refreshUser to update global context

    useEffect(() => {
        // Safe way to get user from storage, similar to dashboard/page.jsx
        const getUser = () => {
            if (typeof window !== 'undefined') {
                if (!document.cookie.includes('auth-token=')) {
                    localStorage.removeItem('auth-user');
                    localStorage.removeItem('auth-token');
                    return null;
                }
                const userStr = localStorage.getItem('auth-user');
                return userStr ? JSON.parse(userStr) : null;
            }
            return null;
        };

        const cachedUser = getUser();
        if (cachedUser) {
            setUser(cachedUser);
            setFullName(cachedUser.name || "");
            setAuthLoading(false);
        } else {
            router.push("/login");
        }
    }, [router]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);

        if (!fullName.trim()) {
            toast.error("Full name is required");
            setSaving(false);
            return;
        }

        try {
            // Update profile via Better Auth directly from client
            const result = await authClient.updateUser({
                name: fullName.trim(),
            });

            if (result.error) {
                toast.error(result.error.message || "Failed to update profile");
            } else {
                toast.success("Profile updated successfully");
                
                // Update local storage to reflect the new name
                if (user) {
                    const updatedUser = { ...user, name: fullName.trim() };
                    localStorage.setItem('auth-user', JSON.stringify(updatedUser));
                    setUser(updatedUser);
                    refreshUser(); // Update global auth context immediately
                }
                
                router.refresh();
            }
        } catch (err) {
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setChangingPassword(true);

        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("All password fields are required");
            setChangingPassword(false);
            return;
        }

        if (newPassword.length < 8) {
            toast.error("New password must be at least 8 characters");
            setChangingPassword(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New password and confirm password do not match");
            setChangingPassword(false);
            return;
        }

        try {
            // Change password directly via Better Auth from client
            const result = await authClient.changePassword({
                currentPassword,
                newPassword,
            });

            if (result.error) {
                toast.error(result.error.message || "Failed to change password. Make sure your current password is correct.");
            } else {
                toast.success("Password changed successfully");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch (err) {
            toast.error("Failed to change password");
        } finally {
            setChangingPassword(false);
        }
    };

    if (authLoading) {
        return (
            <>
                <NavbarTwo />
                <div className="pt-100 pb-100 text-center">
                    <div className="container">
                        <div className="spinner-border text-primary"></div>
                        <p className="mt-3">Loading...</p>
                    </div>
                </div>
            </>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <>
            <NavbarTwo />
            <div className="pt-100 pb-100">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-3 col-md-12">
                            <DashboardSidebar user={user} />
                        </div>
                        <div className="col-lg-9 col-md-12">
                            <div className="text-center mb-4">
                                <h2>Edit Profile</h2>
                                <p>Update your personal information</p>
                            </div>

                            <div className="dashboard-form-area">
                                {/* Profile Information Form */}
                                <div className="card mb-4 border-0 shadow-sm">
                                    <div className="card-body p-4">
                                        <h4 className="mb-4">Profile Information</h4>
                                        <form onSubmit={handleUpdateProfile}>
                                            <div className="row">
                                                <div className="col-lg-12 col-md-12 mb-3">
                                                    <div className="form-group">
                                                        <label>Full Name <span className="text-danger">*</span></label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={fullName}
                                                            onChange={(e) => setFullName(e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-lg-12 col-md-12 mb-3">
                                                    <div className="form-group">
                                                        <label>Email Address</label>
                                                        <input
                                                            type="email"
                                                            className="form-control"
                                                            value={user?.email || ''}
                                                            disabled
                                                            style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                                                        />
                                                        <small className="form-text text-muted">
                                                            Email cannot be changed
                                                        </small>
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

                                {/* Change Password Form */}
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body p-4">
                                        <h4 className="mb-4">Change Password</h4>
                                        <form onSubmit={handleChangePassword}>
                                            <div className="row">
                                                <div className="col-lg-12 col-md-12 mb-3">
                                                    <div className="form-group">
                                                        <label>Current Password <span className="text-danger">*</span></label>
                                                        <input
                                                            type="password"
                                                            className="form-control"
                                                            value={currentPassword}
                                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                                            placeholder="Enter your current password"
                                                            minLength={8}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-lg-12 col-md-12 mb-3">
                                                    <div className="form-group">
                                                        <label>New Password <span className="text-danger">*</span></label>
                                                        <input
                                                            type="password"
                                                            className="form-control"
                                                            value={newPassword}
                                                            onChange={(e) => setNewPassword(e.target.value)}
                                                            placeholder="Enter new password (min 8 characters)"
                                                            minLength={8}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-lg-12 col-md-12 mb-3">
                                                    <div className="form-group">
                                                        <label>Confirm New Password <span className="text-danger">*</span></label>
                                                        <input
                                                            type="password"
                                                            className="form-control"
                                                            value={confirmPassword}
                                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                                            placeholder="Confirm new password"
                                                            minLength={8}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-lg-12 col-md-12">
                                                    <button type="submit" className="default-btn" disabled={changingPassword}>
                                                        {changingPassword ? "Changing..." : "Change Password"}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
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

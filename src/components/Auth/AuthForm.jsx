"use client";
import React, { useState } from "react";
import logger from '@/lib/logger'

import toast from 'react-hot-toast';
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

import { validateEmail, validatePhone } from "@/lib/validation";
import Turnstile from "../Common/Turnstile";
import { useSites } from "@/contexts/SitesContext";

const AuthForm = ({ initialMode = "login", onSuccess, role = "consumer", defaultProfessionSlug }) => {
    const { site } = useSites();
    const [mode, setMode] = useState(initialMode);
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    
    const [profession, setProfession] = useState("");
    const [subProfession, setSubProfession] = useState("");
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);

    const [loading, setLoading] = useState(false);
    const [cfToken, setCfToken] = useState(null);
    const [tosAccepted, setTosAccepted] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams.get('next') || '/dashboard';
    const { refreshUser } = useAuth();

    React.useEffect(() => {
        if (mode === "register") {
            const referrer = document.referrer;
            fetch('/api/auth/user-categories')
                .then(res => res.json())
                .then(data => {
                    setCategories(data);

                    // Role modal selection takes priority
                    if (defaultProfessionSlug) {
                        const matched = data.find(c => c.slug === defaultProfessionSlug);
                        if (matched) { setProfession(matched.id); return; }
                    }

                    // Fallback: smart auto-selection based on referrer URL
                    if (referrer.includes('/local-business') || referrer.includes('/merchants')) {
                        const merchantCat = data.find(c => c.slug === 'local-business');
                        if (merchantCat) setProfession(merchantCat.id);
                    } else if (referrer.includes('/media-pros')) {
                        const mediaCat = data.find(c => c.slug === 'media-pros');
                        if (mediaCat) setProfession(mediaCat.id);
                    } else if (referrer.includes('/realty-agents')) {
                        const realtyCat = data.find(c => c.slug === 'realty-agents');
                        if (realtyCat) setProfession(realtyCat.id);
                    }
                })
                .catch(err => console.error("Failed to load user categories", err));
        }
    }, [mode, defaultProfessionSlug]);

    React.useEffect(() => {
        if (profession) {
            fetch(`/api/auth/user-categories?parentId=${profession}`)
                .then(res => res.json())
                .then(data => {
                    setSubCategories(data);
                    setSubProfession("");
                })
                .catch(err => console.error("Failed to load sub categories", err));
        } else {
            setSubCategories([]);
        }
    }, [profession]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        logger.log('[AuthForm] handleSubmit called, mode:', mode);

        // Turnstile check - warn but don't block if site key not configured
        if (!cfToken) {
            logger.warn('[AuthForm] Turnstile token missing');
            if (site?.turnstile_site_key) {
                toast.error("Please complete the security check (CAPTCHA).");
                return;
            } else {
                logger.log('[AuthForm] No Turnstile site key configured, proceeding without token');
            }
        }

        if (mode === "register" && !profession) {
            toast.error("Please select a profession");
            return;
        }

        if (mode === "register" && !tosAccepted) {
            toast.error("Please accept the Terms of Service to continue");
            return;
        }

        setLoading(true);
        logger.log('[AuthForm] Starting API call...');

        try {
            if (mode === "login") {
                logger.log('[AuthForm] Calling /api/auth/sign-in/email');
                // Call universal auth API
                const response = await fetch('/api/auth/sign-in/email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, cf_token: cfToken }),
                });

                logger.log('[AuthForm] Response status:', response.status);
                const data = await response.json();
                logger.log('[AuthForm] Response data:', data);

                if (!response.ok) {
                    throw new Error(data.message || data.error || 'Login failed');
                }

                // Handle both token-based and cookie-based auth
                if (data.token) {
                    logger.log('[AuthForm] Token received, storing');
                    localStorage.setItem('auth-token', data.token);
                    document.cookie = 'auth-token=' + data.token + '; path=/; max-age=604800; SameSite=Lax';
                } else {
                    logger.log('[AuthForm] No token in response, relying on cookie-based session');
                }
                
                if (data.user) {
                    localStorage.setItem('auth-user', JSON.stringify(data.user));
                    toast.success("Logged in successfully!");
                    
                    // Refresh global auth state
                    try {
                        await refreshUser();
                    } catch (refreshErr) {
                        logger.warn('[AuthForm] refreshUser failed:', refreshErr);
                    }
                    
                    if (onSuccess) {
                        onSuccess(data.user);
                    } else {
                        window.location.href = next;
                    }
                } else {
                    // Try to fetch user from /api/auth/me
                    logger.log('[AuthForm] No user in response, trying /api/auth/me');
                    const meRes = await fetch('/api/auth/me');
                    if (meRes.ok) {
                        const meData = await meRes.json();
                        if (meData.user) {
                            localStorage.setItem('auth-user', JSON.stringify(meData.user));
                            toast.success("Logged in successfully!");
                            if (onSuccess) onSuccess(meData.user);
                            else window.location.href = next;
                        } else {
                            throw new Error('Login succeeded but user data not found');
                        }
                    } else {
                        throw new Error('Login succeeded but failed to fetch user data');
                    }
                }

            } else if (mode === "register") {
                logger.log('[AuthForm] Register mode');
                if (!fullName.trim()) {
                    toast.error("Full name is required");
                    setLoading(false);
                    return;
                }
                
                if (!validatePhone(phone)) {
                    toast.error("Please enter a valid 10-digit USA phone number");
                    setLoading(false);
                    return;
                }

                // Call universal auth API
                logger.log('[AuthForm] Calling /api/auth/sign-up/email');
                const selectedSubCat = subCategories.find(c => String(c.id) === String(subProfession));
                const selectedCat = categories.find(c => String(c.id) === String(profession));
                const professionSlug = selectedSubCat?.slug || selectedCat?.slug || '';

                const response = await fetch('/api/auth/sign-up/email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: fullName,
                        email,
                        phone,
                        password,
                        site: 'oceancity',
                        profession: subProfession || profession,
                        profession_slug: professionSlug,
                        role: role,
                        callbackURL: '/dashboard',
                        cf_token: cfToken
                    }),
                });

                logger.log('[AuthForm] Register response status:', response.status);
                const data = await response.json();
                logger.log('[AuthForm] Register response data:', data);

                if (!response.ok) {
                    throw new Error(data.message || data.error || 'Registration failed');
                }

                // Store token and user data after successful signup
                toast.success("Registration successful! Please check your email to verify your account before logging in.");
                setMode("login");
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        if (!email.trim()) {
            toast.error("Please enter your email address first");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to resend verification email');
            }
            toast.success("Verification email resent! Please check your inbox.");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-2xl p-8 space-y-6">
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-extrabold text-slate-900 font-serif">
                    {mode === "login" && "Welcome Back"}
                    {mode === "register" && "Create Account"}
                </h3>
                <p className="text-xs font-semibold text-slate-400">
                    {mode === "login" && "Login to access your local directory dashboard"}
                    {mode === "register" && "Join our local discovery and property network"}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                {mode === "register" && (
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                        <input
                            type="text"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition duration-200 placeholder-slate-400"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            placeholder="Full Name"
                        />
                    </div>
                )}

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

                {mode === "register" && (
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                        <input
                            type="tel"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition duration-200 placeholder-slate-400"
                            value={phone}
                            onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                                let formatted = digits;
                                if (digits.length > 6) formatted = digits.slice(0,3) + '-' + digits.slice(3,6) + '-' + digits.slice(6);
                                else if (digits.length > 3) formatted = digits.slice(0,3) + '-' + digits.slice(3);
                                setPhone(formatted);
                            }}
                            required
                            placeholder="410-310-8665"
                            maxLength={12}
                        />
                    </div>
                )}

                <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                    <input
                        type="password"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition duration-200 placeholder-slate-400"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        minLength={8}
                    />
                </div>

                {mode === "register" && (
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Profession</label>
                            <select 
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition duration-200"
                                value={profession}
                                onChange={(e) => setProfession(e.target.value)}
                                required
                            >
                                <option value="">Select Profession</option>
                                {categories.map(cat => (
                                    <option 
                                        key={cat.id} 
                                        value={cat.id}
                                        disabled={cat.slug === 'realty-agents'}
                                    >
                                        {cat.name} {cat.slug === 'realty-agents' ? '(Stay Tuned)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {subCategories.length > 0 && (
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Sub Profession</label>
                                <select 
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition duration-200"
                                    value={subProfession}
                                    onChange={(e) => setSubProfession(e.target.value)}
                                    required
                                >
                                    <option value="">Select Sub Profession</option>
                                    {subCategories.map(sub => (
                                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                )}

                {mode === "login" && (
                    <div className="flex items-center justify-between text-xs font-bold pt-1">
                        <button 
                            type="button" 
                            className="text-orange-600 hover:text-orange-700 transition" 
                            onClick={handleResendVerification}
                            disabled={loading}
                        >
                            Resend Verification
                        </button>
                        <Link href="/forgot-password" className="text-slate-500 hover:text-orange-600 transition">
                            Forgot Password?
                        </Link>
                    </div>
                )}

                {mode === "register" && (
                    <div className="flex items-start gap-2 pt-1">
                        <input
                            type="checkbox"
                            id="tos-accept"
                            checked={tosAccepted}
                            onChange={(e) => setTosAccepted(e.target.checked)}
                            className="mt-0.5 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                            style={{ flexShrink: 0 }}
                        />
                        <label htmlFor="tos-accept" className="text-xs font-semibold text-slate-500 leading-snug cursor-pointer select-none">
                            I agree to the{' '}
                            <Link href="/terms" target="_blank" className="text-orange-600 hover:underline">
                                Terms of Service
                            </Link>
                        </label>
                    </div>
                )}

                <div className="pt-2">
                    <Turnstile onVerify={setCfToken} siteKey={site?.turnstile_site_key} />
                </div>

                <button 
                    type="submit" 
                    className="w-full bg-[#08738a] hover:bg-[#075362] text-white rounded-xl py-3.5 font-bold transition text-xs uppercase tracking-wider shadow-md shadow-[#08738a]/20 transform hover:-translate-y-0.5 duration-200 flex items-center justify-center gap-2"
                    disabled={loading}
                >
                    {loading ? "Processing..." : mode === "login" ? "Login" : "Create Account"}
                </button>
            </form>

            <div className="text-center text-xs font-semibold text-slate-400 border-t border-slate-100 pt-4">
                {mode === "login" ? (
                    <div>
                        Don't have an account?{" "}
                        <button 
                            className="text-orange-600 hover:text-orange-700 font-bold ml-1 hover:underline" 
                            onClick={() => setMode("register")}
                        >
                            Register
                        </button>
                    </div>
                ) : (
                    <div>
                        Already have an account?{" "}
                        <button 
                            className="text-orange-600 hover:text-orange-700 font-bold ml-1 hover:underline" 
                            onClick={() => setMode("login")}
                        >
                            Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthForm;

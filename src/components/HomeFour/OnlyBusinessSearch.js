"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { transformString } from "@/lib/helper";
import { useRouter } from 'next/navigation'
import { useSites } from "@/contexts/SitesContext";

const BusinessSearch = () => {
    const { site, loading, error } = useSites();
    if (loading || !site) return null; // Wait until site data is ready
    if (error) {
        console.error("Error loading site data:", error);
        return null;
    }
    const router = useRouter();
    const [placeholder, setPlaceholder] = useState("");
    const [typingState, setTypingState] = useState({ typingIndex: 0, textIndex: 0, isDeleting: false });
    // lat and long states
    const [lat, setLat] = useState(null);
    const [long, setLong] = useState(null);
    const [query, setQuery] = useState("");
    const [locationRequested, setLocationRequested] = useState(false);
    const counties = site.DefaultCounties;

    const county = useMemo(() =>
        counties.length > 0 ? transformString(counties[Math.floor(Math.random() * counties.length)]) : "",
        [counties]
    );

    const options = useMemo(() => ({
        business: [
            "Find pizza near me",
            "Find a hotel at the beach",
            `Find a shopping center in ${county}`
        ]
    }), [county]);

    const textArray = options.business;
    const currentText = textArray[typingState.textIndex];

    useEffect(() => {
        setPlaceholder("");
        setTypingState({ typingIndex: 0, textIndex: 0, isDeleting: false });
    }, []);

    const requestLocation = useCallback(() => {
        if (locationRequested) return;
        setLocationRequested(true);

        // Check if location is already stored in localStorage
        const storedLat = localStorage.getItem("lat");
        const storedLong = localStorage.getItem("long");

        if (storedLat && storedLong) {
            setLat(parseFloat(storedLat));
            setLong(parseFloat(storedLong));
        } else {
            // Request the location if not stored
            
            const fetchIpLocation = async () => {
                try {
                    const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
                    const data = await res.json();
                    if (data.latitude && data.longitude) {
                        setLat(parseFloat(data.latitude));
                        setLong(parseFloat(data.longitude));
                        localStorage.setItem("lat", data.latitude);
                        localStorage.setItem("long", data.longitude);
                    }
                } catch (err) {
                    console.error('IP Geolocation fallback failed:', err);
                }
            };

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const latitude = position.coords.latitude;
                        const longitude = position.coords.longitude;
                        setLat(latitude);
                        setLong(longitude);

                        // Store the location in localStorage
                        localStorage.setItem("lat", latitude);
                        localStorage.setItem("long", longitude);
                    },
                    (error) => {
                        console.error("Browser Geolocation error/denied. Falling back to IP Geolocation.");
                        fetchIpLocation();
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0
                    }
                );
            } else {
                fetchIpLocation();
            }

        }
    }, [locationRequested]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (query.includes('*')) {
            router.push(`/business?q=${query}`);
            return;
        }

        if (/near\s?(me|by)/i.test(query) && lat && long) {
            // Use the router to navigate after handling the submission
            // router.push(`/business?ask=${query}&lat=${lat}&long=${long}`);
            router.push(`/business?q=${query}&lat=${lat}&long=${long}`);
            return;
        }
        router.push(`/business?q=${query}`);
    };

    useEffect(() => {
        const handleTyping = () => {
            const { typingIndex, isDeleting, textIndex } = typingState;

            if (isDeleting) {
                if (typingIndex > 0) {
                    setPlaceholder(currentText.substring(0, typingIndex - 1));
                    setTypingState((prev) => ({ ...prev, typingIndex: prev.typingIndex - 1 }));
                } else {
                    setTypingState((prev) => ({ ...prev, isDeleting: false, textIndex: (prev.textIndex + 1) % textArray.length }));
                }
            } else {
                if (typingIndex < currentText.length) {
                    setPlaceholder(currentText.substring(0, typingIndex + 1));
                    setTypingState((prev) => ({ ...prev, typingIndex: prev.typingIndex + 1 }));
                } else {
                    setTimeout(() => setTypingState((prev) => ({ ...prev, isDeleting: true })), 1000);
                }
            }
        };

        const timeout = setTimeout(handleTyping, typingState.isDeleting ? 100 : 150);
        return () => clearTimeout(timeout);
    }, [typingState, currentText, textArray]);

    return (
        <form action="/business" onSubmit={handleSubmit} className="banner-form m-0">
            <div className="row">
                <div className="col-lg-11 col-md-12 p-0">
                    <div className="form-group">
                        <label>
                            <i className="flaticon-search"></i>
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder={placeholder}
                            name="q"
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={requestLocation}
                        />
                        {/* regix */}
                        {lat && long && /near\s?(me|by)/i.test(query) && (
                            <>
                                <input type="hidden" name="lat" value={lat} />
                                <input type="hidden" name="long" value={long} />
                            </>
                        )}
                    </div>
                </div>
                <div className="col-lg-1 col-md-12 p-0 pe-2 py-2">
                    <div className="submit-btn">
                        <button type="submit" aria-label="Search"><i className="flaticon-search"></i></button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default BusinessSearch;

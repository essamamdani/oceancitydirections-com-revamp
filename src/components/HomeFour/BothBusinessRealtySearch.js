
"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";

import { transformString } from "@/lib/helper";
import { useRouter } from 'next/navigation'
import { useSites } from "@/contexts/SitesContext";


const RealtySearch = () => {
    const { site, loading, error } = useSites();
      if (loading || !site) return null; // Wait until site data is ready
      if (error) {
        console.error("Error loading site data:", error);
        return null;
      }
    const router = useRouter();

    const [searchOption, setSearchOption] = useState('realty');
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
        realty: [
            `Looking for a house under $150,000 in ${county}`,
            `Looking for a 2-bedroom house in ${county}`,
            "Looking for an apartment near me"
        ],
        business: [
            "Find pizza near me",
            "Find a hotel at the beach",
            `Find a shopping center in ${county}`
        ]
    }), [county]);

    const textArray = searchOption === "realty" ? options.realty : options.business;
    const currentText = textArray[typingState.textIndex];

    useEffect(() => {
        setPlaceholder("");
        setTypingState({ typingIndex: 0, textIndex: 0, isDeleting: false });
    }, [searchOption]);

    // find lat long through ip

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
            router.push(`/${searchOption}?q=${query}`);
            return;
        }

        if (/near\s?(me|by)/i.test(query) && lat && long) {
            // Use the router to navigate after handling the submission
            // router.push(`/${searchOption}?ask=${query}&lat=${lat}&long=${long}`);
            router.push(`/${searchOption}?q=${query}&lat=${lat}&long=${long}`);
            return;
        } // missing closing brace was implicit in old code but added explicit return
        
        if (searchOption === 'business') {
            router.push(`/business?q=${query}`);
        } else {
            router.push(`/realty?ask=${query}`);
        }
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
    const handleChangeOption = useCallback((e) => {
        setSearchOption(e.target.value);
    }, []);

    return (

            <section className="home-slider-area">


                <div className="btn-group mt-4 w-1/2" role="group" aria-label="Search options">
                    <input
                        type="radio"
                        className="btn-check"
                        name="searchOption"
                        id="realtyOption"
                        value="realty"
                        checked={searchOption === 'realty'}
                        onChange={handleChangeOption}
                    />
                    <label role="button" className={`rounded-top py-2 px-4 border border-dark ${searchOption === "realty" ? "bg-black text-white" : "bg-secondary text-white"}`} htmlFor="realtyOption">
                        Real Estate for Sale
                    </label>

                    <input
                        type="radio"
                        className="btn-check"
                        name="searchOption"
                        id="businessOption"
                        value="business"
                        checked={searchOption === 'business'}
                        onChange={handleChangeOption}
                    />
                    <label role="button" className={`rounded-top py-2 px-4 border border-dark ${searchOption === "business" ? "bg-black text-white" : "bg-secondary text-white"}`} htmlFor="businessOption">
                        Business Search
                    </label>
                </div>

                 <form action={`/${searchOption}?ask=${query}`} onSubmit={handleSubmit} className="banner-form m-0">
                    <div className="row">
                        <div className="col-lg-11 col-md-12 p-0">
                            <div className="form-group position-relative">
                                <label>
                                    <i className="flaticon-search"></i>
                                </label>
                                <input
                                    type="text"
                                    className="form-control pe-5"
                                    placeholder={placeholder}
                                    name="q"
                                    onChange={(e) => setQuery(e.target.value)}
                                    onFocus={requestLocation}
                                />
                                {/* AI Powered Badge */}
                                <span 
                                    className="position-absolute"
                                    style={{
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        fontSize: '10px',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                        fontWeight: 'bold',
                                        letterSpacing: '0.5px',
                                        zIndex: 10
                                    }}
                                >
                                    ✨ AI Powered
                                </span>
                                {/* {/ regix /} */}
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
            </section>
    );
};

export default RealtySearch;
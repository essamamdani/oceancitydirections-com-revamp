"use client";
import React, { useState, useEffect, useRef } from "react";

const AddressAutocomplete = ({ defaultValue, onPlaceSelected, onInputChange }) => {
    const [inputValue, setInputValue] = useState(defaultValue || "");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef(null);

    // Debounce function
    useEffect(() => {
        const timer = setTimeout(() => {
            if (inputValue && inputValue !== defaultValue && showSuggestions) {
                fetchSuggestions(inputValue);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [inputValue, showSuggestions]);

    // Handle outside click to close suggestions
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);
    
    // Sync with defaultValue changes
    useEffect(() => {
        if (defaultValue) {
             setInputValue(defaultValue);
        }
    }, [defaultValue]);

    const fetchSuggestions = async (input) => {
        try {
            const res = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(input)}`);
            if (res.ok) {
                const data = await res.json();
                setSuggestions(data.predictions || []);
            }
        } catch (error) {
            console.error("Error fetching suggestions:", error);
        }
    };

    const handleSelect = async (prediction) => {
        setInputValue(prediction.description);
        setShowSuggestions(false);
        if (onInputChange) {
             onInputChange(prediction.description);
        }
        
        try {
            const res = await fetch(`/api/places/details?place_id=${prediction.place_id}`);
            if (res.ok) {
                const data = await res.json();
                if (data.result && onPlaceSelected) {
                    // Mimic the Google Maps JS API object structure for compatibility
                    const place = {
                        ...data.result,
                        geometry: {
                            ...data.result.geometry,
                            location: {
                                lat: () => data.result.geometry.location.lat,
                                lng: () => data.result.geometry.location.lng,
                            }
                        }
                    };
                    onPlaceSelected(place);
                }
            }
        } catch (error) {
            console.error("Error fetching details:", error);
        }
    };

    return (
        <div className="position-relative" ref={wrapperRef}>
            <input
                type="text"
                className="form-control"
                placeholder="Enter address"
                value={inputValue}
                onChange={(e) => {
                    setInputValue(e.target.value);
                    setShowSuggestions(true);
                    if (onInputChange) {
                        onInputChange(e.target.value);
                    }
                }}
                onFocus={() => setShowSuggestions(true)}
                autoComplete="off"
            />
            {showSuggestions && suggestions.length > 0 && (
                <ul className="list-group position-absolute w-100 shadow-sm" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                    {suggestions.map((prediction) => (
                        <li
                            key={prediction.place_id}
                            className="list-group-item list-group-item-action cursor-pointer"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleSelect(prediction)}
                        >
                            {prediction.description}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AddressAutocomplete;

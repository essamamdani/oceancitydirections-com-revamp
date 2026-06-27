"use client";

import React, { useRef, useState, useEffect } from "react";
import { postData } from "@/lib/server-actions";
import { useSites } from "@/contexts/SitesContext";
import { getSiteName } from "@/lib/helper";

export const revalidate = 10368000; // 4 months in seconds

const data = {
    title: "What's my home worth?",
    subtitle: "Instant Estimated Market Valuation",
    content: `Use our free market valuation tool for the Greater %SITE_NAME% area`,
    questionGroups: [
        {
            title: "Your Free Home Report Includes:",
            questions: [
                {
                    title: "Estimated Market Value",
                    content:
                        "The estimated value shown for a subject property is based on one of the most accurate Automated Valuation Models, or AVMs, in the business.",
                },
                {
                    title: "Estimated Value Range",
                    content:
                        "Because changing market conditions can affect any price point, we also supply an estimated value range.",
                },
                {
                    title: "Confidence Level",
                    content:
                        "Depending on the available data, some estimates are going to be more accurate than others.",
                },
                {
                    title: "Rate of Change over Month and Year",
                    content:
                        "In a fast-changing market, it's interesting to see how a property's value has changed over the last month and year.",
                },
            ],
        },
    ],
};
const groupByN = (n, data) => {
    const result = [];
    for (let i = 0; i < data.length; i += n) {
        result.push(data.slice(i, i + n));
    }
    return result;
};
export default function Page() {
    const { site } = useSites();
    const siteName = site ? getSiteName(site) : 'Realty Directions';
    const shortName = siteName.replace("Directions", "").trim();
    const displayContent = data.content.replace('%SITE_NAME%', shortName);

    const autoCompleteRef = useRef(null);
    const sessionToken = useRef(null);
    const [form, setForm] = useState({
        task: true,
        remarks: "",
        address: "",
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
    });

    const [submitted, setSubmitted] = useState(false);
    const [predictions, setPredictions] = useState([]);
    const [showPredictions, setShowPredictions] = useState(false);

    useEffect(() => {
        if (typeof google !== 'undefined' && google.maps && google.maps.places) {
            autoCompleteRef.current = new google.maps.places.AutocompleteService();
            sessionToken.current = new google.maps.places.AutocompleteSessionToken();
        }
    }, []);

    const updateFormData = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddressInput = (value) => {
        updateFormData('address', value);

        if (value.length > 2) {
            autoCompleteRef.current?.getPlacePredictions(
                {
                    input: value,
                    sessionToken: sessionToken.current,
                    componentRestrictions: { country: 'us' },
                },
                (predictions, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                        setPredictions(predictions);
                        setShowPredictions(true);
                    }
                }
            );
        } else {
            setPredictions([]);
            setShowPredictions(false);
        }
    };

    const handleSelectAddress = (prediction) => {
        updateFormData('address', prediction.description);
        setPredictions([]);
        setShowPredictions(false);
    };

    return (
        <>
           
            <section className="hero py-5 py-lg-7 rd-sell-page">
                <div className="container">
                    <h1 className="text-center hero-heading mb-4">{data.title}</h1>
                    <p className="text-center lead mb-5">{displayContent}</p>
                    <div className="row">
                        <div className="col-md-6 mx-auto">
                            {!submitted ? (
                                <form className="rd-sell-form" action={'https://www.valuedirections.com'} >
                                    <div className="form-group">
                                        <label>
                                            
                                            <strong>
                                                <span className="text-primary">*</span> What is your
                                                address?
                                            </strong>
                                            
                                        </label>
                                        <input type="hidden" name="referrer" value={`www.${site?.slug || 'oceancity'}directions`} />
                                        <input
                                            className="form-control"
                                            placeholder="Enter your address *"
                                            name={'address'}
                                            onChange={(e) => handleAddressInput(e.target.value)}
                                            onFocus={() => setShowPredictions(true)}
                                            value={form.address}
                                            required
                                        />
                                        {showPredictions && predictions.length > 0 && (
                                            <div className="absolute z-10 w-full bg-white mt-1 rounded-lg shadow-lg border border-gray-200">
                                                {predictions.map((prediction) => (
                                                    <div
                                                        key={prediction.place_id}
                                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                        onClick={() => handleSelectAddress(prediction)}
                                                    >
                                                        {prediction.description}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group mt-3">
                                        <button type="submit" className="default-btn w-100">
                                            Submit
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="text-success">
                                    <h4>Thank you for submitting your details!</h4>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xl-8 mx-auto">
                            <div id="sell_widget" className="w-100 overflow-y-auto" />
                        </div>
                    </div>
                </div>
            </section>
            <section className="py-6">
                <div className="container">
                    {data.questionGroups &&
                        data.questionGroups.map((group) => {
                            const groupedQuestions = groupByN(2, group.questions || []);
                            return (
                                <div key={group.title} className="py-4">
                                    <h2 className="mb-5 text-primary">{group.title}</h2>
                                    <div className="row">
                                        {groupedQuestions.map((questions, index) => (
                                            <div className="col-md-6" key={index}>
                                                {questions.map((question) => (
                                                    <React.Fragment key={question.title}>
                                                        <h5>{question.title}</h5>
                                                        <p className="text-muted mb-4">
                                                            {question.content}
                                                        </p>
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </section>
        </>
    );
}

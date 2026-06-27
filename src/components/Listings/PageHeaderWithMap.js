"use client";

import React from "react";
import PopularPlacesFilter from "@/components/Common/PopularPlacesFilter";
import Map from "@/components/CustomComponents/PatchMap";
const PageHeaderWithMap = ({ geoJson }) => {
    return (
        <>
            <div className="page-title-bg map-home-area">
                <div id="main-full-map" className="full-width-map">
                    <Map geoJson={geoJson} />
                </div>

                <PopularPlacesFilter />
            </div>
        </>
    );
};

export default PageHeaderWithMap;

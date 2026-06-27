"use client";
  
import React from "react"; 
import { GoogleMapsEmbed } from '@next/third-parties/google'

const GoogleMap = () => {
  return (
    <>
      <div id='map'>
        <GoogleMapsEmbed
          apiKey={process.env.NEXT_PUBLIC_MAP_API}
          height="300px"
          width="100%"
          mode="place"
          loading="lazy"
          zoom={15}
          q={"175 5th Ave, New York, NY 10010, USA"}
        />
      </div>
    </>
  )
}

export default GoogleMap;

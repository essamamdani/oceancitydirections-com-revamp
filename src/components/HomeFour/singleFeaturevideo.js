"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const SingleFeaturedVideo = ({ video }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const text = "Video";
  const embedUrl = `${process.env.NEXT_PUBLIC_VIDEO_HOME_URL}/embed/${video.video_id}`;
  
  return (
    <div className={"my-5"}>
      <div className="container">
        <div className="section-title text-left">
          <h2>Featured {text}</h2>
          <Link href={process.env.NEXT_PUBLIC_VIDEO_HOME_URL} className="link-btn">
            More Videos <i className="flaticon-right-chevron"></i>
          </Link>
        </div>
        <div className="row">
          <div className="col-12" >
            <div className="single-blog-post">
              
              {isPlaying ? (
                // INLINE VIDEO PLAYER
                <div className="video-player-wrapper position-relative" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                  <div className="ratio ratio-16x9" style={{ minHeight: '450px' }}>
                    <iframe
                      src={embedUrl}
                      allow="autoplay; fullscreen"
                      allowFullScreen
                      className="w-100 h-100"
                      style={{ border: 'none', borderRadius: '8px' }}
                    ></iframe>
                  </div>
                  <button
                    className="btn btn-sm btn-dark position-absolute"
                    style={{ top: '10px', right: '10px', zIndex: 10, borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => setIsPlaying(false)}
                    title="Close video"
                  >
                    <i className="bx bx-x"></i>
                  </button>
                </div>
              ) : (
                // THUMBNAIL WITH PLAY BUTTON
                <div className="about-image position-relative">
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    width={400}
                    height={225}
                    className="w-100"
                    style={{ height: '450px', objectFit: 'cover' }}
                  />
                  <button 
                    className="video-btn d-flex justify-content-center align-items-center" 
                    onClick={() => setIsPlaying(true)}
                  >
                    <i className="bx bx-play"></i>
                  </button>
                </div>
              )}

              <div className="post-content">
                <h3>{video.title.replace('.mp4', '').replace('.mov', '')}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleFeaturedVideo;

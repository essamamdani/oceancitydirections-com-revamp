// "use client";

// import React, { useState, useEffect } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import FsLightbox from "fslightbox-react";

// const FeaturedVideo = ({ videos, single = false }) => {
//   const [toggler, setToggler] = useState(false);
//   const [selectedVideoId, setSelectedVideoId] = useState(null);
//   const count = videos.length;
//   const text = count > 1 ? "Videos" : "Video";
  
//   useEffect(() => {
//     logger.log(toggler, selectedVideoId)
//   }, [toggler, selectedVideoId])

//   const openLightbox = (videoId) => {
//     setToggler(!toggler);
//     setSelectedVideoId(`${process.env.NEXT_PUBLIC_VIDEO_HOME_URL}/embed/${videoId}`.trim());
//   }

//   return (
//     <>
//       <div className={single ? "my-5" : "blog-area bg-f9f9f9 ptb-100"}>
//         <div className="container">
//           <div className="section-title text-left">
//             <h2>Featured {text}</h2>
//             <Link href={process.env.NEXT_PUBLIC_VIDEO_HOME_URL || "#"} className="link-btn">
//               More Videos <i className="flaticon-right-chevron"></i>
//             </Link>
//           </div>
//           <div className="row">
//             {videos.map((video, idx) => (
//               <div className={
//                 count === 1 ? "col-12" :
//                 count === 2 ? "col-6" :
//                 "col-lg-6 col-sm-12 col-md-12"
//               } key={idx}>
//                 <div className="single-blog-post">
//                   <div className="about-image">
//                     <Image
//                       src={video.thumbnail}
//                       alt="image"
//                       width={400}
//                       height={225}
//                       style={{ width: '100%', height: '450px', objectFit: 'cover' }}
//                     />
//                     <div className="video-btn" onClick={() => openLightbox(video.video_id)}>
//                       <i className="bx bx-play"></i>
//                     </div>
//                   </div>

//                   <div className="post-content">

//                     <h3>{video.title.replace('.mp4', '').replace('.mov','')}</h3>
//                     {/* <Link href="single-blog-1" className="link-btn">
//                       <i className="flaticon-right-arrow"></i>
//                     </Link> */}
//                   </div>
//                 </div>
//               </div>))}
//           </div>
//         </div>
//       </div>
//       {toggler && <FsLightbox
//         toggler={toggler}
//         sources={
//           [
//             <iframe src={selectedVideoId}
//               key={selectedVideoId}
//               data-video-id={selectedVideoId}
//               width="1920px" 
//               height="1080px"
//               frameBorder="0"
//               allow="autoplay; fullscreen"
//               allowFullScreen />
//           ]
//         }
//       />}
//     </>
//   );
// };

// const SingleFeaturedVideo = ({ videos, single = false }) => {
//   const [toggler, setToggler] = useState(false);
//   const [selectedVideoId, setSelectedVideoId] = useState(null);
//   const count = videos.length;
//   const text = count > 1 ? "Videos" : "Video";

//   const openLightbox = (videoId) => {
//     setSelectedVideoId(videoId);
//     setToggler(!toggler);
//   }

//   return (
//     <>
//       <div className={single ? "my-5" : "blog-area bg-f9f9f9 ptb-100"}>
//         <div className="container">
//           <div className="section-title text-left">
//             <h2>Featured {text}</h2>
//             <Link href={process.env.NEXT_PUBLIC_VIDEO_HOME_URL || "#"} className="link-btn">
//               More Videos <i className="flaticon-right-chevron"></i>
//             </Link>
//           </div>
//           <div className="row">
//             {videos.map((video, idx) => (
//               <div className={
//                 count === 1 ? "col-12" :
//                 count === 2 ? "col-6" :
//                 "col-lg-4 col-md-6"
//               } key={idx}>
//                 <div className="single-blog-post">
//                   <div className="about-image">
//                     <Image
//                       src={video.thumbnail}
//                       alt="image"
//                       width={400}
//                       height={225}
//                       style={{ width: '100%', height: '450px', objectFit: 'cover' }}
//                     />
//                     <div className="video-btn" onClick={() => openLightbox(video.video_id)}>
//                       <i className="bx bx-play"></i>
//                     </div>
//                   </div>

//                   <div className="post-content">

//                     <h3>{video.title.replace('.mp4', '')}</h3>
//                     {/* <Link href="single-blog-1" className="link-btn">
//                       <i className="flaticon-right-arrow"></i>
//                     </Link> */}
//                   </div>
//                 </div>
//               </div>))}
//           </div>
//         </div>
//       </div>
//       <FsLightbox
//         toggler={toggler}
//         sources={
//           [
//             selectedVideoId ? <iframe src={`${process.env.NEXT_PUBLIC_VIDEO_HOME_URL}/embed/${selectedVideoId}`} width="1920px"
//               key={selectedVideoId}
//               height="1080px"
//               frameBorder="0"
//               allow="autoplay; fullscreen"
//               allowFullScreen /> : null
//           ]
//         }
//       />
//     </>
//   );
// };

// export default FeaturedVideo;

"use client";

import React, { useState } from "react";
import logger from '@/lib/logger'

import Link from "next/link";
import Image from "next/image";

const FeaturedVideo = ({ videos, single = false }) => {
  const [show, setShow] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState(null);

  const openModal = (videoId) => {
    const url = `${process.env.NEXT_PUBLIC_VIDEO_HOME_URL}/embed/${videoId}`;
    setSelectedVideoUrl(url);
    setShow(true);
  };

  return (
    <>
      <div className={single ? "my-5" : "blog-area bg-f9f9f9 ptb-100"}>
        <div className="container">
          <div className="section-title text-left d-flex justify-content-between">
            <h2>Featured {videos.length > 1 ? "Videos" : "Video"}</h2>

            <Link
              href={process.env.NEXT_PUBLIC_VIDEO_HOME_URL || "#"}
              className="link-btn"
            >
              More Videos <i className="flaticon-right-chevron"></i>
            </Link>
          </div>

          <div className="row">
            {videos.map((video, idx) => (
              <div
                key={idx}
                className={
                  videos.length === 1
                    ? "col-12"
                    : videos.length === 2
                    ? "col-6"
                    : "col-lg-6 col-md-12 col-sm-12"
                }
              >
                <div className="single-blog-post">
                  <div className="about-image position-relative">
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      width={400}
                      height={225}
                      className="w-100"
                      style={{
                        height: "450px",
                        objectFit: "cover",
                      }}
                    />

                    <button
                      className="video-btn d-flex justify-content-center align-items-center"
                      onClick={() => openModal(video.video_id)}
                    >
                      <i className="bx bx-play"></i>
                    </button>
                  </div>

                  <div className="post-content">
                    <h3>{video.title.replace(".mp4", "").replace(".mov", "")}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {show && (
        <div className="rd-video-modal" role="dialog" aria-modal="true" aria-label="Featured video">
          <button
            type="button"
            onClick={() => setShow(false)}
            className="rd-video-modal-close"
            aria-label="Close video"
          >
            &#x2715;
          </button>
          <div className="rd-video-modal-frame">
            {selectedVideoUrl && (
              <iframe
                src={selectedVideoUrl}
                title="Featured video"
                allow="autoplay; fullscreen"
                allowFullScreen
              ></iframe>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FeaturedVideo;

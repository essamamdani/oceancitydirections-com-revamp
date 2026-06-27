
"use client";
import React, { useState } from "react";
import { GoogleMapsEmbed } from '@next/third-parties/google'
import Link from "next/link";
import Image from "next/image";
import Sidebar from "../Listings/Sidebar";

const ListingsWithMap = ({ businesses }) => {
  // State for current page and number of records per page
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 2;

  // Calculate total pages
  const totalPages = Math.ceil(businesses.length / recordsPerPage);

  // Get current records based on pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentBusinesses = businesses.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Helper function to generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const range = 2; // Number of pages to show around the current page

    // Always show the first page
    if (totalPages > 1) pages.push(1);

    // Add ellipses if there's a gap between the first page and current page
    if (currentPage > 4) {
      pages.push('...');
    }

    // Show the range around the current page
    for (let i = Math.max(2, currentPage - range); i <= Math.min(currentPage + range, totalPages - 1); i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    // Add ellipses if there's a gap between the current page and the last page
    if (currentPage < totalPages - 3) {
      pages.push('...');
    }

    // Always show the last page
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <>
      <div className="listings-area ptb-100">
        <div className="container-fluid">
          <div className="row m-0">
            <div className="col-xl-8 col-lg-12 col-md-12 p-0">
              <div className="row">
                <div className="col-lg-4 col-md-12">
                  <Sidebar />
                </div>

                <div className="col-lg-8 col-md-12">
                  <div className="all-listings-list">
                    <div className="listings-grid-sorting row align-items-center">
                      <div className="col-lg-5 col-md-6 result-count">
                        <p>
                          <span className="count">
                            {businesses.length}
                          </span>{" "}
                          Results
                        </p>
                      </div>

                      <div className="col-lg-7 col-md-6 ordering">
                        <div className="d-flex justify-content-end">
                          <div className="select-box">
                            <label>Sort By:</label>
                            <select className="blog-select">
                              <option>Recommended</option>
                              <option>Default</option>
                              <option>Popularity</option>
                              <option>Latest</option>
                              <option>Price: low to high</option>
                              <option>Price: high to low</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      {currentBusinesses.map((business, index) => (
                        <div className="col-xl-6 col-lg-6 col-md-6" key={business.id}>
                          <div className="single-listings-box">
                            <div className="listings-image">
                              <Image
                                src={`/api/og?title=${encodeURIComponent(business?.title || 'Business')}`}
                                alt="image"
                                width={790}
                                height={250}
                                style={{ objectFit: "cover", height: "250px" }}
                                priority={index < 4}
                              />
                              <Link
                                href={`/s/${business.slug}`}
                                className="link-btn"
                              ></Link>
                              <button type="button" className="bookmark-save" aria-label="Save bookmark">
                                <i className="flaticon-heart"></i>
                              </button>
                              <button type="button" className="category" aria-label="Category">
                                <i className="flaticon-cooking"></i>
                              </button>
                            </div>

                            <div className="listings-content">
                              <ul className="listings-meta">
                                <li>
                                  <Link href={`/s/${business.slug}`}>
                                    <i className="flaticon-furniture-and-household"></i>
                                    Restaurant
                                  </Link>
                                </li>
                                <li>
                                  <Link href="#">
                                    <i className="flaticon-pin"></i>
                                    {business.address}
                                  </Link>
                                </li>
                              </ul>
                              <h3>
                                <Link href={`/s/${business.slug}`}>
                                  {business.title}
                                </Link>
                              </h3>
                              <span className="status">
                                <i className="flaticon-save"></i> Open Now
                              </span>
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="rating">
                                  <i className="bx bxs-star"></i>
                                  <i className="bx bxs-star"></i>
                                  <i className="bx bxs-star"></i>
                                  <i className="bx bxs-star"></i>
                                  <i className="bx bxs-star"></i>
                                  <span className="count">
                                    {business.votes_count}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center justify-center px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700"
                      >
                        Previous
                      </button>

                      {pageNumbers.map((number, index) => (
                        <button
                          key={index}
                          onClick={() => number !== '...' && paginate(number)}
                          className={`flex items-center justify-center px-3 py-2 leading-tight border border-gray-300 hover:bg-gray-100 hover:text-gray-700 ${
                            number === currentPage
                              ? "text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700"
                              : "text-gray-500 bg-white"
                          }`}
                          disabled={number === '...'}
                        >
                          {number}
                        </button>
                      ))}

                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center justify-center px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-lg-12 col-md-12 p-0">
              <div className="map-container fw-map side-full-map">
                <div id="main-full-map">
                  <GoogleMapsEmbed
                    apiKey={process.env.NEXT_PUBLIC_MAP_API}
                    height="100%"
                    width="100%"
                    mode="place"
                    loading="lazy"
                    zoom={14}
                    q={"121 King St, Melbourne VIC 3000, Australia"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ListingsWithMap;
// "use client";
// import React from "react";
// import Link from "next/link";
// import Image from "next/image";
// import Sidebar from "../Listings/Sidebar";

// const ListingsWithMap = ({ businesses }) => {
//   return (
//     <>
//       <div className="listings-area ptb-100">
//         <div className="container-fluid">
//           <div className="row m-0">
//             <div className="col-xl-8 col-lg-12 col-md-12 p-0">
//               <div className="row">
//                 <div className="col-lg-4 col-md-12">
//                   <Sidebar />
//                 </div>

//                 <div className="col-lg-8 col-md-12">
//                   <div className="all-listings-list">
//                     <div className="listings-grid-sorting row align-items-center">
//                       <div className="col-lg-5 col-md-6 result-count">
//                         <p>
//                           <span className="count">
//                             {businesses.length}
//                           </span>{" "}
//                           Results
//                         </p>
//                       </div>

//                       <div className="col-lg-7 col-md-6 ordering">
//                         <div className="d-flex justify-content-end">
//                           <div className="select-box">
//                             <label>Sort By:</label>
//                             <select className="blog-select">
//                               <option>Recommended</option>
//                               <option>Default</option>
//                               <option>Popularity</option>
//                               <option>Latest</option>
//                               <option>Price: low to high</option>
//                               <option>Price: high to low</option>
//                             </select>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="row">
//                       {businesses.map((business) => (
//                         <div className="col-xl-6 col-lg-6 col-md-6" key={business.id}>
//                           <div className="single-listings-box">
//                             <div className="listings-image">
//                               <Image
//                                 src={business?.mainImage}
//                                 alt="image"
//                                 width={790}
//                                 height={250}
//                                 style={{ objectFit: "cover", height: "250px" }}
//                               />
//                               <Link
//                                 href={`/s/${business.slug}`}
//                                 className="link-btn"
//                               ></Link>
//                               <button type="button" className="bookmark-save" aria-label="Save bookmark">
//                                 <i className="flaticon-heart"></i>
//                               </button>
//                               <button type="button" className="category" aria-label="Category">
//                                 <i className="flaticon-cooking"></i>
//                               </button>
//                             </div>

//                             <div className="listings-content">
//                               <ul className="listings-meta">
//                                 <li>
//                                   <Link href={`/s/${business.slug}`}>
//                                     <i className="flaticon-furniture-and-household"></i>
//                                     Restaurant
//                                   </Link>
//                                 </li>
//                                 <li>
//                                   <Link href="#">
//                                     <i className="flaticon-pin"></i>
//                                     {business.address}
//                                   </Link>
//                                 </li>
//                               </ul>
//                               <h3>
//                                 <Link href={`/s/${business.slug}`}>
//                                   {business.title}
//                                 </Link>
//                               </h3>
//                               <span className="status">
//                                 <i className="flaticon-save"></i> Open Now
//                               </span>
//                               <div className="d-flex align-items-center justify-content-between">
//                                 <div className="rating">
//                                   <i className="bx bxs-star"></i>
//                                   <i className="bx bxs-star"></i>
//                                   <i className="bx bxs-star"></i>
//                                   <i className="bx bxs-star"></i>
//                                   <i className="bx bxs-star"></i>
//                                   <span className="count">
//                                     {business.votes_count}
//                                   </span>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="col-xl-4 col-lg-12 col-md-12 p-0">
//               <div className="map-container fw-map side-full-map">
//                 <div id="main-full-map">
//                   <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.8385385572983!2d144.95358331584498!3d-37.81725074201705!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d4dd5a05d97%3A0x3e64f855a564844d!2s121%20King%20St%2C%20Melbourne%20VIC%203000%2C%20Australia!5e0!3m2!1sen!2sbd!4v1612419490850!5m2!1sen!2sbd"></iframe>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default ListingsWithMap;

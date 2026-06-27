import React from "react";
import Link from "next/link";
import Image from "next/image";

function isNewBusiness(createdAt) {
  if (!createdAt) return false;
  const diffDays = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 30;
}

const ListingAreaTwo = ({ title, categoryLink, bgColor, paddingBottom70, businesses, category }) => {

  function renderStarRating(rating = 0) {

    const fullStars = Math.floor(rating); // Number of fully filled stars
    const hasHalfStar = rating - fullStars >= 0.05; // True if there's a half star
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0); // Remaining empty stars

    return (
      <>
        {[...Array(fullStars)].map((_, index) => (
          <i key={`full-${index}`} className="bx bxs-star checked"></i> // Filled stars
        ))}
        {hasHalfStar && <i key="half" className="bx bxs-star-half checked"></i>}
        {[...Array(emptyStars)].map((_, index) => (
          <i key={`empty-${index}`} className="bx bx-star "></i> // Empty stars
        ))}
      </>
    );
  }

  return (
    <>
      <section className={`listings-area pt-100 ${paddingBottom70} ${bgColor}`}>
        <div className="container">

          <div className="section-title text-left">
            <h2>{title}</h2>
            <Link href={categoryLink} className="link-btn">
              Show All <i className="flaticon-right-chevron"></i>
            </Link>
          </div>
          <div className="row">
            {/* Check if there are any restaurants to display */}
            {businesses?.slice(0, 6).map((business) => (
              <div key={business.slug} className="col-xl-4 col-lg-6 col-md-6">
                <div className="single-listings-box">
                  <div className="listings-image">
                    <Image
                      style={{objectFit: "cover", height: "250px"}}
                      src={`/api/og?title=${encodeURIComponent(business?.title || 'Business')}`}
                      alt="image"
                      width={790}
                      height={525}
                      
                    />

                    <Link href={`/s/${business.slug}`} className="link-btn" aria-label={`View details for ${business?.title || 'business'}`}></Link>

                    <button type="button" className="bookmark-save" aria-label="Save bookmark">
                      <i className="flaticon-heart"></i>
                    </button>

                    <button type="button" className="category" aria-label="Category">
                      <i className="flaticon-cooking"></i>
                    </button>
                  </div>

                  <div className="listings-content">
                    <ul className="listings-meta">
                      {category && <li>
                        <Link href={`/business/category/${business.categories?.name}`}>
                          <i className="flaticon-furniture-and-household"></i>
                          {business?.categories?.name}
                        </Link>
                      </li>}
                      <li>
                        <Link href={`/business/location/${business.state}/${business.city}`}>
                          <i className="flaticon-pin"></i> {business?.city}, {business?.state}
                        </Link>
                      </li>
                    </ul>
                    <h3>
                      <Link href={`/s/${business.slug}`}>{business?.title}</Link>
                    </h3>
                    {isNewBusiness(business.created_at) && (
                      <span className="status" style={{ background: '#17a2b8', color: '#fff', borderColor: '#17a2b8' }}>
                        <i className="bx bx-star"></i> New
                      </span>
                    )}
                    {/* <div className="rating d-flex align-items-center">
                      <i>
                        {renderStarRating(business?.rating?.value)}
                      </i>
                      <span className="rating-count m-2">
                        {business?.rating?.value}
                      </span>
                    </div> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default ListingAreaTwo;
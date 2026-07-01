import Link from "next/link";
import Image from "next/image";
import { getNearestBusinesses } from "@/app/actions/nearest-businesses";

export default async function NoRecordFound({ params, site }) {
  const slug = params?.slug || [];
  const catIndex = slug.indexOf("category");

  const locationParts = catIndex !== -1 ? slug.slice(0, catIndex) : slug;
  const categoryParts = catIndex !== -1 ? slug.slice(catIndex + 1) : [];

  const [county, city, zip] = locationParts;
  const [category, subcategory] = categoryParts;

  // Fetch nearest businesses from the same area
  const nearestBusinesses = await getNearestBusinesses(
    site,
    county,
    city,
    category,
    6
  );

  // Generate contextual suggestions based on the current filters
  const suggestions = [];
  
  if (county) {
    suggestions.push({
      label: `Browse all of ${county.replace(/-/g, " ")}`,
      href: `/business/location/${county.toLowerCase()}`,
    });
  }
  if (category) {
    suggestions.push({
      label: `Browse all ${category.replace(/-/g, " ")} listings`,
      href: `/business/category/${category.toLowerCase()}`,
    });
  }
  if (city) {
    suggestions.push({
      label: `Browse ${city.replace(/-/g, " ")}`,
      href: `/business/location/${county?.toLowerCase()}/${city.toLowerCase()}`,
    });
  }

  return (
    <div className="no-records-found">
      {/* Main Message */}
      <div className="text-center py-5">
        <div className="mb-4">
          <i 
            className="bx bx-search-alt"
            style={{ 
              fontSize: "4rem", 
              color: "var(--mainColor)",
              opacity: 0.6 
            }}
          ></i>
        </div>
        <h3 className="mb-3" style={{ color: "var(--blackColor)" }}>
          No Records Found
        </h3>
        <p className="text-muted mb-4" style={{ fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto" }}>
          We couldn&apos;t find any results for your search. 
          {nearestBusinesses.length > 0 
            ? " Here are some nearby businesses you might be interested in:" 
            : " Try one of these alternatives:"}
        </p>

        {/* Suggestion Buttons */}
        {suggestions.length > 0 && (
          <div className="row justify-content-center mb-5">
            {suggestions.map((s, i) => (
              <div className="col-12 col-md-4 mb-3" key={i}>
                <Link 
                  href={s.href} 
                  className="btn btn-outline-primary w-100 py-3"
                  style={{
                    borderColor: "var(--mainColor)",
                    color: "var(--mainColor)",
                    borderRadius: "8px",
                    fontWeight: "500",
                    transition: "all 0.3s ease"
                  }}
                >
                  <i className="bx bx-right-arrow-alt me-2"></i>
                  {s.label}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nearest Businesses Section */}
      {nearestBusinesses.length > 0 && (
        <div className="nearest-businesses mt-5">
          <div className="section-title text-center mb-4">
            <h4 style={{ color: "var(--blackColor)" }}>
              <i className="bx bx-map-pin me-2" style={{ color: "var(--mainColor)" }}></i>
              Nearby Businesses
            </h4>
            <p className="text-muted">
              Found in {county ? county.replace(/-/g, " ") : "your area"}
            </p>
          </div>

          <div className="row">
            {nearestBusinesses.map((business, index) => {
              const listingImg = business.main_image;
              const isCdn = listingImg && 
                (listingImg.startsWith('http') || listingImg.includes('cdn')) && 
                !listingImg.startsWith('/api/og') && 
                !listingImg.includes('placeholder') &&
                listingImg !== '/images/about-img.jpg';
              return (
              <div className="col-lg-4 col-md-6 col-sm-12 mb-4" key={business.id}>
                <div 
                  className="business-card h-100"
                  style={{
                    background: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    border: "1px solid #eee"
                  }}
                >
                  <Link
                    href={`/s/${business.update_slug || business.slug}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {/* Image */}
                    <div style={{ position: "relative", height: "200px", overflow: "hidden" }}>
                      {isCdn ? (
                        <Image
                          src={listingImg}
                          alt={business.title}
                          fill
                          style={{ objectFit: "cover" }}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className={`biz-logo logo-${index % 4}`} style={{ height: '200px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {business.title}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-3">
                      <h5 
                        style={{ 
                          color: "var(--blackColor)", 
                          fontWeight: "600",
                          marginBottom: "8px",
                          fontSize: "1.1rem"
                        }}
                      >
                        {business.title}
                      </h5>
                      
                      <p className="text-muted mb-2" style={{ fontSize: "0.9rem" }}>
                        <i className="bx bx-map me-1" style={{ color: "var(--mainColor)" }}></i>
                        {business.city}, {business.state}
                      </p>
                      
                      {business.categories?.name && (
                        <span 
                          style={{
                            background: "rgba(var(--mainColorRGB), 0.1)",
                            color: "var(--mainColor)",
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "0.8rem",
                            fontWeight: "500",
                            display: "inline-block"
                          }}
                        >
                          {business.categories.name}
                        </span>
                      )}
                      
                      {business.phone && (
                        <p className="mt-2 mb-0" style={{ fontSize: "0.85rem" }}>
                          <i className="bx bx-phone me-1" style={{ color: "var(--mainColor)" }}></i>
                          {business.phone}
                        </p>
                      )}
                    </div>
                  </Link>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="text-center mt-5 pt-4" style={{ borderTop: "1px solid #eee" }}>
        <p className="text-muted mb-3">
          Can&apos;t find what you&apos;re looking for?
        </p>
        <div className="d-flex justify-content-center gap-3">
          <Link 
            href="/" 
            className="default-btn"
            style={{
              background: "var(--mainColor)",
              color: "#fff",
              padding: "12px 30px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "500",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <i className="bx bx-home"></i>
            Back to Homepage
          </Link>
          
          <Link 
            href="/business" 
            className="btn btn-outline-primary"
            style={{
              borderColor: "var(--mainColor)",
              color: "var(--mainColor)",
              padding: "12px 30px",
              borderRadius: "8px",
              fontWeight: "500",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <i className="bx bx-building"></i>
            Browse All Businesses
          </Link>
        </div>
      </div>
    </div>
  );
}

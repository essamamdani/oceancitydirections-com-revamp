"use client";
import { useSites } from "@/contexts/SitesContext";
import { getSiteName } from "@/lib/helper";

const HowItWorks = ({ bgColor }) => {
  const { site } = useSites();
  const siteName = site ? getSiteName(site) : (process.env.NEXT_PUBLIC_SITE_NAME || 'Realty Directions');
  const shortName = siteName.replace("Directions", "").trim();

  return (
    <>
      <section className={`how-it-works-area pt-100 pb-70 ${bgColor}`}>
        <div className="container">
          <div className="section-title">
            <h2>Get the Total Picture of Property + Business + Community</h2>
            <p>
              Search {shortName} for property listings, local businesses, and community events
            </p>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-4 col-md-6 col-sm-6">
              <div className="single-how-it-works-box">
                <div className="icon">
                  <i className="flaticon-placeholder"></i>
                </div>
                <h3>Search Property</h3>
                <p>
                Find property in the {shortName} area and get notified when new listings hit the market
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 col-sm-6">
              <div className="single-how-it-works-box">
                <div className="icon">
                  <i className="flaticon-support-1"></i>
                </div>
                <h3>Find Local {shortName} Area Businesses</h3>
                <p>
                Find local shops and other service providers in the {shortName} region
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 col-sm-6">
              <div className="single-how-it-works-box">
                <div className="icon">
                  <i className="flaticon-tick"></i>
                </div>
                <h3>Community</h3>
                <p>
                Contribute your thoughts and find community events in the {shortName} and surrounding areas
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HowItWorks;

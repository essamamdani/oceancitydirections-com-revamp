import Link from "next/link";

const Category = ({ titleOne, titleTwo }) => {
  return (
    <>
      <section className="category-area pt-100 pb-70">
        <div className="container">
          {titleOne ? (
            <div className="section-title">
              <h2>Popular Categories</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis
                ipsum suspendisse ultrices gravida. Risus commodo viverra.
              </p>
            </div>
          ) : titleTwo ? (
            <div className="section-title text-left">
              <h2>Explore by Business Category</h2>
              <Link href={`/business`} className="link-btn">
                Show All <i className="flaticon-right-chevron"></i>
              </Link>
            </div>
          ) : (
            ""
          )}

          <div className="row">
            <div className="col-lg-2 col-sm-6 col-md-4">
              <div className="single-category-box">
                <div className="icon">
                  <i className="flaticon-cooking"></i>
                </div>
                <h3>Restaurant</h3>
                {/* <span>16 Places</span> */}
                <Link
                  href={`/business/category/restaurant`}
                  className="link-btn"
                  aria-label={`Browse ${'restaurant'.replace(/\b\w/g, c => c.toUpperCase())} category`}
                ></Link>
              </div>
            </div>

            <div className="col-lg-2 col-sm-6 col-md-4">
              <div className="single-category-box">
                <div className="icon">
                  <i className="flaticon-hotel"></i>
                </div>
                <h3>Hotel</h3>
                {/* <span>42 Places</span> */}
                <Link
                  href={`/business/category/hotel`}
                  className="link-btn"
                  aria-label={`Browse ${'hotel'.replace(/\b\w/g, c => c.toUpperCase())} category`}
                ></Link>
              </div>
            </div>

            <div className="col-lg-2 col-sm-6 col-md-4">
              <div className="single-category-box">
                <div className="icon">
                  <i className="flaticon-exercise"></i>
                </div>
                <h3>Fitness</h3>
                {/* <span>11 Places</span> */}
                <Link
                  href={`/business/category/fitness center`}
                  className="link-btn"
                  aria-label={`Browse ${'fitness center'.replace(/\b\w/g, c => c.toUpperCase())} category`}
                ></Link>
              </div>
            </div>

            <div className="col-lg-2 col-sm-6 col-md-4">
              <div className="single-category-box">
                <div className="icon">
                  <i className="flaticon-commerce"></i>
                </div>
                <h3>Shopping</h3>
                {/* <span>24 Places</span> */}
                <Link
                  href={`/business/category/shopping mall`}
                  className="link-btn"
                  aria-label={`Browse ${'shopping mall'.replace(/\b\w/g, c => c.toUpperCase())} category`}
                ></Link>
              </div>
            </div>

            <div className="col-lg-2 col-sm-6 col-md-4">
              <div className="single-category-box">
                <div className="icon">
                  <i className="flaticon-cleansing"></i>
                </div>
                <h3>Beauty & Spa</h3>
                {/* <span>8 Places</span> */}
                <Link
                  href={`/business/category/beautician`}
                  className="link-btn"
                  aria-label={`Browse ${'beautician'.replace(/\b\w/g, c => c.toUpperCase())} category`}
                ></Link>
              </div>
            </div>

            <div className="col-lg-2 col-sm-6 col-md-4">
              <div className="single-category-box">
                <div className="icon">
                  <i className="flaticon-calendar"></i>
                </div>
                <h3>Events</h3>
                {/* <span>12 Places</span> */}
                <Link
                  href={`/business/category/event planner`}
                  className="link-btn"
                  aria-label={`Browse ${'event planner'.replace(/\b\w/g, c => c.toUpperCase())} category`}
                ></Link>
              </div>
            </div>

            <div className="col-lg-2 col-sm-6 col-md-4">
              <div className="single-category-box">
                <div className="icon">
                  <i className="flaticon-heart-1"></i>
                </div>
                <h3>Health Care</h3>
                {/* <span>16 Places</span> */}
                <Link
                  href={`/business/category/home health care service`}
                  className="link-btn"
                  aria-label={`Browse ${'home health care service'.replace(/\b\w/g, c => c.toUpperCase())} category`}
                ></Link>
              </div>
            </div>

            <div className="col-lg-2 col-sm-6 col-md-4">
              <div className="single-category-box">
                <div className="icon">
                  <i className="flaticon-airport"></i>
                </div>
                <h3>Travel & Public</h3>
                {/* <span>8 Places</span> */}
                <Link
                  href={`/business/category/travel`}
                  className="link-btn"
                  aria-label={`Browse ${'travel'.replace(/\b\w/g, c => c.toUpperCase())} category`}
                ></Link>
              </div>
            </div>

            <div className="col-lg-2 col-sm-6 col-md-4">
              <div className="single-category-box">
                <div className="icon">
                  <i className="flaticon-car-insurance"></i>
                </div>
                <h3>Auto Insurance</h3>
                {/* <span>10 Places</span> */}
                <Link
                  href={`/business/category/auto insurance agency`}
                  className="link-btn"
                  aria-label={`Browse ${'auto insurance agency'.replace(/\b\w/g, c => c.toUpperCase())} category`}
                ></Link>
              </div>
            </div>

            <div className="col-lg-2 col-sm-6 col-md-4">
              <div className="single-category-box">
                <div className="icon">
                  <i className="flaticon-attorney"></i>
                </div>
                <h3>Doctors</h3>
                {/* <span>25 Places</span> */}
                <Link
                  href={`/business/category/doctor`}
                  className="link-btn"
                  aria-label={`Browse ${'doctor'.replace(/\b\w/g, c => c.toUpperCase())} category`}
                ></Link>
              </div>
            </div>

            <div className="col-lg-2 col-sm-6 col-md-4">
              <div className="single-category-box">
                <div className="icon">
                  <i className="flaticon-plumber"></i>
                </div>
                <h3>Plumbers</h3>
                {/* <span>5 Places</span> */}
                <Link
                  href={`/business/category/plumber`}
                  className="link-btn"
                  aria-label={`Browse ${'plumber'.replace(/\b\w/g, c => c.toUpperCase())} category`}
                ></Link>
              </div>
            </div>

            <div className="col-lg-2 col-sm-6 col-md-4">
              <div className="single-category-box more-categories">
                <div className="icon">
                  <i className="flaticon-more-1"></i>
                </div>
                <h3>More Categories</h3>
                <Link
                  href={`/business`}
                  className="link-btn"
                  aria-label="Browse more categories"
                ></Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Category;

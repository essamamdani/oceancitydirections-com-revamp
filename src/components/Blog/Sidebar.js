"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

const Sidebar = () => {
  return (
    <>
      <aside className="widget-area">
        <section className="widget widget_search">
          <h3 className="widget-title">Search</h3>

          <form className="search-form">
            <label>
              <span className="screen-reader-text">Search for:</span>
              <input
                type="search"
                className="search-field"
                placeholder="Search..."
              />
            </label>
            <button type="submit">
              <i className="bx bx-search-alt"></i>
            </button>
          </form>
        </section>

        {/* <section className="widget widget_miran_posts_thumb">
          <h3 className="widget-title">Popular Posts</h3>

          <article className="item">
            <Link href="/blog/details/" className="thumb">
              <span
                className="fullimage cover"
                role="img"
                style={{
                  backgroundImage: `url(/images/main-banner-bg4.jpg)`,
                }}
              ></span>
            </Link>
            <div className="info">
              <span>June 10, 2020</span>
              <h4 className="title usmall">
                <Link href="/blog/details/">
                  The Data Surrounding Higher Education
                </Link>
              </h4>
            </div>

            <div className="clear"></div>
          </article>

          <article className="item">
            <Link href="/blog/details/" className="thumb">
              <span
                className="fullimage cover"
                role="img"
                style={{
                  backgroundImage: `url(/images/main-banner-bg4.jpg)`,
                }}
              ></span>
            </Link>
            <div className="info">
              <span>June 21, 2020</span>
              <h4 className="title usmall">
                <Link href="/blog/details/">
                  Conversion Rate the Sales Funnel Optimization
                </Link>
              </h4>
            </div>

            <div className="clear"></div>
          </article>

          <article className="item">
            <Link href="/blog/details/" className="thumb">
              <span
                className="fullimage cover"
                role="img"
                style={{
                  backgroundImage: `url(/images/main-banner-bg4.jpg)`,
                }}
              ></span>
            </Link>
            <div className="info">
              <span>June 30, 2020</span>
              <h4 className="title usmall">
                <Link href="/blog/details/">
                  Business Data is changing the world’s Energy
                </Link>
              </h4>
            </div>

            <div className="clear"></div>
          </article>
        </section>

        <section className="widget widget_categories">
          <h3 className="widget-title">Categories</h3>

          <ul>
            <li>
              <Link href="#">
                Design <span className="post-count">(03)</span>
              </Link>
            </li>
            <li>
              <Link href="#">
                Lifestyle <span className="post-count">(05)</span>
              </Link>
            </li>
            <li>
              <Link href="#">
                Script <span className="post-count">(10)</span>
              </Link>
            </li>
            <li>
              <Link href="#">
                Device <span className="post-count">(08)</span>
              </Link>
            </li>
            <li>
              <Link href="#">
                Tips <span className="post-count">(01)</span>
              </Link>
            </li>
          </ul>
        </section>

        <section className="widget widget_tag_cloud">
          <h3 className="widget-title">Popular Tags</h3>

          <div className="tagcloud">
            <Link href="#">
              Business <span className="tag-link-count"> (3)</span>
            </Link>
            <Link href="#">
              Design <span className="tag-link-count"> (3)</span>
            </Link>
            <Link href="#">
              Aike <span className="tag-link-count"> (2)</span>
            </Link>
            <Link href="#">
              Fashion <span className="tag-link-count"> (2)</span>
            </Link>
            <Link href="#">
              Travel <span className="tag-link-count"> (1)</span>
            </Link>
            <Link href="#">
              Smart <span className="tag-link-count"> (1)</span>
            </Link>
            <Link href="#">
              Marketing <span className="tag-link-count"> (1)</span>
            </Link>
            <Link href="#">
              Tips <span className="tag-link-count"> (2)</span>
            </Link>
          </div>
        </section>

        <section className="widget widget_instagram">
          <ul>
            <li>
              <div className="box">
                <Image
                  src="/images/blog/blog9.jpg"
                  alt="image"
                  width={780}
                  height={500}
                />
                <i className="bx bxl-instagram"></i>
                <Link href="#" className="link-btn" aria-label="View details"></Link>
              </div>
            </li>

            <li>
              <div className="box">
                <Image
                  src="/images/blog/blog8.jpg"
                  alt="image"
                  width={780}
                  height={500}
                />
                <i className="bx bxl-instagram"></i>
                <Link href="#" className="link-btn" aria-label="View details"></Link>
              </div>
            </li>

            <li>
              <div className="box">
                <Image
                  src="/images/blog/blog7.jpg"
                  alt="image"
                  width={780}
                  height={500}
                />
                <i className="bx bxl-instagram"></i>
                <Link href="#" className="link-btn" aria-label="View details"></Link>
              </div>
            </li>

            <li>
              <div className="box">
                <Image
                  src="/images/blog/blog6.jpg"
                  alt="image"
                  width={780}
                  height={500}
                />
                <i className="bx bxl-instagram"></i>
                <Link href="#" className="link-btn" aria-label="View details"></Link>
              </div>
            </li>

            <li>
              <div className="box">
                <Image
                  src="/images/blog/blog5.jpg"
                  alt="image"
                  width={780}
                  height={500}
                />
                <i className="bx bxl-instagram"></i>
                <Link href="#" className="link-btn" aria-label="View details"></Link>
              </div>
            </li>

            <li>
              <div className="box">
                <Image
                  src="/images/blog/blog4.jpg"
                  alt="image"
                  width={780}
                  height={500}
                />
                <i className="bx bxl-instagram"></i>
                <Link href="#" className="link-btn" aria-label="View details"></Link>
              </div>
            </li>
          </ul>
        </section> */}
      </aside>
    </>
  );
};

export default Sidebar;

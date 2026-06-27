'use client';
import React, { useState } from "react";
import Link from "next/link";
import { ucwords } from "@/lib/helper";

const Sidebar = ({ categories, location, params, link = 'category' }) => {
  let slug = params?.slug || [];
  if (link === 'category') {
    slug = [link, ...slug];
  }

  const catIndex = slug.indexOf("category");
  let locationParts = catIndex !== -1 ? slug.slice(0, catIndex) : slug;
  let categoryParts = catIndex !== -1 ? slug.slice(catIndex + 1) : [];

  const [searchCategory, setSearchCategory] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const removeDoubleSlashes = (url) => url.replace(/\/+/g, "/");

  const placeRouteInCategoryURL = () => {
    return removeDoubleSlashes(
      locationParts.length > 0
        ? `/business/location/${locationParts.join("/")}/category${categoryParts.length ? `/${categoryParts.join("/")}` : ""}`
        : `/business/category${categoryParts.length ? `/${categoryParts.join("/")}` : ""}`
    );
  };
  const placeRouteInLocationURL = (value) => {
    return removeDoubleSlashes(
      `/business/location/${locationParts.join("/")}${value ? `/${value}` : ""}${categoryParts.length ? `/category/${categoryParts.join("/")}` : ""}`
    );
  };

  const filteredCategories = categories?.filter((c) =>
    c.name.toLowerCase().includes(searchCategory.toLowerCase())
  );
  const filteredLocations = location?.filter((loc) =>
    loc.name.toLowerCase().includes(searchLocation.toLowerCase())
  );

  return (
    <aside className="widget-area" style={{
      padding: "0",
    }}>
      {categories && categories.length > 0 && (
        <section className="widget widget_categories" style={{
              padding: "0",
            }}>
          <h3 className="widget-title">Categories</h3>
          <div className="essa-custom">
            <label><i className="flaticon-search"></i></label>
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Find Category"
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              
            />
          </div>
          <ul>
            {filteredCategories.slice(0, 10).map(({ name, total_records }, index) => (
              <li key={index}>
                <Link href={`${placeRouteInCategoryURL()}/${encodeURIComponent(name?.toLowerCase())}`} className="capitalize">
                {name} {total_records && <span className="post-count">({total_records})</span>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {location?.length > 0 && (
        <section className="widget widget_categories" style={{
              padding: "0",
        }}>
          <h3 className="widget-title">Location</h3>
          <div className="essa-custom">
            <label><i className="flaticon-search"></i></label>
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Find Location"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
            />
          </div>
          <ul>
            {filteredLocations.slice(0, 10).map(({ name, total_records }, index) => (
              <li key={index}>
                <Link href={`${placeRouteInLocationURL(encodeURIComponent(name?.toLowerCase()))}`} className="capitalize">
                  {/* <span>{ucwords(loc.name)} ({loc.total_records})</span> */}
                  {name} {total_records && <span className="post-count">({total_records})</span>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  );
};

export default Sidebar;
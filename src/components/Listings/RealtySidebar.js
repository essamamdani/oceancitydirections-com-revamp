'use client';
import React, { useEffect, useState } from "react";
import Link from "next/link";
const mainCategoriesToShow = ["restaurant", "home goods store", "shopping mall", "fitness", "hotel", "car dealer"];
const RealtySidebar = ({ categories, location, params, link = 'business' }) => {
  const { category: categoriesSegment } = params;

  const categoryUrl = `/${link}/category${categoriesSegment ? "/" + categoriesSegment.join("/") : ""}`;
  const locationUrl = `/${link}/location${params.location ? "/" + params.location.join("/") : ""}`;

  const [categorySearch, setCategorySearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);


  useEffect(() => {
    const categoriesArray = Array.isArray(categories) ? categories : categories.subcategories || [];
    const isMainCategoryView = !categoriesSegment;

    const filteredCats = categorySearch
      ? categoriesArray.filter(({ name }) => name?.toLowerCase().includes(categorySearch.toLowerCase()))
      : isMainCategoryView
        ? categoriesArray.filter(({ name }) => mainCategoriesToShow.includes(name?.toLowerCase()))
        : categoriesArray;

    setFilteredCategories(filteredCats);

    const filteredLocs = locationSearch
      ? location.filter(({ name }) => name?.toLowerCase().includes(locationSearch.toLowerCase()))
      : location;

    setFilteredLocations(filteredLocs);
  }, [categories, location, categorySearch, locationSearch, categoriesSegment]);

  return (
    <aside className="widget-area" style={{
      padding: "0",
    }}> 
      {(!categoriesSegment || categoriesSegment.length < 2) && (
        <>
          {filteredCategories.length > 0 && (
            <section className="widget widget_categories" style={{
              padding: "0",
            }}>
              <h3 className="widget-title">Categories</h3>
              <input
                type="text"
                placeholder="Find Category"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="form-control mb-2"
              />
              <ul>
                {filteredCategories.slice(0, 5).map(({ name }, index) => (
                  <li key={index}>
                    <Link href={`${categoryUrl}/${encodeURIComponent(name?.toLowerCase())}`}>
                      {name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {location?.length > 0 && (
        <section className="widget widget_categories" style={{
              padding: "0",
            }}>
          <h3 className="widget-title">Location</h3>
          <input
            type="text"
            placeholder="Find Location"
            value={locationSearch}
            onChange={(e) => setLocationSearch(e.target.value)}
            className="form-control mb-2"
          />
          <ul>
            {filteredLocations.slice(0, 10).map(({ name, total_records }, index) => (
              <li key={index}>
                <Link href={`${locationUrl}/${encodeURIComponent(name?.toLowerCase())}`} className="capitalize">
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

export default RealtySidebar;
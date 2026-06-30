"use client";

import { useEffect, useState } from "react";
import PropertyListing from "@/components/Common/propertylisting";

export default function HomepageListings() {
  const [properties, setProperties] = useState(null);

  useEffect(() => {
    fetch("/api/listings/homepage")
      .then((r) => r.json())
      .then((data) => {
        if (data?.value?.length) setProperties(data);
      })
      .catch(() => {});
  }, []);

  if (!properties) {
    return (
      <div className="rd-property-grid">
        {[...Array(6)].map((_, i) => (
          <div className="single-listings-box rd-property-card flex flex-col justify-between animate-pulse bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs h-[380px]" key={i}>
            <div className="bg-slate-200 h-[200px] w-full"></div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 bg-slate-200 rounded w-16"></div>
                  <div className="h-4 bg-slate-200 rounded w-24"></div>
                </div>
                <div className="h-5 bg-slate-200 rounded w-5/6"></div>
              </div>
              <div className="space-y-2 pt-4 border-t border-slate-50">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <PropertyListing properties={properties} />;
}

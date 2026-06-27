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

  if (!properties) return null;

  return <PropertyListing properties={properties} />;
}

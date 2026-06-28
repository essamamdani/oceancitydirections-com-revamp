import Link from "next/link";
import React from "react";

interface NoRecordFoundProps {
  params?: any;
  site?: any;
}

export default function NoRecordFound({ params, site }: NoRecordFoundProps) {
  const slug = params?.slug || [];
  const catIndex = slug.indexOf("category");

  const locationParts = catIndex !== -1 ? slug.slice(0, catIndex) : slug;
  const categoryParts = catIndex !== -1 ? slug.slice(catIndex + 1) : [];

  const [county, city, zip] = locationParts;
  const [category, subcategory] = categoryParts;

  const suggestions: Array<{ label: string; href: string }> = [];
  
  if (county) {
    suggestions.push({
      label: `Browse all of ${county}`,
      href: `/business/location/${county.toLowerCase()}`,
    });
  }
  if (category) {
    suggestions.push({
      label: `Browse all ${category} listings`,
      href: `/business/category/${category.toLowerCase()}`,
    });
  }
  if (city) {
    suggestions.push({
      label: `Browse ${city}`,
      href: `/business/location/${county?.toLowerCase()}/${city.toLowerCase()}`,
    });
  }

  return (
    <div className="error-content text-center py-5">
      <h3 className="mb-3 text-lg font-bold text-slate-900 font-serif">No Records Found</h3>
      <p className="text-muted mb-4 text-sm text-slate-500">
        We couldn&apos;t find any results for your search. Here are some alternatives:
      </p>

      <div className="flex flex-wrap justify-center gap-4 mb-4">
        {suggestions.map((s, i) => (
          <div className="w-full sm:w-auto" key={i}>
            <Link href={s.href} className="inline-block bg-white hover:bg-slate-50 text-emerald-700 hover:text-emerald-800 font-semibold border border-slate-200 px-5 py-2.5 rounded-xl text-sm transition">
              {s.label}
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-4 border-t border-slate-100">
        <p className="small text-muted text-xs text-slate-400 mb-2">
          Can&apos;t find what you&apos;re looking for?
        </p>
        <Link href="/" className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition shadow-sm">
          Back to Homepage
        </Link>
      </div>
    </div>
  );
}

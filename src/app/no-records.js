import Link from "next/link";

export default function NoRecordFound({ params }) {
  const slug = params?.slug || [];
  const catIndex = slug.indexOf("category");

  const locationParts = catIndex !== -1 ? slug.slice(0, catIndex) : slug;
  const categoryParts = catIndex !== -1 ? slug.slice(catIndex + 1) : [];

  const [county, city, zip] = locationParts;
  const [category, subcategory] = categoryParts;

  // Generate contextual suggestions based on the current filters
  const suggestions = [];
  
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
      <h3 className="mb-3">No Records Found</h3>
      <p className="text-muted mb-4">
        We couldn&apos;t find any results for your search. Here are some alternatives:
      </p>

      <div className="row justify-content-center mb-4">
        {suggestions.map((s, i) => (
          <div className="col-12 col-md-4 mb-2" key={i}>
            <Link href={s.href} className="btn btn-outline-primary w-100">
              {s.label}
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <p className="small text-muted">
          Can&apos;t find what you&apos;re looking for?
        </p>
        <Link href="/" className="default-btn">
          Back to Homepage
        </Link>
      </div>
    </div>
  );
}

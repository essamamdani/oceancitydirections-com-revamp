
import { headers } from "next/headers";
import AnalyticsComponent from "@/components/Analytics";
const EU_COUNTRY_CODES = [
  "AT",
  "BE",
  "BG",
  "CY",
  "CZ",
  "DE",
  "DK",
  "EE",
  "ES",
  "FI",
  "FR",
  "GR",
  "HR",
  "HU",
  "IE",
  "IT",
  "LT",
  "LU",
  "LV",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SE",
  "SI",
  "SK",
];

export default async function Analytics() {
  const headersList = await headers();
  const countryCode = headersList.get("x-vercel-ip-country") || "US";

  if (EU_COUNTRY_CODES.includes(countryCode)) {
    return null;
  }

  // Use a simple wrapper to prevent server-side rendering issues
  return (
    <div>
      <AnalyticsComponent/>
    </div>
  );
}

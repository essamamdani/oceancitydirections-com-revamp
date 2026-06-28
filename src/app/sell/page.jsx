import Navbar from "@/components/Layouts/Navbar";
import Footer from "@/components/Layouts/Footer";
import Sell from "@/components/Sell";
import { redirect } from "next/dist/server/api-utils";


import { fetchSiteData } from "@/lib/site-config";
import { getSiteName } from "@/lib/helper";

export async function generateMetadata() {
  let site;
  try {
    site = await fetchSiteData();
  } catch (error) {}
  const siteName = site ? getSiteName(site) : 'Realty Directions';
  const state = site?.state || '';
  const title = `Sell Your Property - ${siteName}`;
  const description = `Browse sell your property in ${state} on ${siteName}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: siteName,
    },
  };
}

export default function Page() {
  // return redirect('https://www.valuedirections.com/');

  return (
    <>
      <Navbar />
      <div className="listings-area py-10">
        <Sell />
        
      </div></>
  );
}
import React from "react";
import PageBanner from "@/components/Common/PageBanner";
import NavbarTwo from "@/components/Layouts/NavbarTwo";
import Footer from "@/components/Layouts/Footer";

import { fetchSiteData } from "@/lib/site-config";
import { getSiteName } from "@/lib/helper";

export async function generateMetadata() {
  let site;
  try {
    site = await fetchSiteData();
  } catch (error) {}
  const siteName = site ? getSiteName(site) : 'Realty Directions';
  const state = site?.state || '';
  const title = `About Us - ${siteName}`;
  const description = `Browse about us in ${state} on ${siteName}.`;

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
    return (
        <>
            <NavbarTwo />
            <main className="flex flex-col items-center justify-center min-h-screen">
                {/* <PageBanner pageTitle="Blog" pageName="Blog" /> */}
                <h1 className="text-center">Coming Soon</h1>
            </main>
            
        </>
    );
}
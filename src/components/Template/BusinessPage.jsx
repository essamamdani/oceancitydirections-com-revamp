import Sidebar from "@/components/Listings/Sidebar";
import MainGridPage from "@/components/CustomComponents/MainGridPage";
import NoRecordFound from "@/components/NoRecordFound";
import PageHeaderWithMap from "@/components/Listings/PageHeaderWithMap";
import NavbarTwo from "@/components/Layouts/NavbarTwo";
import Link from "next/link";
import Footer from "@/components/Layouts/Footer";
import FeaturedVideo from "@/components/HomeFour/featurevideo";
import AddBusinessButton from "@/components/CTA/AddBusinessButton";
// import dynamic from 'next/dynamic';

// import AddBusinessCTA from "../CTA/AddBusiness";

// const Footer = dynamic(() => import('@/components/Layouts/Footer'), {
//   ssr: false
// });

export default async function BusinessPage(props) {
  const { geoJson, categories, businesses, location, totalRecords, breadcrumbs, link, featured_videos, site } = props;
  const searchParams = await props.searchParams;
  const params = await props.params;

  return (
    <>
      <NavbarTwo />
      <PageHeaderWithMap geoJson={geoJson} />

      <div className="listings-area ptb-100">
        <div className="container-fluid">
          <div className="row m-0">
            <div className="col-xl-9 col-lg-9 col-md-12 p-0">
              <div className="breadcrumb-area"><h1>Businesses</h1><ol className="breadcrumb">
                <li className="item">
                  <Link style={{
                    color: "var(--mainColor)",
                  }} href="/">Home</Link></li>
                {breadcrumbs?.length > 0 && breadcrumbs.map((item, index) => (
                  <li className="item" key={index}>
                    {item.link ? <Link style={{
                      color: "var(--mainColor)",
                    }} href={item.link}>{item.name}</Link> : item.name}
                  </li>
                ))}
              </ol></div>

            </div>

            <div className="col-xl-3 col-lg-3 col-md-12 text-center text-lg-end " style={{ paddingRight: "30px" }}>
              <AddBusinessButton />
            </div>
          </div>
          <div className="row m-0">
            <div className="col-xl-12 col-lg-12 col-md-12 p-0">
              <div className="row">
                <div className="col-lg-3 col-md-12">
                  <Sidebar link={link} categories={categories} location={location} params={params} />
                </div>
                <div className="col-lg-9 col-md-12">
                  {businesses?.length > 0 ? <MainGridPage
                  featured_videos={featured_videos}
                  businesses={businesses?.filter((b) => !b?.deleted_at)} categories={categories} searchParams={searchParams} params={params} totalRecords={totalRecords} /> : <NoRecordFound params={params} site={site} />}
                </div>

              </div>
            </div>


          </div>
        </div>
      </div>
      
    </>
  );
}

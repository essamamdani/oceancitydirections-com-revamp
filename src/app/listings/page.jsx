import NavbarTwo from "@/components/Layouts/NavbarTwo";
import Footer from "@/components/Layouts/Footer";
import { getListingLinks } from "@/lib/actions";
import NotFound from "../not-found";
export default async function Page(props) {
    const searchParams = await props.searchParams;
    const params = await props.params;
    const data = await getListingLinks();

    if (data.length < 1) return <NotFound />;

    return <>
        <NavbarTwo />
        <div className="widget-area">
            <section className="widget widget_tag_cloud">
                <h3 className="widget-title">Listings</h3>
                <div className="tagcloud">
                    {data.map((item, index) => (
                        <a key={index} href={`/listings/${item.slug}`}>{item.question} </a>
                    ))}

                </div>
            </section>
        </div>
        
    </>
}
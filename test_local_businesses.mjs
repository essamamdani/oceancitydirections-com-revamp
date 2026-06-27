import { getBusinessesNew } from "./src/lib/actions.js";
import { fetchSiteConfigByDomain } from "./src/lib/site-config.js";

async function run() {
    const site = await fetchSiteConfigByDomain('miamidirections.com');
    console.log("Site DefaultCounties:", site.DefaultCounties);
    
    const result = await getBusinessesNew(site, {});
    console.log("Result records:", result.totalRecords);
    console.log("Businesses array length:", result.businesses ? result.businesses.length : 0);
}
run();
import { fetchBusinessForRemoval } from "../actions";
import RemovalRequestClient from "./RemovalRequestClient";

export default async function RemovalRequestPage({ params }) {
    const { id } = params;
    
    // Get site data from environment or fetch it server-side
    const site = {
        db: {
            url: process.env.SUPABASE_URL,
            anon_key: process.env.SUPABASE_ANON_KEY
        }
    };

    const result = await fetchBusinessForRemoval(id, site);

    if (result.error) {
        return (
            <div className="text-center pt-100">
                <h2>Error</h2>
                <p>{result.error}</p>
            </div>
        );
    }

    return <RemovalRequestClient business={result.data} />;
}

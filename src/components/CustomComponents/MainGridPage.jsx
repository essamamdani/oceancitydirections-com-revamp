import GridBlock from './GridBlock';
import Pagination from './Pagination';
import { ucwords } from '@/lib/helper';

const MainGridPage = ({ businesses, totalRecords, location, params, searchParams,featured_videos }) => {
    const { location: locationSegment, category: categoriesSegment } = params || {};

    // Function to format the location segment and determine the level
    const formatLocationSegment = (segment) => {
        if (!segment) return { name: '', type: '' }; // Handle undefined segment

        // Decode the segment
        const decodedSegment = decodeURIComponent(segment);

        // Split the decoded segment by commas to identify each part
        const segments = decodedSegment.split(',').map(item => item.trim());

        // Determine the level of location granularity and set appropriate label
        if (segments.length === 3) {
            // County, City, and Zip format (e.g., "worcester, ocean city, 12321")
            return { name: segments[2], type: 'In Zip Code: ' };
        } else if (segments.length === 2) {
            // County and City format (e.g., "worcester, ocean city")
            return { name: segments[1], type: 'In City: ' };
        } else if (segments.length === 1) {
            // Only County format (e.g., "worcester")
            return { name: segments[0], type: 'In County: ' };
        }

        // Default return in case of unexpected format
        return { name: decodedSegment, type: '' };
    };

    // Function to format the category segment and determine the level
    const formatCategorySegment = (segment) => {
        if (!segment) return { name: '', type: '' }; // Handle undefined segment

        // Decode the segment
        const decodedSegment = decodeURIComponent(segment);

        // Split the decoded segment by commas to identify each part
        const segments = decodedSegment.split(',').map(item => item.trim());

        // Determine if the segment is a Category or SubCategory
        if (segments.length === 2) {
            return { name: segments[1], type: 'In SubCategory: ' };
        } else if (segments.length === 1) {
            return { name: segments[0], type: 'In Category: ' };
        }

        // Default return in case of unexpected format
        return { name: decodedSegment, type: '' };
    };

    // Format the location and category segments
    const { name: formattedLocation, type: locationType } = formatLocationSegment(locationSegment);
    const { name: formattedCategory, type: categoryType } = formatCategorySegment(categoriesSegment);

    return (
        <div className="all-listings-list">
            <div className="listings-grid-sorting row align-items-center">
                <div className="col-lg-5 col-md-6 result-count">
                    {totalRecords} Results Found
                    {locationType && ` ${ucwords(locationType)}`}
                    {categoryType && ` ${ucwords(categoryType)}`}
                    {ucwords(formattedLocation || formattedCategory || "")} {/* Display formatted location */}
                </div>

                <div className="col-lg-7 col-md-6 ordering">
                    <div className="d-flex justify-content-end">
                        <div className="select-box hidden d-none">
                            <label>Sort By:</label>
                            <select className="blog-select">
                                <option>Recommended</option>
                                <option>Default</option>
                                <option>Popularity</option>
                                <option>Latest</option>
                                <option>Price: low to high</option>
                                <option>Price: high to low</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rd-results-list">
                <GridBlock businesses={businesses} featured_videos={featured_videos} />
                <Pagination totalRecords={totalRecords} searchParams={searchParams} />
            </div>
        </div>
    );
};

export default MainGridPage;


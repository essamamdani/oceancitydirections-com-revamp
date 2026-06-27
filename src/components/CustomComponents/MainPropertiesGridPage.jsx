
import Pagination from './Pagination';
import PropertiesGridBlock from './PropertiesGridBlock';
import SelectPropertyType from '../SelectPropertyType';

import { ucwords } from '@/lib/helper';

const MainPropertiesGridPage = ({ properties, totalRecords, params, location, searchParams, breadcrumbs, featured_videos }) => {

    const { location: locationSegment } = params || {};


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

    const { name: formattedLocation, type: locationType } = formatLocationSegment(locationSegment);


    return (
        <div className="all-listings-list">
            <div className="listings-grid-sorting align-items-center">
                <div className="result-count" style={{ overflow: 'hidden' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap'
                    }}>
                        <span style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '100%'
                        }}>
                            {totalRecords} Results Found
                            {searchParams?.q && <>for <strong>{ucwords(searchParams?.q)}</strong></>}
                            {searchParams?.ask && <>for <strong>{ucwords(searchParams?.ask)}</strong></>}
                            {locationType && ` ${ucwords(locationType)}`}
                            {ucwords(formattedLocation)}
                        </span>
                        {(searchParams?.q || searchParams?.ask) && (
                            <span className="rd-filter-chip">
                                AI Powered
                            </span>
                        )}
                    </div>
                </div>

                <div className="ordering">
                    <div className="d-flex justify-content-end">
                        <div className="select-box">
                            <SelectPropertyType searchParamsServer={searchParams} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="rd-property-grid">
                <PropertiesGridBlock properties={properties} featured_videos={featured_videos} />
                <Pagination totalRecords={totalRecords} searchParams={searchParams} />
            </div>
        </div>
    );
};

export default MainPropertiesGridPage;

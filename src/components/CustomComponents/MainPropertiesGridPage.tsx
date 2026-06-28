import Pagination from './Pagination';
import PropertiesGridBlock from './PropertiesGridBlock';
import SelectPropertyType from '../SelectPropertyType';
import { ucwords } from '@/lib/helper';

interface MainPropertiesGridPageProps {
    properties: any;
    totalRecords: number;
    params?: any;
    location?: any;
    searchParams?: any;
    breadcrumbs?: any;
    featured_videos?: any;
}

const MainPropertiesGridPage = ({ properties, totalRecords, params, location, searchParams, breadcrumbs, featured_videos }: MainPropertiesGridPageProps) => {
    const { location: locationSegment } = params || {};

    const formatLocationSegment = (segment) => {
        if (!segment) return { name: '', type: '' };

        const decodedSegment = decodeURIComponent(segment);
        const segments = decodedSegment.split(',').map(item => item.trim());

        if (segments.length === 3) {
            return { name: segments[2], type: 'In Zip Code: ' };
        } else if (segments.length === 2) {
            return { name: segments[1], type: 'In City: ' };
        } else if (segments.length === 1) {
            return { name: segments[0], type: 'In County: ' };
        }

        return { name: decodedSegment, type: '' };
    };

    const { name: formattedLocation, type: locationType } = formatLocationSegment(locationSegment);

    return (
        <div className="w-full flex flex-col gap-6 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 gap-4">
                <div className="text-sm font-semibold text-slate-650 flex flex-wrap items-center gap-2">
                    <span>
                        <span className="text-slate-900 font-bold">{totalRecords}</span> Results Found
                        {searchParams?.q && <> for <strong className="text-emerald-700">{ucwords(searchParams?.q)}</strong></>}
                        {searchParams?.ask && <> for <strong className="text-emerald-700">{ucwords(searchParams?.ask)}</strong></>}
                        {locationType && ` ${ucwords(locationType)}`}
                        {ucwords(formattedLocation)}
                    </span>
                    {(searchParams?.q || searchParams?.ask) && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            AI Powered
                        </span>
                    )}
                </div>

                <div className="flex justify-end">
                    <SelectPropertyType searchParamsServer={searchParams} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <PropertiesGridBlock properties={properties} featured_videos={featured_videos} />
                <div className="pt-6 border-t border-slate-150">
                    <Pagination totalRecords={totalRecords} searchParams={searchParams} />
                </div>
            </div>
        </div>
    );
};

export default MainPropertiesGridPage;

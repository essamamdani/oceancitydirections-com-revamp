import GridBlock from './GridBlock';
import Pagination from './Pagination';
import { ucwords } from '@/lib/helper';

interface MainGridPageProps {
    businesses: any;
    totalRecords: number;
    location?: any;
    params?: any;
    searchParams?: any;
    featured_videos?: any;
    categories?: any;
}

const MainGridPage = ({ businesses, totalRecords, location, params, searchParams, featured_videos, categories }: MainGridPageProps) => {
    const { location: locationSegment, category: categoriesSegment } = params || {};

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

    const formatCategorySegment = (segment) => {
        if (!segment) return { name: '', type: '' };

        const decodedSegment = decodeURIComponent(segment);
        const segments = decodedSegment.split(',').map(item => item.trim());

        if (segments.length === 2) {
            return { name: segments[1], type: 'In SubCategory: ' };
        } else if (segments.length === 1) {
            return { name: segments[0], type: 'In Category: ' };
        }

        return { name: decodedSegment, type: '' };
    };

    const { name: formattedLocation, type: locationType } = formatLocationSegment(locationSegment);
    const { name: formattedCategory, type: categoryType } = formatCategorySegment(categoriesSegment);

    return (
        <div className="w-full flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 gap-4">
                <div className="text-sm font-semibold text-slate-600">
                    <span className="text-slate-900 font-bold">{totalRecords}</span> Results Found
                    {locationType && ` ${ucwords(locationType)}`}
                    {categoryType && ` ${ucwords(categoryType)}`}
                    <span className="text-emerald-700 font-bold ml-1">
                        {ucwords(formattedLocation || formattedCategory || "")}
                    </span>
                </div>

                <div className="flex justify-end hidden">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Sort By:</label>
                        <select className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 outline-none">
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

            <div className="grid grid-cols-1 gap-6">
                <GridBlock businesses={businesses} featured_videos={featured_videos} />
                <div className="pt-6 border-t border-slate-150">
                    <Pagination totalRecords={totalRecords} searchParams={searchParams} />
                </div>
            </div>
        </div>
    );
};

export default MainGridPage;

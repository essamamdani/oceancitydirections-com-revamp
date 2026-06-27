"use client";

import { fetchCategories, fetchMLSStatus, ucwords } from '@/lib/helper';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SelectPropertyType({ searchParamsServer }) {

    const searchParams = useSearchParams();
    const router = useRouter();

    // State variables for category and sortBy
    const [category, setCategory] = useState(searchParamsServer.category || searchParams.get('category') || '');
    const [status, setStatus] = useState(searchParamsServer.status || searchParams.get('status') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('orderBy') || '');
    const setQuery = (key, value) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(key, value);
        router.push(`?${params.toString()}`);
    }


    return (
        <form method="GET" action="" className='d-flex'>
            <div className='d-flex align-items-center justify-content-center'>
                <label htmlFor="sort_by" style={{
                    width:'4rem'
                }}>Sort By:</label>
                <select
                    className="blog-select"
                    name="sortBy"
                    id="sort_by"
                    defaultValue={sortBy}
                    onChange={(e) => {
                        setSortBy(e.target.value)
                        setQuery('orderBy', e.target.value)
                    }} // Update URL
                >
                    <option value="">Default</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="bedroom_desc">Bedrooms</option>
                    <option value="sqrft_desc">Sqr Ft</option>
                </select>
            </div>

            <div className='d-flex align-items-center justify-content-center'>
                <label htmlFor="category">Type:</label>
                <select
                    className="blog-select"
                    name="category"
                    id="category"
                    defaultValue={category}
                    onChange={(e) => {
                        setCategory(e.target.value)
                        setQuery('category', e.target.value)

                    }} // Update URL
                >
                    {Object.keys(fetchCategories).map((cat, index) => (
                        <option key={index} value={cat}>
                            {ucwords(cat.replace("_", " "))}
                        </option>
                    ))}
                </select>
            </div>
            <div className='d-flex align-items-center justify-content-center'>
                <label htmlFor="status">Status:</label>
                <select
                    className="blog-select"
                    name="status"
                    id="status"
                    defaultValue={category}
                    onChange={(e) => {
                        setStatus(e.target.value)
                        setQuery('status', e.target.value)

                    }} // Update URL
                >
                    {Object.keys(fetchMLSStatus).map((status, index) => (
                        <option key={index} value={status}>
                            {ucwords(status.replace("_", " "))}
                        </option>
                    ))}
                </select>
            </div>
        </form>
    );
}
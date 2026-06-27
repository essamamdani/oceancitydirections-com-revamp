import { ITEMS_PER_PAGE } from "@/lib/helper";
import Link from "next/link";

const Pagination = ({ totalRecords, searchParams }) => {
    const currentPage = parseInt(searchParams?.page, 10) || 1;

    const totalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE);

    const generatePageLink = (page) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", page);
        return `?${params.toString()}`;
    };

    const renderPageNumbers = () => {
        if (totalPages <= 1) return [];

        const maxButtons = 5;
        const halfMax = Math.floor(maxButtons / 2);
        let startPage = Math.max(2, currentPage - halfMax);
        let endPage = Math.min(totalPages - 1, currentPage + halfMax);

        if (currentPage <= halfMax) {
            endPage = Math.min(maxButtons, totalPages - 1);
        }
        if (currentPage > totalPages - halfMax) {
            startPage = Math.max(totalPages - maxButtons + 1, 2);
        }

        const pages = [1];
        if (startPage > 2) pages.push("...");
        for (let i = startPage; i <= endPage; i++) pages.push(i);
        if (endPage < totalPages - 1) pages.push("...");
        if (totalPages > 1) pages.push(totalPages);

        return pages;
    };

    return (
        <div className="pagination-area text-center single-item">
            <Link href={currentPage > 1 ? generatePageLink(currentPage - 1) : "#"} className="prev page-numbers">
                <i className="bx bx-chevrons-left"></i>
            </Link>
            {renderPageNumbers().map((number, index) => (
                <span  key={index}>
                    {typeof number === "number" ? (
                        <Link  href={generatePageLink(number)}><span className={`page-numbers ${number === currentPage ? "current" : ""}`}>{number}</span></Link>
                    ) : (
                        <span key={index} className={`page-numbers ${number === currentPage ? "current" : ""}`}>{number}</span>
                    )}</span>

            ))
            }
            <Link href={currentPage < totalPages ? generatePageLink(currentPage + 1) : "#"} className="next page-numbers">
                <i className="bx bx-chevrons-right"></i>
            </Link>
        </div >
    );
};

export default Pagination;
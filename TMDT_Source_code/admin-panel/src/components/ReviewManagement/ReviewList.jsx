import React, { useState, useEffect } from 'react';
import { FiSearch, FiRefreshCw, FiEye, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import reviewService from '../../services/reviewService';

const ReviewList = ({ status, onReviewClick, isLoading: externalLoading, refreshTrigger, token }) => {
    // State for reviews data
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(externalLoading || false);
    const [error, setError] = useState(null);

    // State for filters
    const [searchTerm, setSearchTerm] = useState('');
    const [productFilter, setProductFilter] = useState('');
    const [ratingFilter, setRatingFilter] = useState('all');

    // State for sorting
    const [sortField, setSortField] = useState('creation_at');
    const [sortOrder, setSortOrder] = useState('DESC');

    // State for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalReviews, setTotalReviews] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Fetch reviews
    const fetchReviews = async (resetPage = false) => {
        try {
            setIsLoading(true);
            setError(null);

            // Reset to page 1 if filters changed
            const page = resetPage ? 1 : currentPage;
            if (resetPage) {
                setCurrentPage(1);
            }

            // Build query params
            const params = {
                page,
                limit: itemsPerPage,
                sort_by: sortField,
                sort_order: sortOrder,
                search: searchTerm,
                status,
                product: productFilter,
                rating: ratingFilter !== 'all' ? ratingFilter : undefined
            };

            const response = await reviewService.getReviews(params);

            if (response.success) {
                setReviews(response.reviews);
                setTotalReviews(response.pagination.total);
                setTotalPages(response.pagination.pages);
            } else {
                setError(response.message || 'Failed to load reviews');
                setReviews([]);
            }
        } catch (error) {
            setError(error.message || 'An error occurred');
            setReviews([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial data load
    useEffect(() => {
        fetchReviews();
    }, [status]);

    // Refresh when refreshTrigger changes
    useEffect(() => {
        if (refreshTrigger > 0) {
            fetchReviews();
        }
    }, [refreshTrigger]);

    // Fetch reviews when pagination changes
    useEffect(() => {
        fetchReviews();
    }, [currentPage, itemsPerPage, sortField, sortOrder]);

    // Handle approve review
    const handleApproveReview = async (reviewId, e) => {
        e.stopPropagation();
        try {
            setIsLoading(true);
            const response = await reviewService.updateReviewStatus(reviewId, 'approved');
            if (response.success) {
                toast.success('Review approved successfully');
                fetchReviews();
            } else {
                toast.error(response.message || 'Failed to approve review');
            }
        } catch (error) {
            toast.error(error.message || 'An error occurred while approving review');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle reject review
    const handleRejectReview = async (reviewId, e) => {
        e.stopPropagation();
        try {
            setIsLoading(true);
            const response = await reviewService.updateReviewStatus(reviewId, 'rejected');
            if (response.success) {
                toast.success('Review rejected successfully');
                fetchReviews();
            } else {
                toast.error(response.message || 'Failed to reject review');
            }
        } catch (error) {
            toast.error(error.message || 'An error occurred while rejecting review');
        } finally {
            setIsLoading(false);
        }
    };

    // Apply filters when filter button is clicked
    const handleApplyFilters = () => {
        fetchReviews(true);
    };

    // Reset all filters
    const handleResetFilters = () => {
        setSearchTerm('');
        setProductFilter('');
        setRatingFilter('all');
        fetchReviews(true);
    };

    // Render star rating
    const renderStarRating = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} className={i <= rating ? "text-yellow-400" : "text-gray-300"}>
                    ★
                </span>
            );
        }
        return <div className="flex">{stars}</div>;
    };

    // Handle pagination
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="bg-white rounded-lg shadow-md">
            {/* Header and Filter Section */}
            <div className="p-4 border-b">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                        {status.charAt(0).toUpperCase() + status.slice(1)} Reviews
                        {totalReviews > 0 && <span className="text-sm text-gray-500 ml-2">({totalReviews})</span>}
                    </h2>
                    <button
                        onClick={() => fetchReviews()}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                        title="Refresh Reviews"
                        disabled={isLoading}
                    >
                        <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
                    </button>
                </div>

                {/* Search and filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Search input */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by customer name or content..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    {/* Product filter */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Filter by product name..."
                            value={productFilter}
                            onChange={(e) => setProductFilter(e.target.value)}
                            className="w-full pl-4 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Rating filter */}
                    <div className="relative">
                        <select
                            value={ratingFilter}
                            onChange={(e) => setRatingFilter(e.target.value)}
                            className="w-full pl-4 pr-4 py-2 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Ratings</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>
                    </div>
                </div>

                {/* Filter buttons */}
                <div className="flex justify-end mt-4 space-x-3">
                    <button
                        onClick={handleResetFilters}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        disabled={isLoading}
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleApplyFilters}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        disabled={isLoading}
                    >
                        Apply Filters
                    </button>
                </div>
            </div>

            {/* Reviews Table */}
            <div className="overflow-x-auto">
                {isLoading ? (
                    <div className="py-20 text-center text-gray-500">
                        <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full mb-4"></div>
                        <p>Loading reviews...</p>
                    </div>
                ) : error ? (
                    <div className="py-20 text-center text-red-500">
                        <p className="text-lg mb-2">Error loading reviews</p>
                        <p className="text-sm">{error}</p>
                        <button
                            onClick={() => fetchReviews()}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="py-20 text-center text-gray-500">
                        <p className="text-lg">No reviews found</p>
                        <p className="text-sm mt-2">Try changing your filters</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Product
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rating
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Comment
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reviews.map((review) => (
                                <tr
                                    key={review.review_id}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => onReviewClick(review.review_id)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {review.review_id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {review.user.username}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {review.user.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {review.product.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {renderStarRating(review.rate)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 max-w-xs truncate">
                                            {review.content || "No comment provided"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(review.creation_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <div className="flex justify-end items-center space-x-2" onClick={e => e.stopPropagation()}>
                                            {status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={(e) => handleApproveReview(review.review_id, e)}
                                                        className="text-green-600 hover:text-green-900 p-1 hover:bg-green-100 rounded-full"
                                                        title="Approve"
                                                    >
                                                        <FiCheck size={18} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleRejectReview(review.review_id, e)}
                                                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-100 rounded-full"
                                                        title="Reject"
                                                    >
                                                        <FiX size={18} />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onReviewClick(review.review_id);
                                                }}
                                                className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-100 rounded-full"
                                                title="View Details"
                                            >
                                                <FiEye size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {!isLoading && !error && reviews.length > 0 && (
                <div className="px-4 py-3 bg-gray-50 border-t flex flex-col sm:flex-row items-center justify-between">
                    <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                        Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                        <span className="font-medium">
                            {Math.min(currentPage * itemsPerPage, totalReviews)}
                        </span>{' '}
                        of <span className="font-medium">{totalReviews}</span> reviews
                    </div>

                    <div className="flex items-center space-x-2">
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="px-2 py-1 border rounded-md text-sm"
                        >
                            <option value="10">10 per page</option>
                            <option value="25">25 per page</option>
                            <option value="50">50 per page</option>
                            <option value="100">100 per page</option>
                        </select>

                        <nav className="inline-flex rounded-md shadow-sm -space-x-px">
                            <button
                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${currentPage === 1
                                    ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="sr-only">Previous</span>
                                &larr;
                            </button>

                            {/* Page numbers */}
                            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                // Calculate the page number to display
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                // Only render if the page number is valid
                                if (pageNum > 0 && pageNum <= totalPages) {
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`relative inline-flex items-center px-4 py-2 border ${currentPage === pageNum
                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                }
                                return null;
                            })}

                            <button
                                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${currentPage === totalPages
                                    ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="sr-only">Next</span>
                                &rarr;
                            </button>
                        </nav>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewList;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl, currency } from '../App';
import { FiSearch, FiFilter, FiRefreshCw, FiCopy, FiX } from 'react-icons/fi';
import commissionService from '../services/commissionService';

// Modal Component for Affiliate Link
const AffiliateLinkModal = ({ isOpen, onClose, linkData }) => {
    const [copySuccess, setCopySuccess] = useState(false);

    // Copy link to clipboard
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(
            () => {
                setCopySuccess(true);
                toast.success('Link copied to clipboard!');

                // Reset success state after 3 seconds
                setTimeout(() => {
                    setCopySuccess(false);
                }, 3000);
            },
            () => {
                toast.error('Failed to copy link');
            }
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center border-b p-4">
                    <h3 className="text-lg font-semibold text-gray-800">Your Affiliate Link</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">
                            Share this link with your audience. You'll earn commissions for successful purchases made through this link.
                        </p>

                        <div className="flex items-center border rounded-md overflow-hidden mt-3">
                            <input
                                type="text"
                                value={linkData?.affiliate_link || ''}
                                readOnly
                                className="flex-grow p-3 text-sm bg-gray-50 focus:outline-none truncate"
                            />
                            <button
                                onClick={() => copyToClipboard(linkData?.affiliate_link)}
                                className="bg-gray-100 hover:bg-gray-200 p-3 text-gray-600 border-l"
                                title="Copy to clipboard"
                            >
                                {copySuccess ? (
                                    <span className="text-green-600 px-2">Copied!</span>
                                ) : (
                                    <FiCopy />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 bg-gray-50 p-4 rounded-md border border-gray-200">
                        <h4 className="font-medium text-gray-800 mb-2">How to use:</h4>
                        <ol className="list-decimal text-left pl-5 text-sm text-gray-600 space-y-2">
                            <li>Copy the link above by clicking the copy button</li>
                            <li>Share this link on your social media platforms or website</li>
                            <li>When someone makes a purchase using your link, you'll earn {linkData?.commission_rate}% commission</li>
                            <li>Track your earnings in the "My Commissions" dashboard</li>
                        </ol>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 mr-2"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => copyToClipboard(linkData?.affiliate_link)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            {copySuccess ? 'Copied!' : 'Copy Link'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CommissionPage = () => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // State for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(12);

    // State for filters and search
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sortBy, setSortBy] = useState('commission_rate');
    const [sortOrder, setSortOrder] = useState('DESC');
    const [categories, setCategories] = useState([]);

    // State for link generation
    const [generatingLinkFor, setGeneratingLinkFor] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentLinkData, setCurrentLinkData] = useState(null);

    // Fetch products
    const fetchProducts = async (resetPage = false) => {
        try {
            setIsLoading(true);
            setError(null);

            // Reset to page 1 if filters changed
            const page = resetPage ? 1 : currentPage;
            if (resetPage) {
                setCurrentPage(1);
            }

            // Build query params
            const params = new URLSearchParams({
                page,
                limit: itemsPerPage,
                sort_by: sortBy,
                sort_order: sortOrder,
                search: searchTerm,
                category_id: categoryFilter
            });

            const response = await axios.get(`${backendUrl}/api/commission/products?${params.toString()}`, {
                headers: { token: localStorage.getItem('token') }
            });

            if (response.data.success) {
                setProducts(response.data.products);
                setTotalProducts(response.data.pagination.total);
                setTotalPages(response.data.pagination.pages);
            } else {
                setError(response.data.message || 'Failed to load products');
                setProducts([]);
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'An error occurred');
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await commissionService.getCategories();
            if (response.success) {
                setCategories(response.data);
            } else {
                setCategories([]);
            }
        } catch (error) {
            setCategories([]);
            console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [currentPage, sortBy, sortOrder, itemsPerPage]);

    // Handle search input changes
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Apply filters when filter button is clicked
    const handleApplyFilters = () => {
        fetchProducts(true);
    };

    // Reset all filters
    const handleResetFilters = () => {
        setSearchTerm('');
        setCategoryFilter('');
        setSortBy('commission_rate');
        setSortOrder('DESC');
        fetchProducts(true);
    };

    // Generate affiliate link
    const handleGetLink = async (productId) => {
        try {
            setGeneratingLinkFor(productId);

            // Find the current product to get its commission rate
            const currentProduct = products.find(product => product.product_id === productId);

            const response = await axios.post(
                `${backendUrl}/api/commission/generate-link`,
                { product_id: productId },
                { headers: { token: localStorage.getItem('token') } }
            );

            if (response.data.success) {
                setProducts(prevProducts =>
                    prevProducts.map(product =>
                        product.product_id === productId
                            ? {
                                ...product,
                                has_affiliate_link: true,
                                affiliate_link: response.data.data.affiliate_link
                            }
                            : product
                    )
                );

                // Show modal with the link
                setCurrentLinkData({
                    ...response.data.data,
                    commission_rate: currentProduct?.commission_rate || 0
                });
                setModalOpen(true);
                toast.success(response.data.message || 'Affiliate link generated successfully');
            } else {
                toast.error(response.data.message || 'Failed to generate link');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'An error occurred');
        } finally {
            setGeneratingLinkFor(null);
        }
    };

    // Show link in modal for existing links
    const handleShowLink = (product) => {
        setCurrentLinkData({
            link_id: product.link_id,
            affiliate_link: product.affiliate_link,
            commission_rate: product.commission_rate
        });
        setModalOpen(true);
    };

    // Handle pagination
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    // Debug pagination values
    console.log({
        currentPage,
        totalPages,
        totalProducts,
        itemsPerPage
    });

    return (
        <div className="w-full">
            <h3 className="text-xl font-bold text-left p-6">Commission Products</h3>

            {/* Search and Filter Section */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    {/* Search input */}
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full h-10 px-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    {/* Category filter */}
                    <div className="relative w-full md:w-64">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category.category_id} value={category.category_id}>
                                    {category.display_text}
                                </option>
                            ))}
                        </select>
                        <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    {/* Sort options */}
                    <div className="relative w-full md:w-64">
                        <select
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(e) => {
                                const [field, order] = e.target.value.split('-');
                                setSortBy(field);
                                setSortOrder(order);
                            }}
                            className="w-full pl-10 pr-4 py-2 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            <option value="commission_rate-DESC">Highest Commission</option>
                            <option value="commission_rate-ASC">Lowest Commission</option>
                        </select>
                        <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                {/* Filter buttons */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={handleResetFilters}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        disabled={isLoading}
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleApplyFilters}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        disabled={isLoading}
                    >
                        Apply Filters
                    </button>
                    <button
                        onClick={() => fetchProducts()}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full"
                        title="Refresh products"
                        disabled={isLoading}
                    >
                        <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Products Grid */}
            <div className="bg-white rounded-lg shadow-sm p-4">
                {isLoading ? (
                    <div className="py-20 text-center text-gray-500">
                        <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-red-600 rounded-full mb-4"></div>
                        <p>Loading products...</p>
                    </div>
                ) : error ? (
                    <div className="py-20 text-center text-red-500">
                        <p className="text-lg mb-2">Error loading products</p>
                        <p className="text-sm">{error}</p>
                        <button
                            onClick={() => fetchProducts()}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            Try Again
                        </button>
                    </div>
                ) : products.length === 0 ? (
                    <div className="py-20 text-center text-gray-500">
                        <p className="text-lg">No products found</p>
                        <p className="text-sm mt-2">Try changing your filters</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <div key={product.product_id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    {/* Product Image */}
                                    <div className="relative h-60 bg-gray-100">
                                        <img
                                            crossOrigin="anonymous"
                                            src={product.image
                                                ? `${backendUrl}${product.image}`
                                                : `${backendUrl}/products/default_image.jpg`
                                            }
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://placehold.co/300x200';
                                            }}
                                        />
                                        {/* Commission Badge */}
                                        <div className="absolute top-0 right-0 bg-red-600 text-white px-2 py-1 text-sm">
                                            {product.commission_rate}% Commission
                                        </div>
                                    </div>

                                    {/* Product Details */}
                                    <div className="p-4">
                                        <h3 className="font-semibold mb-1 truncate" title={product.name}>
                                            {product.name}
                                        </h3>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-red-600">{currency}{product.price.toLocaleString()}</span>
                                            <span className="text-sm text-gray-500">{product.sold_count || 0} sold</span>
                                        </div>

                                        {/* Affiliate Link Button */}
                                        {product.has_affiliate_link ? (
                                            <button
                                                onClick={() => handleShowLink(product)}
                                                className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                            >
                                                Show Affiliate Link
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleGetLink(product.product_id)}
                                                disabled={generatingLinkFor === product.product_id}
                                                className="w-full mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300"
                                            >
                                                {generatingLinkFor === product.product_id ? (
                                                    <span className="flex items-center justify-center">
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Generating...
                                                    </span>
                                                ) : (
                                                    'Get Link'
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">
                                        Page {currentPage} of {totalPages} ({totalProducts} products)
                                    </span>
                                </div>

                                <nav className="inline-flex rounded-md shadow-sm -space-x-px ml-4">
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
                                                        ? 'z-10 bg-red-50 border-red-500 text-red-600'
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
                        )}
                    </>
                )}
            </div>

            {/* Affiliate Link Modal */}
            <AffiliateLinkModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                linkData={currentLinkData}
            />
        </div>
    );
};

export default CommissionPage;
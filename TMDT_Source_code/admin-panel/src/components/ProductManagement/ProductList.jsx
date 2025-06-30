import React, { useState, useEffect } from 'react';
import { backendUrl, currency } from '../../App';
import { FiSearch, FiFilter, FiChevronDown, FiChevronUp, FiRefreshCw } from 'react-icons/fi';
import DeleteConfirmationModal from '../DeleteConfirm';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import { toast } from 'react-toastify';
import ProductDetailsModal from './ProductDetailsModel';

const ProductList = ({ onEdit, isLoading: externalLoading, setActiveTab }) => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(externalLoading || false);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [stockFilter, setStockFilter] = useState('all'); // 'all', 'in_stock', 'out_of_stock'

    const [sortField, setSortField] = useState('creation_at');
    const [sortOrder, setSortOrder] = useState('DESC');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [categories, setCategories] = useState([]);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const handleProductClick = (product) => {
        setSelectedProduct(product);
        setIsDetailsModalOpen(true);
    };

    // Fetch products based on current filters, sorting and pagination
    const fetchProducts = async (resetPage = false) => {
        try {
            setIsLoading(true);
            setError(null);

            const page = resetPage ? 1 : currentPage;
            if (resetPage) {
                setCurrentPage(1);
            }

            const queryParams = {
                page,
                limit: itemsPerPage,
                sort_by: sortField,
                sort_order: sortOrder
            };

            if (searchTerm) queryParams.search = searchTerm;
            if (categoryFilter) queryParams.category_id = categoryFilter;
            if (priceRange.min) queryParams.min_price = priceRange.min;
            if (priceRange.max) queryParams.max_price = priceRange.max;
            if (stockFilter !== 'all') {
                queryParams.in_stock = stockFilter === 'in_stock' ? 'true' : 'false';
            }

            const response = await productService.getProducts(queryParams);

            if (response.success) {
                setProducts(response.products);
                setTotalPages(response.pagination.pages);
                setTotalProducts(response.pagination.total);
            } else {
                setError(response.message || 'Failed to load products');
                setProducts([]);
            }
        } catch (error) {
            setError(error.message || 'An error occurred');
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch categories for the filter dropdown
    const fetchCategories = async () => {
        try {
            const response = await categoryService.getCategories();
            if (response.success) {
                setCategories(response.data || []);
            } else {
                console.error('Failed to load categories:', response.message);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, []);

    // Fetch products when filters, sorting or pagination changes
    useEffect(() => {
        fetchProducts();
    }, [currentPage, itemsPerPage, sortField, sortOrder]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleApplyFilters = () => {
        fetchProducts(true);
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setCategoryFilter('');
        setPriceRange({ min: '', max: '' });
        setStockFilter('all');
        fetchProducts(true);
    };

    // Handle sorting changes
    const handleSortChange = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSortField(field);
            setSortOrder('DESC');
        }
    };

    // Get sort indicator component
    const getSortIndicator = (field) => {
        if (sortField !== field) return null;
        return sortOrder === 'ASC' ? <FiChevronUp className="inline ml-1" /> : <FiChevronDown className="inline ml-1" />;
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleDeleteProduct = (product) => {
        setProductToDelete(product);
        setIsDetailsModalOpen(false);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!productToDelete) return;

        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const response = await productService.deleteProduct(productToDelete.id, token);

            if (response.success) {
                toast.success('Product deleted successfully');
                fetchProducts();
                setIsDeleteModalOpen(false);
                setProductToDelete(null);
            } else {
                toast.error(response.message || 'Failed to delete product');
            }
        } catch (error) {
            toast.error(error.message || 'An error occurred while deleting');
            console.error('Error deleting product:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditProduct = async (product) => {
        try {
            if (onEdit) {
                setIsLoading(true);
                const token = localStorage.getItem('token');
                const response = await productService.getProductForEdit(product.id, token);

                if (response.success) {
                    onEdit(response.product);
                    setIsDetailsModalOpen(false);
                    setActiveTab(1);
                } else {
                    toast.error(response.message || 'Failed to get product details');
                }
                setIsLoading(false);
            }
        } catch (error) {
            toast.error('Error fetching product details: ' + (error.message || 'Unknown error'));
            console.error('Error fetching product details:', error);
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md">
            {/* Header and Filter Section */}
            <div className="p-4 border-b">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                        Products
                        {totalProducts > 0 && <span className="text-sm text-gray-500 ml-2">({totalProducts})</span>}
                    </h2>
                    <button
                        onClick={() => fetchProducts()}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                        title="Refresh products"
                        disabled={isLoading}
                    >
                        <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
                    </button>
                </div>

                {/* Search and filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {/* Search input */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    {/* Category filter */}
                    <div className="relative">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                    {/* Price range */}
                    <div className="flex space-x-2">
                        <input
                            type="number"
                            placeholder="Min price"
                            value={priceRange.min}
                            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                            className="w-1/2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                        />
                        <input
                            type="number"
                            placeholder="Max price"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                            className="w-1/2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                        />
                    </div>

                    {/* Stock filter */}
                    <div className="relative">
                        <select
                            value={stockFilter}
                            onChange={(e) => setStockFilter(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Stock Status</option>
                            <option value="in_stock">In Stock</option>
                            <option value="out_of_stock">Out of Stock</option>
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

            {/* Products Table */}
            <div className="overflow-x-auto">
                {isLoading ? (
                    <div className="py-20 text-center text-gray-500">
                        <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full mb-4"></div>
                        <p>Loading products...</p>
                    </div>
                ) : error ? (
                    <div className="py-20 text-center text-red-500">
                        <p className="text-lg mb-2">Error loading products</p>
                        <p className="text-sm">{error}</p>
                        <button
                            onClick={() => fetchProducts()}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                    </div>
                ) : products.length === 0 ? (
                    <div className="py-20 text-center text-gray-500">
                        <p className="text-lg">No products found</p>
                        <p className="text-sm mt-2">Try changing your filters or adding new products</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Image
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSortChange('name')}
                                >
                                    Product Name {getSortIndicator('name')}
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    SubCategory
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSortChange('commission_rate')}>
                                    Commission {getSortIndicator('commission_rate')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Stock Status
                                </th>
                                <th
                                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSortChange('creation_at')}
                                >
                                    Created {getSortIndicator('creation_at')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.map((product) => (
                                <tr
                                    key={product.id}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => handleProductClick(product)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <img
                                            crossOrigin="anonymous"
                                            src={product.images && product.images.length > 0
                                                ? `${backendUrl}${product.images[0].url}`
                                                : `${backendUrl}/products/default_image.jpg`
                                            }
                                            alt={product.images && product.images.length > 0
                                                ? product.images[0].alt
                                                : product.name
                                            }
                                            className="h-16 w-16 object-cover rounded-md border border-gray-200"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = `${backendUrl}/uploads/products/default_image.jpg`;
                                            }}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900 hover:text-blue-600">
                                            {product.name}
                                        </div>
                                        {product.sku && (
                                            <div className="text-xs text-gray-500">SKU: {product.sku}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className="text-sm text-gray-900">
                                            {product.category?.name || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className="text-sm text-gray-900">
                                            {product.subCategory?.name || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        {product.price ? (
                                            product.price.range ? (
                                                <span className="text-sm text-gray-900">
                                                    {currency}{product.price.min} - {currency}{product.price.max}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-gray-900">
                                                    {currency}{product.price.min}
                                                </span>
                                            )
                                        ) : (
                                            <span className="text-sm text-gray-500">Not set</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className=" text-sm text-gray-900">
                                            {product.commission_rate || '0'}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        {product.in_stock ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                In Stock
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                Out of Stock
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(product.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {!isLoading && !error && products.length > 0 && (
                <div className="px-4 py-3 bg-gray-50 border-t flex flex-col sm:flex-row items-center justify-between">
                    <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                        Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                        <span className="font-medium">
                            {Math.min(currentPage * itemsPerPage, totalProducts)}
                        </span>{' '}
                        of <span className="font-medium">{totalProducts}</span> products
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

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setProductToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                itemName={productToDelete?.name || ''}
                itemType="product"
            />

            {/* Product Details Modal */}
            <ProductDetailsModal
                productId={selectedProduct?.id}
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
            />
        </div>
    );
};

export default ProductList;
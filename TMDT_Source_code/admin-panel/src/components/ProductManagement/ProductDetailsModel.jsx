import React, { useState, useEffect } from 'react';
import { FiX, FiChevronLeft, FiChevronRight, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { currency, backendUrl } from '../../App';
import productService from '../../services/productService';

const ProductDetailsModal = ({ productId, isOpen, onClose, onEdit, onDelete }) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Fetch product details when the modal opens
    useEffect(() => {
        if (isOpen && productId) {
            fetchProductDetails();
        }
    }, [isOpen, productId]);

    const fetchProductDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await productService.getProductDetails(productId);

            if (response.success) {
                setProduct(response.product);
            } else {
                setError(response.message || 'Failed to load product details');
            }
        } catch (error) {
            setError(error.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Handle image navigation
    const nextImage = () => {
        if (product?.images?.length > 0) {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
            );
        }
    };

    const prevImage = () => {
        if (product?.images?.length > 0) {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
            );
        }
    };

    // Handle edit and delete actions
    const handleEdit = () => {
        if (onEdit && product) {
            onEdit(product);
            onClose();
        }
    };

    const handleDelete = () => {
        if (onDelete && product) {
            onDelete(product);
            onClose();
        }
    };

    // Calculate price range from inventory
    const getPriceDisplay = (inventory) => {
        if (!inventory || inventory.length === 0) {
            return <span className="text-gray-500">Price not available</span>;
        }

        const prices = inventory.map(item => parseFloat(item.price));
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        return minPrice === maxPrice ?
            `${currency}${minPrice.toFixed(2)}` :
            `${currency}${minPrice.toFixed(2)} - ${currency}${maxPrice.toFixed(2)}`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Modal header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <h3 className="text-xl font-semibold text-gray-900">Product Details</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                        <FiX size={24} />
                    </button>
                </div>

                {/* Modal content - with scrollable content */}
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 135px)' }}>
                    <div className="px-6 py-4">
                        {loading ? (
                            <div className="py-20 text-center">
                                <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full mb-4"></div>
                                <p className="text-gray-500">Loading product details...</p>
                            </div>
                        ) : error ? (
                            <div className="py-20 text-center text-red-500">
                                <p className="text-lg mb-2">Error loading product details</p>
                                <p className="text-sm">{error}</p>
                                <button
                                    onClick={fetchProductDetails}
                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : product ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Product images */}
                                <div className="space-y-4">
                                    <div className="relative bg-gray-50 rounded-lg border overflow-hidden" style={{ height: '350px' }}>
                                        {product.images && product.images.length > 0 ? (
                                            <>
                                                <div className="h-full flex items-center justify-center">
                                                    <img
                                                        crossOrigin="anonymous"
                                                        src={`${backendUrl}${product.images[currentImageIndex].url}`}
                                                        alt={product.images[currentImageIndex].alt || product.name}
                                                        className="max-h-full max-w-full object-contain"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = `${backendUrl}/uploads/products/default_image.jpg`;
                                                        }}
                                                    />
                                                </div>

                                                {/* Image caption */}
                                                <div className="absolute bottom-0 left-0 right-0 text-sm text-center text-gray-600 bg-white bg-opacity-75 py-1">
                                                    {product.images[currentImageIndex].alt || `Image ${currentImageIndex + 1} of ${product.images.length}`}
                                                </div>

                                                {product.images.length > 1 && (
                                                    <div className="absolute inset-y-0 left-0 right-0 flex justify-between items-center px-2">
                                                        <button
                                                            onClick={prevImage}
                                                            className="p-2 rounded-full bg-white bg-opacity-75 hover:bg-opacity-100 focus:outline-none shadow"
                                                        >
                                                            <FiChevronLeft size={20} />
                                                        </button>
                                                        <button
                                                            onClick={nextImage}
                                                            className="p-2 rounded-full bg-white bg-opacity-75 hover:bg-opacity-100 focus:outline-none shadow"
                                                        >
                                                            <FiChevronRight size={20} />
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-gray-500">
                                                <img
                                                    crossOrigin="anonymous"
                                                    src={`${backendUrl}/uploads/products/default_image.jpg`}
                                                    alt="Default product image"
                                                    className="max-h-full max-w-full object-contain opacity-50"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Image thumbnails */}
                                    {product.images && product.images.length > 1 && (
                                        <div className="flex space-x-2 overflow-x-auto">
                                            {product.images.map((image, index) => (
                                                <button
                                                    key={image.id || index}
                                                    onClick={() => setCurrentImageIndex(index)}
                                                    className={`flex-shrink-0 w-16 h-16 border-2 rounded overflow-hidden ${currentImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                                                        }`}
                                                >
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                                        <img
                                                            crossOrigin="anonymous"
                                                            src={`${backendUrl}${image.url}`}
                                                            alt={image.alt || `Thumbnail ${index + 1}`}
                                                            className="max-h-full max-w-full object-contain"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = `${backendUrl}/uploads/products/default_image.jpg`;
                                                            }}
                                                        />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Product information */}
                                <div className="space-y-5">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
                                        {product.sku && (
                                            <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
                                        )}
                                    </div>

                                    {/* Price */}
                                    <div className="text-2xl font-bold text-blue-600">
                                        {getPriceDisplay(product.inventory)}
                                    </div>

                                    {/* Category & SubCategory */}
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Category</p>
                                        <p className="font-medium text-gray-900">
                                            {product.category ? (
                                                <>
                                                    {product.category.parent?.name && (
                                                        <span>{product.category.parent.name} &gt; </span>
                                                    )}
                                                    {product.category.name}
                                                    {product.subCategory && (
                                                        <span> &gt; {product.subCategory.name}</span>
                                                    )}
                                                </>
                                            ) : (
                                                'Uncategorized'
                                            )}
                                        </p>
                                    </div>

                                    {/* Available Sizes and Inventory */}
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-2">Available Sizes</p>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 border rounded">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {product.inventory && product.inventory.length > 0 ? (
                                                        product.inventory.map((item) => (
                                                            <tr key={item.id || item.size}>
                                                                <td className="px-3 py-2 text-sm font-medium">{item.size}</td>
                                                                <td className="px-3 py-2 text-sm">{currency}{parseFloat(item.price).toFixed(2)}</td>
                                                                <td className="px-3 py-2 text-sm">{item.quantity}</td>
                                                                <td className="px-3 py-2 text-sm">
                                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                                        }`}>
                                                                        {item.available ? 'In Stock' : 'Out of Stock'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="4" className="px-3 py-2 text-sm text-center text-gray-500">
                                                                No inventory information available
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Stock status */}
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Overall Stock Status</p>
                                        <p className="font-medium">
                                            {!product.out_of_stock ? (
                                                <span className="text-green-600">In Stock</span>
                                            ) : (
                                                <span className="text-red-600">Out of Stock</span>
                                            )}
                                        </p>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Description</p>
                                        <div className="mt-2 text-gray-700 whitespace-pre-line">
                                            {product.description || 'No description available.'}
                                        </div>
                                    </div>

                                    {/* Additional details */}
                                    <div className="grid grid-cols-2 gap-4 pt-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Commission Rate</p>
                                            <p className="font-medium">
                                                {product.commission_rate !== null ? `${product.commission_rate}%` : 'Not set'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Reviews</p>
                                            <p className="font-medium">{product.reviews_count || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Created</p>
                                            <p className="font-medium">
                                                {new Date(product.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Last Updated</p>
                                            <p className="font-medium">
                                                {new Date(product.updated_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-20 text-center text-gray-500">
                                <p>No product selected</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal footer - fixed at bottom */}
                {product && (
                    <div className="border-t px-6 py-3 flex justify-end space-x-3 bg-gray-50">
                        <button
                            onClick={handleEdit}
                            className="px-4 py-2 flex items-center text-blue-600 bg-white border border-blue-300 rounded-md hover:bg-blue-50"
                        >
                            <FiEdit2 className="mr-2" /> Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 flex items-center text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50"
                        >
                            <FiTrash2 className="mr-2" /> Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetailsModal;
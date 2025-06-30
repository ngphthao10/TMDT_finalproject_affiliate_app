import React, { useState } from 'react';
import { FiX, FiCheck, FiAlertTriangle, FiStar, FiCalendar, FiUser, FiPackage, FiMessageSquare } from 'react-icons/fi';
import { toast } from 'react-toastify';
import reviewService from '../../services/reviewService';
import { backendUrl } from '../../App';


const ReviewDetailsModal = ({ review, isOpen, onClose, onReviewUpdate, token }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectionForm, setShowRejectionForm] = useState(false);

    if (!isOpen || !review) return null;

    // Handle approve review
    const handleApprove = async () => {
        try {
            setIsLoading(true);
            const response = await reviewService.updateReviewStatus(review.review_id, 'approved');
            if (response.success) {
                onReviewUpdate(response.data);
                onClose();
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
    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error('Please provide a reason for rejection');
            return;
        }

        try {
            setIsLoading(true);
            const response = await reviewService.updateReviewStatus(
                review.review_id,
                'rejected',
                rejectionReason
            );

            if (response.success) {
                onReviewUpdate(response.data);
                onClose();
            } else {
                toast.error(response.message || 'Failed to reject review');
            }
        } catch (error) {
            toast.error(error.message || 'An error occurred while rejecting review');
        } finally {
            setIsLoading(false);
            setShowRejectionForm(false);
        }
    };

    // Render star rating
    const renderStarRating = (rating) => {
        return (
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className={`${star <= rating ? 'text-yellow-400' : 'text-gray-300'} text-xl`}
                    >
                        ★
                    </span>
                ))}
                <span className="ml-2 text-sm font-medium text-gray-700">{rating}/5</span>
            </div>
        );
    };

    // Format date for better readability
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('default', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Modal header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div className="flex items-center space-x-4">
                        <h3 className="text-xl font-semibold text-gray-900">Review Details</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${review.status === 'approved' ? 'bg-green-100 text-green-800' :
                            review.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                            {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                        <FiX size={24} />
                    </button>
                </div>

                {/* Modal content */}
                <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 180px)' }}>
                    <div className="space-y-6">
                        {/* Top Row: Product Info & Rating */}
                        <div className="grid grid-cols-3 gap-6">
                            {/* Product Info Card */}
                            <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <h4 className="flex items-center text-gray-900 font-medium">
                                            <FiPackage className="text-blue-500 mr-2" size={20} />
                                            Product Information
                                        </h4>
                                        <span className="text-xs text-gray-500">Review ID: #{review.review_id}</span>
                                    </div>
                                </div>

                                <div className="p-6 flex items-start">
                                    {review.product?.small_image && (
                                        <img
                                            crossOrigin='anonymous'
                                            src={`${backendUrl}${review.product.small_image}`}
                                            alt={review.product?.name}
                                            className="w-20 h-20 object-cover rounded-lg mr-4 border"

                                        />
                                    )}
                                    <div>
                                        <p className="text-lg font-semibold text-gray-900">{review.product?.name || 'Unknown Product'}</p>
                                        {review.product?.sku && (
                                            <p className="text-sm text-gray-500 mt-1">SKU: {review.product.sku}</p>
                                        )}
                                        {review.product?.description && (
                                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{review.product.description}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Rating Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <h4 className="flex items-center text-gray-900 font-medium">
                                            <FiStar className="text-blue-500 mr-2" size={20} />
                                            Rating
                                        </h4>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                                        <div className="text-4xl font-bold text-yellow-500">{review.rate}.0</div>
                                        <div className="flex items-center">{renderStarRating(review.rate)}</div>
                                        <div className={`px-3 py-1.5 mt-2 text-sm font-medium rounded-full 
                                            ${review.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                review.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'}`}>
                                            {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Review Content Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h4 className="flex items-center text-gray-900 font-medium">
                                        <FiMessageSquare className="text-blue-500 mr-2" size={20} />
                                        Review Content
                                    </h4>
                                    <span className="text-sm text-gray-500">{formatDate(review.creation_at)}</span>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    {review.content ? (
                                        <p className="text-gray-800 whitespace-pre-line">{review.content}</p>
                                    ) : (
                                        <p className="text-gray-500 italic">No review content provided</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Customer Info Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h4 className="flex items-center text-gray-900 font-medium">
                                        <FiUser className="text-blue-500 mr-2" size={20} />
                                        Customer Information
                                    </h4>
                                </div>
                            </div>

                            <div className="p-6 grid grid-cols-2 gap-6">
                                <div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs text-gray-500">Username</label>
                                            <p className="mt-1 text-sm font-medium text-gray-900">{review.user?.username || 'Unknown'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs text-gray-500">Email</label>
                                            <p className="mt-1 text-sm font-medium text-blue-600">{review.user?.email || 'No email'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rejection Reason (if exists) */}
                        {review.rejection_reason && (
                            <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
                                <div className="bg-red-50 px-6 py-4 border-b border-red-200">
                                    <div className="flex items-center justify-between">
                                        <h4 className="flex items-center text-red-800 font-medium">
                                            <FiAlertTriangle className="text-red-500 mr-2" size={20} />
                                            Rejection Reason
                                        </h4>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <p className="text-red-700">{review.rejection_reason}</p>
                                </div>
                            </div>
                        )}

                        {/* Rejection form */}
                        {showRejectionForm && (
                            <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
                                <div className="bg-red-50 px-6 py-4 border-b border-red-200">
                                    <div className="flex items-center justify-between">
                                        <h4 className="flex items-center text-red-800 font-medium">
                                            <FiAlertTriangle className="text-red-500 mr-2" size={20} />
                                            Provide Rejection Reason
                                        </h4>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Please provide a reason for rejecting this review"
                                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                                        rows={3}
                                    />
                                    <div className="flex justify-end mt-4 space-x-3">
                                        <button
                                            onClick={() => setShowRejectionForm(false)}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                            disabled={isLoading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleReject}
                                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none"
                                            disabled={isLoading || !rejectionReason.trim()}
                                        >
                                            {isLoading ? (
                                                <span className="flex items-center">
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Processing...
                                                </span>
                                            ) : 'Confirm Rejection'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal footer */}
                {review.status === 'pending' && (
                    <div className="border-t px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                        <button
                            onClick={() => setShowRejectionForm(true)}
                            className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center"
                            disabled={isLoading || showRejectionForm}
                        >
                            <FiAlertTriangle className="mr-2" />
                            Reject
                        </button>
                        <button
                            onClick={handleApprove}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center"
                            disabled={isLoading}
                        >
                            <FiCheck className="mr-2" />
                            {isLoading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : 'Approve'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewDetailsModal;
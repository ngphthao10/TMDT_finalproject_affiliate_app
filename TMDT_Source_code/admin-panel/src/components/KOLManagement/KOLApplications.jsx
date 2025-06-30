import React, { useState, useEffect } from 'react';
import { FiSearch, FiRefreshCw, FiCheck, FiX, FiChevronDown, FiChevronUp, FiExternalLink, FiUser, FiFileText, FiShare2, FiSlash } from 'react-icons/fi';
import { FaInstagram, FaTiktok, FaFacebook, FaYoutube } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { backendUrl } from '../../App';
import kolService from '../../services/kolService';

const KOLApplications = ({ onApprove, onReject, isLoading: externalLoading, refreshTrigger, token }) => {
    // State for applications data
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(externalLoading || false);
    const [error, setError] = useState(null);

    // State for filters
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('creation_at');
    const [sortOrder, setSortOrder] = useState('DESC');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalApplications, setTotalApplications] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // State for application detail
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectionForm, setShowRejectionForm] = useState(false);

    // Fetch KOL applications
    const fetchApplications = async (resetPage = false) => {
        try {
            setIsLoading(true);
            setError(null);

            // Reset to page 1 if filters changed
            const page = resetPage ? 1 : currentPage;
            if (resetPage) {
                setCurrentPage(1);
            }

            // Build query params
            const queryParams = {
                page,
                limit: itemsPerPage,
                sort_by: sortField,
                sort_order: sortOrder,
                search: searchTerm
            };

            const response = await kolService.getApplications(queryParams);

            if (response.success) {
                setApplications(response.applications || []);
                setTotalApplications(response.pagination?.total || 0);
                setTotalPages(response.pagination?.pages || 1);
            } else {
                setError(response.message || 'Failed to load applications');
                setApplications([]);
            }
        } catch (error) {
            const errorMessage = error.message || 'An error occurred';
            setError(errorMessage);
            setApplications([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial data load
    useEffect(() => {
        fetchApplications();
    }, []);

    // Refresh when refreshTrigger changes
    useEffect(() => {
        if (refreshTrigger > 0) {
            fetchApplications();
        }
    }, [refreshTrigger]);

    // Fetch applications when filters, sorting or pagination changes
    useEffect(() => {
        fetchApplications();
    }, [currentPage, itemsPerPage, sortField, sortOrder]);

    // Handle search input changes
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Apply search filter
    const handleApplySearch = () => {
        fetchApplications(true);
    };

    // Handle sorting changes
    const handleSortChange = (field) => {
        if (sortField === field) {
            // Toggle sort order if clicking the same field
            setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
        } else {
            // Set new sort field and default to DESC
            setSortField(field);
            setSortOrder('DESC');
        }
    };

    // Get sort indicator component
    const getSortIndicator = (field) => {
        if (sortField !== field) return null;
        return sortOrder === 'ASC' ? <FiChevronUp className="inline ml-1" /> : <FiChevronDown className="inline ml-1" />;
    };

    // Handle pagination
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Handle opening application review modal
    const handleOpenReview = async (application) => {
        try {
            setIsLoading(true);
            // Get detailed application info if needed
            const response = await kolService.getApplicationDetails(application.influencer_id);

            if (response.success) {
                setSelectedApplication(response.data);
                setIsReviewModalOpen(true);
                setShowRejectionForm(false);
                setRejectionReason('');
            } else {
                toast.error(response.message || 'Failed to get application details');
            }
        } catch (error) {
            toast.error(error.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle approving application
    const handleApprove = async () => {
        if (!selectedApplication) return;

        try {
            setIsLoading(true);
            const response = await kolService.approveApplication(selectedApplication.influencer_id);

            if (response.success) {
                toast.success(`Application from ${selectedApplication.user.username} approved successfully`);
                setIsReviewModalOpen(false);
                setSelectedApplication(null);
                if (onApprove) onApprove();
                fetchApplications();
            } else {
                toast.error(response.message || 'Failed to approve application');
            }
        } catch (error) {
            const errorMessage = error.message || 'An error occurred while approving';
            toast.error(errorMessage);
            console.error('Error approving application:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle rejecting application
    const handleReject = async () => {
        if (!selectedApplication) return;
        if (showRejectionForm && !rejectionReason.trim()) {
            toast.error('Please provide a reason for rejection');
            return;
        }

        try {
            setIsLoading(true);
            const response = await kolService.rejectApplication(
                selectedApplication.influencer_id,
                { reason: rejectionReason }
            );

            if (response.success) {
                toast.success(`Application from ${selectedApplication.user.username} rejected`);
                setIsReviewModalOpen(false);
                setSelectedApplication(null);
                setRejectionReason('');
                if (onReject) onReject();
                fetchApplications();
            } else {
                toast.error(response.message || 'Failed to reject application');
            }
        } catch (error) {
            const errorMessage = error.message || 'An error occurred while rejecting';
            toast.error(errorMessage);
            console.error('Error rejecting application:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Get icon based on platform
    const getSocialIcon = (platform) => {
        switch (platform.toLowerCase()) {
            case 'instagram':
                return <FaInstagram size={18} className="text-pink-600" />;
            case 'tiktok':
                return <FaTiktok size={18} className="text-black" />;
            case 'facebook':
                return <FaFacebook size={18} className="text-blue-600" />;
            case 'youtube':
                return <FaYoutube size={18} className="text-red-600" />;
            default:
                return <FiExternalLink size={18} />;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md">
            {/* Header and Filter Section */}
            <div className="p-4 border-b">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                        KOL Applications
                        {totalApplications > 0 && <span className="text-sm text-gray-500 ml-2">({totalApplications})</span>}
                    </h2>
                    <button
                        onClick={() => fetchApplications()}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                        title="Refresh applications"
                        disabled={isLoading}
                    >
                        <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
                    </button>
                </div>

                {/* Search input */}
                <div className="flex">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <button
                        onClick={handleApplySearch}
                        className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        disabled={isLoading}
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* Applications Table */}
            <div className="overflow-x-auto">
                {isLoading ? (
                    <div className="py-20 text-center text-gray-500">
                        <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full mb-4"></div>
                        <p>Loading applications...</p>
                    </div>
                ) : error ? (
                    <div className="py-20 text-center text-red-500">
                        <p className="text-lg mb-2">Error loading applications</p>
                        <p className="text-sm">{error}</p>
                        <button
                            onClick={() => fetchApplications()}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                    </div>
                ) : applications.length === 0 ? (
                    <div className="py-20 text-center text-gray-500">
                        <p className="text-lg">No applications found</p>
                        <p className="text-sm mt-2">There are currently no pending KOL applications</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSortChange('username')}
                                >
                                    Applicant {getSortIndicator('username')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSortChange('email')}
                                >
                                    Email {getSortIndicator('email')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Social Platforms
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSortChange('creation_at')}
                                >
                                    Applied Date {getSortIndicator('creation_at')}
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {applications.map((application) => (
                                <tr
                                    key={application.influencer_id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {application.influencer_id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {application.user.username}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {application.user.first_name} {application.user.last_name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {application.user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex space-x-2">
                                            {application.influencer_social_links?.map((link, index) => (
                                                <div key={index} title={link.platform} className="p-1">
                                                    {getSocialIcon(link.platform)}
                                                </div>
                                            ))}
                                            {(!application.influencer_social_links || application.influencer_social_links.length === 0) && (
                                                <span className="text-gray-400 text-sm">No social links</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                            Pending
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(application.creation_at || application.modified_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleOpenReview(application)}
                                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md"
                                        >
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {!isLoading && !error && applications.length > 0 && (
                <div className="px-4 py-3 bg-gray-50 border-t flex flex-col sm:flex-row items-center justify-between">
                    <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                        Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                        <span className="font-medium">
                            {Math.min(currentPage * itemsPerPage, totalApplications)}
                        </span>{' '}
                        of <span className="font-medium">{totalApplications}</span> applications
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

            {/* Application Review Modal */}
            {isReviewModalOpen && selectedApplication && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                        {/* Modal header */}
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <h3 className="text-xl font-semibold text-gray-900">Review KOL Application</h3>
                            <button
                                onClick={() => setIsReviewModalOpen(false)}
                                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        {/* Modal content */}
                        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 180px)' }}>
                            <div className="space-y-6">
                                {/* Applicant Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div>
                                        <h4 className="text-lg font-semibold mb-3 text-blue-700 flex items-center">
                                            <FiUser className="mr-2 text-blue-500" /> Applicant Information
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="bg-white p-2.5 rounded-md shadow-sm">
                                                <p className="text-sm text-gray-500">Full Name</p>
                                                <p className="font-medium text-gray-800">
                                                    {selectedApplication.user.first_name || ''} {selectedApplication.user.last_name || ''}
                                                    {(!selectedApplication.user.first_name && !selectedApplication.user.last_name) && 'Not provided'}
                                                </p>
                                            </div>
                                            <div className="bg-white p-2.5 rounded-md shadow-sm">
                                                <p className="text-sm text-gray-500">Username</p>
                                                <p className="font-medium text-gray-800">{selectedApplication.user.username}</p>
                                            </div>
                                            <div className="bg-white p-2.5 rounded-md shadow-sm">
                                                <p className="text-sm text-gray-500">Email</p>
                                                <p className="font-medium text-blue-600">{selectedApplication.user.email}</p>
                                            </div>
                                            <div className="bg-white p-2.5 rounded-md shadow-sm">
                                                <p className="text-sm text-gray-500">Phone</p>
                                                <p className="font-medium text-gray-800">{selectedApplication.user.phone_num || 'Not provided'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold mb-3 text-blue-700 flex items-center">
                                            <FiFileText className="mr-2 text-blue-500" /> Application Details
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="bg-white p-2.5 rounded-md shadow-sm">
                                                <p className="text-sm text-gray-500">Application Date</p>
                                                <p className="font-medium text-gray-800">
                                                    {new Date(selectedApplication.creation_at || selectedApplication.modified_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <div className="bg-white p-2.5 rounded-md shadow-sm">
                                                <p className="text-sm text-gray-500">Status</p>
                                                <p className="font-medium">
                                                    <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                        Pending Review
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Social Media Links */}
                                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                        <h4 className="text-lg font-semibold text-blue-700 flex items-center">
                                            <FiShare2 className="mr-2 text-blue-500" /> Social Media Platforms
                                        </h4>
                                    </div>

                                    <div className="p-4">
                                        {selectedApplication.influencer_social_links && selectedApplication.influencer_social_links.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {selectedApplication.influencer_social_links.map((link, index) => (
                                                    <div key={index} className="flex items-center bg-gray-50 p-3 rounded-lg border hover:bg-gray-100 transition-colors">
                                                        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm mr-3">
                                                            {getSocialIcon(link.platform)}
                                                        </div>
                                                        <div className="flex-1 overflow-hidden">
                                                            <p className="font-medium text-gray-800">
                                                                {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                                                            </p>
                                                            <a
                                                                href={link.profile_link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm text-blue-600 hover:underline flex items-center truncate"
                                                            >
                                                                {link.profile_link}
                                                                <FiExternalLink size={14} className="ml-1 flex-shrink-0" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                                                <div className="text-gray-400 mb-2">
                                                    <FiSlash size={32} className="mx-auto" />
                                                </div>
                                                <p className="text-gray-500 font-medium">No social media links provided</p>
                                                <p className="text-gray-400 text-sm mt-1">The applicant hasn't connected any social media accounts</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Rejection Form */}
                                {showRejectionForm && (
                                    <div className="mt-4">
                                        <h4 className="text-lg font-semibold mb-2 text-red-600">Rejection Reason</h4>
                                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                            <p className="text-sm text-red-600 mb-2">
                                                Please provide a reason for rejecting this application. This will be stored with the application status.
                                            </p>
                                            <textarea
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                placeholder="Enter rejection reason..."
                                                className="w-full p-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                                rows={4}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal footer */}
                        <div className="border-t px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                            {showRejectionForm ? (
                                <>
                                    <button
                                        onClick={() => setShowRejectionForm(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleReject}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                        disabled={isLoading || !rejectionReason.trim()}
                                    >
                                        {isLoading ? 'Processing...' : 'Confirm Rejection'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setShowRejectionForm(true)}
                                        className="px-4 py-2 flex items-center text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50"
                                    >
                                        <FiX className="mr-2" /> Reject
                                    </button>
                                    <button
                                        onClick={handleApprove}
                                        className="px-4 py-2 flex items-center text-white bg-green-600 rounded-md hover:bg-green-700"
                                        disabled={isLoading}
                                    >
                                        <FiCheck className="mr-2" /> Approve
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KOLApplications;
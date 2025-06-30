import React, { useState, useEffect } from 'react';
import { FiX, FiCheckCircle, FiAlertTriangle, FiLink, FiDollarSign, FiUser, FiCalendar, FiStar, FiTrendingUp, FiPercent, FiLink2 } from 'react-icons/fi';
import { FaInstagram, FaTiktok, FaFacebook, FaYoutube } from 'react-icons/fa';
import StatusChangeModal from './StatusChangeModal';
import { toast } from 'react-toastify';
import kolService from '../../services/kolService';

const KOLDetailsModal = ({ kolId, isOpen, onClose, onRefresh }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [targetStatus, setTargetStatus] = useState(null);
    const [kol, setKol] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch KOL details when the modal opens
    useEffect(() => {
        if (isOpen && kolId) {
            fetchKOLDetails(kolId);
        }
    }, [isOpen, kolId]);

    const fetchKOLDetails = async (id) => {
        try {
            setLoading(true);
            setError(null);
            const response = await kolService.getKOLDetails(id);

            if (response.success && response.data) {
                setKol(response.data);
            } else {
                setError(response.message || 'Failed to load KOL details');
            }
        } catch (error) {
            setError(error.message || 'An error occurred while fetching KOL details');
            console.error('Error fetching KOL details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (newStatus) => {
        setTargetStatus(newStatus);
        setIsStatusModalOpen(true);
    };

    const handleStatusConfirm = async (reason) => {
        try {
            const response = await kolService.updateKOLStatus(kol.influencer_id, {
                status: targetStatus,
                reason
            });
            if (response.success) {
                toast.success(response.message);
                onClose(); // Close the details modal
                if (onRefresh) onRefresh(); // Refresh the list
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error(error.message || 'An error occurred');
        } finally {
            setIsStatusModalOpen(false);
            setTargetStatus(null);
        }
    };

    // Display loading state
    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading KOL details...</p>
                </div>
            </div>
        );
    }

    // Display error state
    if (error) {
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 text-center">
                    <div className="text-red-500 mb-4">
                        <FiAlertTriangle size={48} className="mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Details</h3>
                    <p className="text-gray-600">{error}</p>
                    <button
                        onClick={onClose}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    if (!isOpen || !kol) return null;

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
                return <FiLink size={18} />;
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const StatusButtons = ({ kol, onStatusChange }) => {
        if (!kol) return null;

        switch (kol.status) {
            case 'active':
                return (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => onStatusChange('suspended')}
                            className="px-4 py-2 text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-md hover:bg-yellow-100 flex items-center"
                        >
                            <FiAlertTriangle className="mr-2" /> Suspend
                        </button>
                        <button
                            onClick={() => onStatusChange('banned')}
                            className="px-4 py-2 text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 flex items-center"
                        >
                            <FiAlertTriangle className="mr-2" /> Ban
                        </button>
                    </div>
                );
            case 'suspended':
            case 'banned':
                return (
                    <button
                        onClick={() => onStatusChange('active')}
                        className="px-4 py-2 text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 flex items-center"
                    >
                        <FiCheckCircle className="mr-2" /> Activate
                    </button>
                );
            default:
                return null;
        }
    };


    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Modal header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div className="flex items-center space-x-4">
                        <h3 className="text-xl font-semibold text-gray-900">KOL Details</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${kol.status === 'active' ? 'bg-green-100 text-green-800' :
                            kol.status === 'suspended' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                            {kol.status.charAt(0).toUpperCase() + kol.status.slice(1)}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                        <FiX size={24} />
                    </button>
                </div>

                {/* Modal content - with tabs */}
                <div>
                    {/* Tabs */}
                    <div className="flex border-b">
                        <button
                            className={`px-6 py-3 text-sm font-medium ${activeTab === 'overview'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => setActiveTab('overview')}
                        >
                            Overview
                        </button>
                        <button
                            className={`px-6 py-3 text-sm font-medium ${activeTab === 'performance'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => setActiveTab('performance')}
                        >
                            Performance
                        </button>
                        <button
                            className={`px-6 py-3 text-sm font-medium ${activeTab === 'social'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => setActiveTab('social')}
                        >
                            Social Media
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 180px)' }}>
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* Top Row: Personal Info & Status */}
                                <div className="grid grid-cols-3 gap-6">
                                    {/* Personal Info Card */}
                                    <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                                            <div className="flex items-center justify-between">
                                                <h4 className="flex items-center text-gray-900 font-medium">
                                                    <FiUser className="text-blue-500 mr-2" size={20} />
                                                    Personal Information
                                                </h4>
                                                <span className="text-xs text-gray-500">ID: #{kol.influencer_id}</span>
                                            </div>
                                        </div>

                                        <div className="p-6 grid grid-cols-2 gap-6">
                                            <div>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-xs text-gray-500">Full Name</label>
                                                        <p className="mt-1 text-sm font-medium text-gray-900">
                                                            {kol.user.first_name} {kol.user.last_name}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-gray-500">Username</label>
                                                        <p className="mt-1 text-sm font-medium text-gray-900">{kol.user.username}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-xs text-gray-500">Email</label>
                                                        <p className="mt-1 text-sm font-medium text-blue-600">{kol.user.email}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-gray-500">Phone</label>
                                                        <p className="mt-1 text-sm font-medium text-gray-900">
                                                            {kol.user.phone_num || 'Not provided'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Card */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                                            <div className="flex items-center justify-between">
                                                <h4 className="flex items-center text-gray-900 font-medium">
                                                    <FiStar className="text-blue-500 mr-2" size={20} />
                                                    Status
                                                </h4>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                      ${kol.status === 'active' ? 'bg-green-100 text-green-800' :
                                                        kol.status === 'suspended' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'}`}>
                                                    {kol.status.charAt(0).toUpperCase() + kol.status.slice(1)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                                    <div>
                                                        <p className="text-xs text-blue-600 mb-1">Current Tier</p>
                                                        <p className="text-sm font-semibold text-blue-900">{kol.tier?.tier_name}</p>
                                                    </div>
                                                    <FiStar className="text-blue-500" size={20} />
                                                </div>

                                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                                    <div>
                                                        <p className="text-xs text-green-600 mb-1">Commission</p>
                                                        <p className="text-sm font-semibold text-green-900">{kol.tier?.commission_rate}%</p>
                                                    </div>
                                                    <FiPercent className="text-green-500" size={20} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Performance Stats */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <h4 className="flex items-center text-gray-900 font-medium">
                                                <FiTrendingUp className="text-blue-500 mr-2" size={20} />
                                                Performance Overview
                                            </h4>
                                            <span className="text-sm text-gray-500">Last 30 days</span>
                                        </div>
                                    </div>

                                    <div className="p-6 grid grid-cols-3 gap-6">
                                        <div className="flex items-center space-x-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                                            <div className="h-12 w-12 bg-white bg-opacity-60 rounded-lg flex items-center justify-center">
                                                <FiDollarSign className="text-blue-600" size={24} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-blue-700 mb-1">Total Sales</p>
                                                <p className="text-xl font-bold text-blue-900">
                                                    {formatCurrency(kol.performance?.total_sales || 0)}
                                                </p>
                                                {/* <span className="text-xs text-blue-600">+12% from last month</span> */}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                                            <div className="h-12 w-12 bg-white bg-opacity-60 rounded-lg flex items-center justify-center">
                                                <FiPercent className="text-green-600" size={24} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-green-700 mb-1">Commission</p>
                                                <p className="text-xl font-bold text-green-900">
                                                    {formatCurrency(kol.performance?.total_commission || 0)}
                                                </p>
                                                {/* <span className="text-xs text-green-600">+8% from last month</span> */}
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                                            <div className="h-12 w-12 bg-white bg-opacity-60 rounded-lg flex items-center justify-center">
                                                <FiLink2 className="text-purple-600" size={24} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-purple-700 mb-1">Active Links</p>
                                                <p className="text-xl font-bold text-purple-900">
                                                    {kol.performance?.total_affiliate_links || 0}
                                                </p>
                                                {/* <span className="text-xs text-purple-600">+3 new links</span> */}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <h4 className="flex items-center text-gray-900 font-medium">
                                                <FiCalendar className="text-blue-500 mr-2" size={20} />
                                                Account Timeline
                                            </h4>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex items-stretch">
                                            <div className="flex-1 bg-green-50 rounded-r-xl p-4">
                                                <p className="text-xs text-green-600 mb-2">Last Activity</p>
                                                <p className="text-sm font-semibold text-green-900">{formatDate(kol.modified_at)}</p>
                                                <div className="mt-2 flex items-center">
                                                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                                                    <p className="text-xs text-green-600">Recent Update</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'performance' && (
                            <div className="space-y-6">
                                <h4 className="text-lg font-semibold mb-4 flex items-center">
                                    <FiDollarSign className="mr-2 text-blue-500" /> Sales Performance
                                </h4>

                                {/* Recent Transactions Table */}
                                <div className="mt-6">
                                    <h5 className="font-medium text-gray-700 mb-2">Recent Transactions</h5>
                                    <div className="border rounded-md overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        Date
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        Sale Amount
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        Commission
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {kol.performance?.recent_transactions?.map((transaction, index) => (
                                                    <tr key={index} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm text-gray-500">
                                                            {formatDate(transaction.date)}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">
                                                            {formatCurrency(transaction.amount)}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-green-600">
                                                            {formatCurrency(transaction.commission)}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {(!kol.performance?.recent_transactions || kol.performance.recent_transactions.length === 0) && (
                                                    <tr>
                                                        <td colSpan="3" className="px-4 py-3 text-sm text-gray-500 text-center">
                                                            No recent transactions found
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'social' && (
                            <div className="space-y-6">
                                <h4 className="text-lg font-semibold mb-4">Social Media Platforms</h4>
                                <div className="space-y-4">
                                    {kol.influencer_social_links?.length > 0 ? (
                                        kol.influencer_social_links.map((link, index) => (
                                            <div key={index} className="flex items-center p-3 border rounded-md hover:bg-gray-50">
                                                <div className="mr-4">
                                                    {getSocialIcon(link.platform)}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">
                                                        {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                                                    </p>
                                                    <a
                                                        href={link.profile_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 hover:underline"
                                                    >
                                                        {link.profile_link}
                                                    </a>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
                                            <p className="text-gray-500">No social media links provided</p>
                                            <p className="text-sm text-gray-400 mt-1">KOL has not connected any social media accounts</p>
                                        </div>
                                    )}
                                </div>

                                {/* Affiliate Links Section */}
                                <div className="mt-8">
                                    <h4 className="text-lg font-semibold mb-4">Affiliate Links</h4>
                                    <div className="border rounded-lg overflow-hidden">
                                        <div className="bg-gray-50 px-4 py-3 border-b">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-gray-700">
                                                    Active Affiliate Links
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    Total: {kol.affiliate_links?.length || 0}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="divide-y">
                                            {kol.affiliate_links?.map((link, index) => (
                                                <div key={index} className="p-4 hover:bg-gray-50">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                Link ID: {link.link_id}
                                                            </p>
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                Created: {formatDate(link.created_at)}
                                                            </p>
                                                        </div>
                                                        <a
                                                            href={link.affliate_link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                        >
                                                            View Link <FiLink className="inline ml-1" />
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!kol.affiliate_links || kol.affiliate_links.length === 0) && (
                                                <div className="p-4 text-center text-gray-500">
                                                    No affiliate links found
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal footer */}
                <div className="border-t px-6 py-4 bg-gray-50 flex justify-between items-center">
                    <StatusButtons kol={kol} onStatusChange={handleStatusChange} />
                </div>

                <StatusChangeModal
                    isOpen={isStatusModalOpen}
                    onClose={() => setIsStatusModalOpen(false)}
                    onConfirm={handleStatusConfirm}
                    kol={kol}
                    newStatus={targetStatus}
                />
            </div>
        </div>
    );
};

export default KOLDetailsModal;
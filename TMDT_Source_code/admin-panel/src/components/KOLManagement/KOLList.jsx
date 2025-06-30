import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiRefreshCw, FiEdit2, FiChevronDown, FiChevronUp, FiEye } from 'react-icons/fi';
import kolTierService from '../../services/kolTierService';
import KOLDetailsModal from './KOLDetailsModal';
import kolService from '../../services/kolService';

const KOLList = ({ onEdit, isLoading: externalLoading, refreshTrigger, token }) => {
    // State for KOLs data
    const [kols, setKOLs] = useState([]);
    const [isLoading, setIsLoading] = useState(externalLoading || false);
    const [error, setError] = useState(null);

    // State for filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [tierFilter, setTierFilter] = useState('all');

    // State for sorting
    const [sortField, setSortField] = useState('modified_at');
    const [sortOrder, setSortOrder] = useState('DESC');

    // State for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalKOLs, setTotalKOLs] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // State for tier data
    const [tiers, setTiers] = useState([]);

    // State for suspension modal
    const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
    const [kolToSuspend, setKOLToSuspend] = useState(null);

    // State for KOL details modal
    const [selectedKOLId, setSelectedKOLId] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Fetch KOLs data
    const fetchKOLs = async (resetPage = false) => {
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
                status: statusFilter,
                tier_id: tierFilter
            };

            const response = await kolService.getKOLs(params);

            if (response.success) {
                setKOLs(response.kols);
                setTotalKOLs(response.pagination.total);
                setTotalPages(response.pagination.pages);
            } else {
                setError(response.message || 'Failed to load KOLs');
                setKOLs([]);
            }
        } catch (error) {
            setError(error.message || 'An error occurred');
            setKOLs([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch tiers for filter dropdown
    const fetchTiers = async () => {
        try {
            const response = await kolTierService.getTiers();
            if (response.success) {
                setTiers(response.data);
            } else {
                console.error('Failed to load tiers:', response.message);
            }
        } catch (error) {
            console.error('Error loading tiers:', error);
        }
    };

    // Initial data load
    useEffect(() => {
        fetchTiers();
        fetchKOLs();
    }, []);

    // Refresh when refreshTrigger changes
    useEffect(() => {
        if (refreshTrigger > 0) {
            fetchKOLs();
        }
    }, [refreshTrigger]);

    // Fetch KOLs when filters, sorting or pagination changes
    useEffect(() => {
        fetchKOLs();
    }, [currentPage, itemsPerPage, sortField, sortOrder]);

    // Handle KOL click to view details
    const handleKOLClick = (kol) => {
        setSelectedKOLId(kol.influencer_id);
        setIsDetailsModalOpen(true);
    };

    // Handle search input changes
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Apply filters when filter button is clicked
    const handleApplyFilters = () => {
        fetchKOLs(true);
    };

    // Reset all filters
    const handleResetFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setTierFilter('all');
        fetchKOLs(true);
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

    return (
        <div className="bg-white rounded-lg shadow-md">
            {/* Header and Filter Section */}
            <div className="p-4 border-b">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                        KOL Influencers
                        {totalKOLs > 0 && <span className="text-sm text-gray-500 ml-2">({totalKOLs})</span>}
                    </h2>
                    <button
                        onClick={() => fetchKOLs()}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                        title="Refresh KOLs"
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
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    {/* Status filter */}
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="banned">Banned</option>
                        </select>
                        <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    {/* Tier filter */}
                    <div className="relative">
                        <select
                            value={tierFilter}
                            onChange={(e) => setTierFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Tiers</option>
                            {tiers.map((tier) => (
                                <option key={tier.tier_id} value={tier.tier_id}>
                                    {tier.tier_name}
                                </option>
                            ))}
                        </select>
                        <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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

            {/* KOLs Table */}
            <div className="overflow-x-auto">
                {isLoading ? (
                    <div className="py-20 text-center text-gray-500">
                        <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full mb-4"></div>
                        <p>Loading KOLs...</p>
                    </div>
                ) : error ? (
                    <div className="py-20 text-center text-red-500">
                        <p className="text-lg mb-2">Error loading KOLs</p>
                        <p className="text-sm">{error}</p>
                        <button
                            onClick={() => fetchKOLs()}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                    </div>
                ) : kols.length === 0 ? (
                    <div className="py-20 text-center text-gray-500">
                        <p className="text-lg">No KOLs found</p>
                        <p className="text-sm mt-2">Try changing your filters</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"  >
                                    Name {getSortIndicator('username')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"                                >
                                    Email {getSortIndicator('email')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSortChange('tier')}
                                >
                                    Tier {getSortIndicator('tier')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSortChange('commission_rate')}
                                >
                                    Commission {getSortIndicator('commission_rate')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSortChange('modified_at')}
                                >
                                    Last Updated {getSortIndicator('modified_at')}
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Details
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {kols.map((kol) => (
                                <tr
                                    key={kol.influencer_id}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => handleKOLClick(kol)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {kol.influencer_id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {kol.user.username}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {kol.user.first_name} {kol.user.last_name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {kol.user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {kol.tier.tier_name}
                                        </span>

                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {kol.tier.commission_rate}%
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${kol.status === 'active' ? 'bg-green-100 text-green-800' :
                                            kol.status === 'suspended' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {kol.status.charAt(0).toUpperCase() + kol.status.slice(1)}
                                        </span>
                                        {kol.status_reason && (
                                            <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                                                Reason: {kol.status_reason}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(kol.modified_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <div className="flex justify-center items-center space-x-2" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleKOLClick(kol);
                                                }}
                                                className="text-gray-600 hover:text-gray-900"
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
            {!isLoading && !error && kols.length > 0 && (
                <div className="px-4 py-3 bg-gray-50 border-t flex flex-col sm:flex-row items-center justify-between">
                    <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                        Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                        <span className="font-medium">
                            {Math.min(currentPage * itemsPerPage, totalKOLs)}
                        </span>{' '}
                        of <span className="font-medium">{totalKOLs}</span> KOLs
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

            {/* KOL Details Modal */}
            <KOLDetailsModal
                kolId={selectedKOLId}
                isOpen={isDetailsModalOpen}
                onClose={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedKOLId(null);
                }}
                onRefresh={() => fetchKOLs()}
            />
        </div>
    );
};

export default KOLList;
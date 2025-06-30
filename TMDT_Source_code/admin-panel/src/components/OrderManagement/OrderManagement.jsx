import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import orderService from '../../services/orderService';
import { currency } from '../../App';

const OrderManagement = ({
    orders: propOrders,
    onOrderClick,
    isLoading: parentLoading,
    selectedDate,
    refreshTrigger,
    pagination,
    onPageChange,
    onLimitChange,
    searchTerm: propSearchTerm,
    onSearch,
    statusFilter: propStatusFilter,
    onStatusFilterChange,
    paymentFilter: propPaymentFilter,
    onPaymentFilterChange
}) => {

    const [searchTerm, setSearchTerm] = useState(propSearchTerm || '');
    const [statusFilter, setStatusFilter] = useState(propStatusFilter || 'All Statuses');
    const [paymentFilter, setPaymentFilter] = useState(propPaymentFilter || 'All Payment Statuses');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [orders, setOrders] = useState([]);
    const [totalOrders, setTotalOrders] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    // Update local state from props
    useEffect(() => {
        if (propOrders) {
            setOrders(propOrders);
        }
    }, [propOrders]);

    useEffect(() => {
        if (pagination) {
            setCurrentPage(pagination.page);
            setItemsPerPage(pagination.limit);
            setTotalOrders(pagination.total);
            setTotalPages(pagination.pages);
        }
    }, [pagination]);

    useEffect(() => {
        if (propSearchTerm !== undefined) setSearchTerm(propSearchTerm);
    }, [propSearchTerm]);

    useEffect(() => {
        if (propStatusFilter !== undefined) setStatusFilter(propStatusFilter);
    }, [propStatusFilter]);

    useEffect(() => {
        if (propPaymentFilter !== undefined) setPaymentFilter(propPaymentFilter);
    }, [propPaymentFilter]);

    // Refresh when trigger changes
    useEffect(() => {
        if (refreshTrigger > 0 && !selectedDate) {
            fetchOrders();
        }
    }, [refreshTrigger]);

    // Fetch when pagination changes in non-date mode
    useEffect(() => {
        if (!isLoading && !selectedDate) {
            fetchOrders();
        }
    }, [currentPage, itemsPerPage]);

    const fetchOrders = async (resetPage = false) => {
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
                sort_by: 'creation_at',
                sort_order: 'DESC'
            };

            if (searchTerm) queryParams.search = searchTerm;
            if (statusFilter !== 'All Statuses') queryParams.status = statusFilter;
            if (paymentFilter !== 'All Payment Statuses') queryParams.payment_status = paymentFilter;
            if (startDate) queryParams.start_date = startDate;
            if (endDate) queryParams.end_date = endDate;

            const response = await orderService.getOrders(queryParams);

            if (response.success) {
                setOrders(response.orders);
                setTotalOrders(response.pagination.total);
                setTotalPages(response.pagination.pages);

                // Update parent pagination state if callback provided
                if (onPageChange) {
                    onPageChange(page);
                }
            } else {
                setError(response.message || 'Failed to load orders');
                setOrders([]);
            }
        } catch (error) {
            setError(error.message || 'An error occurred');
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplyFilters = () => {
        if (selectedDate) {
            // In date mode, use parent callbacks
            if (onSearch) onSearch(searchTerm);
            if (onStatusFilterChange) onStatusFilterChange(statusFilter);
            if (onPaymentFilterChange) onPaymentFilterChange(paymentFilter);
        } else {
            // In normal mode, use internal fetch
            fetchOrders(true);
        }
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setStatusFilter('All Statuses');
        setPaymentFilter('All Payment Statuses');
        setStartDate('');
        setEndDate('');

        if (selectedDate) {
            // In date mode, use parent callbacks
            if (onSearch) onSearch('');
            if (onStatusFilterChange) onStatusFilterChange('All Statuses');
            if (onPaymentFilterChange) onPaymentFilterChange('All Payment Statuses');
        } else {
            // In normal mode, use internal fetch
            fetchOrders(true);
        }
    };

    const handlePageChangeInternal = (pageNum) => {
        if (selectedDate) {
            // Use parent callback for date mode
            if (onPageChange) {
                onPageChange(pageNum);
            }
        } else {
            // Use internal state for normal mode
            setCurrentPage(pageNum);
        }
    };

    const handleItemsPerPageChange = (limit) => {
        if (selectedDate) {
            // Use parent callback for date mode
            if (onLimitChange) {
                onLimitChange(limit);
            }
        } else {
            // Use internal state for normal mode
            setItemsPerPage(limit);
            setCurrentPage(1);
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered':
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
            case 'returned':
            case 'failed':
                return 'bg-red-100 text-red-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'shipped':
                return 'bg-indigo-100 text-indigo-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    // Use either provided loading state or internal loading state
    const isLoadingState = parentLoading !== undefined ? parentLoading : isLoading;

    return (
        <div className="bg-white rounded shadow">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-semibold text-gray-700">
                    {selectedDate ? 'Orders for Selected Date' : 'Order Management'}
                    {totalOrders > 0 && (
                        <span className="text-sm text-gray-500 ml-2">({totalOrders})</span>
                    )}
                </h2>
                <button
                    onClick={() => selectedDate ?
                        (onPageChange ? onPageChange(pagination?.page || 1) : null) :
                        fetchOrders()
                    }
                    className="p-2 hover:bg-gray-100 rounded-full"
                    disabled={isLoadingState}
                >
                    <FiRefreshCw className={isLoadingState ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Filters section */}
            <div className="p-4 border-b">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
                    {/* Search input */}
                    <div className="relative flex-grow max-w-md">
                        <input
                            type="text"
                            placeholder="Search order ID, customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <FiSearch className="absolute left-3 top-3 text-gray-400" />
                    </div>

                    {/* Filter toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md flex items-center gap-2 hover:bg-gray-200"
                    >
                        <FiFilter />
                        Filters {showFilters ? '(Hide)' : '(Show)'}
                    </button>

                    {/* Apply/Reset buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleApplyFilters}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            disabled={isLoadingState}
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={handleResetFilters}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            disabled={isLoadingState}
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Advanced filters */}
                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        {/* Status filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="All Statuses">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Delivering</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="returned">Returned</option>
                            </select>
                        </div>

                        {/* Payment status filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                            <select
                                value={paymentFilter}
                                onChange={(e) => setPaymentFilter(e.target.value)}
                                className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="All Payment Statuses">All Payment Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>

                        {/* Date range filter only shown in non-date mode */}
                        {!selectedDate && (
                            <>
                                {/* Date range filter - Start date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Date range filter - End date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        min={startDate}
                                        className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                {isLoadingState ? (
                    <div className="py-20 text-center text-gray-500">
                        <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full mb-4"></div>
                        <p>Loading orders...</p>
                    </div>
                ) : error ? (
                    <div className="py-20 text-center text-red-500">
                        <p className="text-lg mb-2">Error loading orders</p>
                        <p className="text-sm">{error}</p>
                        <button
                            onClick={() => selectedDate ?
                                (onPageChange ? onPageChange(1) : null) :
                                fetchOrders(true)
                            }
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="py-20 text-center text-gray-500">
                        <p className="text-lg">No orders found</p>
                        <p className="text-sm mt-2">Try changing your filters</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ORDER ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CUSTOMER</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">PAYMENT</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">PAYMENT METHOD</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DATE</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order) => (
                                <tr
                                    key={order.id}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => onOrderClick(order.id)}
                                >
                                    <td className="p-4">#{order.id}</td>
                                    <td className="p-4">
                                        <div className="font-medium">{order.customer.name}</div>
                                        <div className="text-sm text-gray-500">{order.customer.email}</div>
                                    </td>
                                    <td className="p-4">{currency}{order.total.toFixed(2)}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(order.payment_status)}`}>
                                            {order.payment_status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        {order.payment_method}
                                    </td>
                                    <td className="p-4 text-gray-500">
                                        {formatDate(order.created_at)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            {/* Pagination */}
            {!isLoadingState && !error && orders.length > 0 && (
                <div className="px-4 py-3 bg-gray-50 border-t flex flex-col sm:flex-row items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <select
                            className="border rounded p-1"
                            value={selectedDate ? pagination?.limit || 10 : itemsPerPage}
                            onChange={(e) => {
                                const newLimit = Number(e.target.value);
                                handleItemsPerPageChange(newLimit);
                            }}
                        >
                            <option value={10}>10 per page</option>
                            <option value={25}>25 per page</option>
                            <option value={50}>50 per page</option>
                            <option value={100}>100 per page</option>
                        </select>
                        <span className="text-sm text-gray-700">
                            Showing{' '}
                            <span className="font-medium">
                                {totalOrders === 0 ? 0 : ((selectedDate ? pagination?.page || 1 : currentPage) - 1) * (selectedDate ? pagination?.limit || 10 : itemsPerPage) + 1}
                            </span>
                            {' '}to{' '}
                            <span className="font-medium">
                                {Math.min((selectedDate ? pagination?.page || 1 : currentPage) * (selectedDate ? pagination?.limit || 10 : itemsPerPage), totalOrders)}
                            </span>
                            {' '}of{' '}
                            <span className="font-medium">{totalOrders}</span>
                            {' '}orders
                        </span>
                    </div>

                    <div className="flex space-x-2 mt-4 sm:mt-0">
                        <button
                            onClick={() => handlePageChangeInternal(Math.max(1, (selectedDate ? pagination?.page || 1 : currentPage) - 1))}
                            disabled={(selectedDate ? pagination?.page || 1 : currentPage) === 1}
                            className={`px-3 py-1 border rounded ${(selectedDate ? pagination?.page || 1 : currentPage) === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'hover:bg-gray-50'
                                }`}
                        >
                            Previous
                        </button>

                        {/* Page numbers */}
                        {[...Array(Math.min(5, (selectedDate ? pagination?.pages || 1 : totalPages) || 1))].map((_, i) => {
                            const currentPageValue = selectedDate ? pagination?.page || 1 : currentPage;
                            const totalPagesValue = selectedDate ? pagination?.pages || 1 : totalPages;

                            let pageNum;
                            if (totalPagesValue <= 5) {
                                pageNum = i + 1;
                            } else if (currentPageValue <= 3) {
                                pageNum = i + 1;
                            } else if (currentPageValue >= totalPagesValue - 2) {
                                pageNum = totalPagesValue - 4 + i;
                            } else {
                                pageNum = currentPageValue - 2 + i;
                            }

                            if (pageNum > 0 && pageNum <= totalPagesValue) {
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChangeInternal(pageNum)}
                                        className={`px-3 py-1 border rounded ${currentPageValue === pageNum
                                            ? 'bg-blue-50 border-blue-500 text-blue-600'
                                            : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            }
                            return null;
                        })}

                        <button
                            onClick={() => handlePageChangeInternal(Math.min((selectedDate ? pagination?.pages || 1 : totalPages), (selectedDate ? pagination?.page || 1 : currentPage) + 1))}
                            disabled={(selectedDate ? pagination?.page || 1 : currentPage) === (selectedDate ? pagination?.pages || 1 : totalPages)}
                            className={`px-3 py-1 border rounded ${(selectedDate ? pagination?.page || 1 : currentPage) === (selectedDate ? pagination?.pages || 1 : totalPages)
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'hover:bg-gray-50'
                                }`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagement;
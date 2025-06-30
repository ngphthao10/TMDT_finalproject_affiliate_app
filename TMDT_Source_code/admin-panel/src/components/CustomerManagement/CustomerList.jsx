import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiChevronDown, FiChevronUp, FiRefreshCw, FiEdit2, FiUserX, FiUserCheck, FiXOctagon } from 'react-icons/fi';
import { toast } from 'react-toastify';
import customerService from '../../services/customerService';
import DeleteConfirmationModal from '../DeleteConfirm';
import CustomerDetailsModal from './CustomerDetailsModal';
import StatusChangeModal from './StatusChangeModal';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const CustomerList = ({ onEdit }) => {
    dayjs.locale('en-gb');
    // State for customers data
    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // State for filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [creationDateRange, setCreationDateRange] = useState({ start: null, end: null });

    // State for sorting
    const [sortField, setSortField] = useState('creation_at');
    const [sortOrder, setSortOrder] = useState('DESC');

    // State for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // State for modals
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [statusAction, setStatusAction] = useState(''); // 'suspend', 'ban', 'activate'

    // Fetch customers based on current filters, sorting and pagination
    const fetchCustomers = async (resetPage = false) => {
        try {
            setIsLoading(true);
            setError(null);

            // Reset to page 1 if filters changed
            const page = resetPage ? 1 : currentPage;
            if (resetPage) {
                setCurrentPage(1);
            }

            // Build query parameters
            const queryParams = {
                page,
                limit: itemsPerPage,
                sort_by: sortField,
                sort_order: sortOrder
            };

            // Add filters if set
            if (searchTerm) queryParams.search = searchTerm;
            if (statusFilter !== 'all') queryParams.status = statusFilter;
            if (creationDateRange.start) queryParams.start_date = creationDateRange.start;
            if (creationDateRange.end) queryParams.end_date = creationDateRange.end;

            // Make API request using customerService
            const response = await customerService.getCustomers(queryParams);

            if (response.success) {
                setCustomers(response.customers);
                setTotalPages(response.pagination.pages);
                setTotalCustomers(response.pagination.total);
            } else {
                setError(response.message || 'Failed to load customers');
                setCustomers([]);
            }
        } catch (error) {
            setError(error.message || 'An error occurred');
            setCustomers([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial data load
    useEffect(() => {
        fetchCustomers();
    }, []);

    // Fetch customers when filters, sorting or pagination changes
    useEffect(() => {
        fetchCustomers();
    }, [currentPage, itemsPerPage, sortField, sortOrder]);

    // Handle search input changes
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Apply filters when search button is clicked
    const handleApplyFilters = () => {
        fetchCustomers(true);
    };

    // Reset all filters
    const handleResetFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setCreationDateRange({ start: null, end: null });
        fetchCustomers(true);
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

    // Open customer details modal
    const handleCustomerClick = (customer) => {
        setSelectedCustomer(customer);
        setIsDetailsModalOpen(true);
    };

    // Handle edit customer
    const handleEditCustomer = (customer) => {
        if (onEdit) {
            onEdit(customer);
        }
        setIsDetailsModalOpen(false);
    };

    // Handle delete customer
    const handleDeleteCustomer = (customer) => {
        setSelectedCustomer(customer);
        setIsDetailsModalOpen(false);
        setIsDeleteModalOpen(true);
    };

    // Handle change customer status
    const handleStatusChange = (customer, action) => {
        setSelectedCustomer(customer);
        setStatusAction(action);
        setIsDetailsModalOpen(false);
        setIsStatusModalOpen(true);
    };

    // Confirm delete customer
    const confirmDeleteCustomer = async () => {
        if (!selectedCustomer) return;

        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const response = await customerService.deleteCustomer(selectedCustomer.user_id, token);

            if (response.success) {
                toast.success('Customer account deleted successfully');
                fetchCustomers();
            } else {
                toast.error(response.message || 'Failed to delete customer account');
            }
        } catch (error) {
            toast.error(error.message || 'An error occurred while deleting customer account');
        } finally {
            setIsLoading(false);
            setIsDeleteModalOpen(false);
            setSelectedCustomer(null);
        }
    };

    // Confirm status change
    const confirmStatusChange = async (reason) => {
        if (!selectedCustomer || !statusAction) return;

        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');

            // Map action to status
            const statusMap = {
                'suspend': 'suspended',
                'ban': 'banned',
                'activate': 'active'
            };

            const status = statusMap[statusAction];

            const response = await customerService.changeCustomerStatus(
                selectedCustomer.user_id,
                status,
                reason,
                token
            );

            if (response.success) {
                toast.success(`Customer account ${status} successfully`);
                fetchCustomers();
            } else {
                toast.error(response.message || `Failed to ${statusAction} customer account`);
            }
        } catch (error) {
            toast.error(error.message || 'An error occurred while changing customer status');
        } finally {
            setIsLoading(false);
            setIsStatusModalOpen(false);
            setSelectedCustomer(null);
            setStatusAction('');
        }
    };

    // Get status badge component
    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>;
            case 'suspended':
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Suspended</span>;
            case 'banned':
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Banned</span>;
            default:
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Unknown</span>;
        }
    };

    const handleStartDateChange = (newValue) => {
        setCreationDateRange({
            ...creationDateRange,
            start: newValue
        });
    };

    const handleEndDateChange = (newValue) => {
        setCreationDateRange({
            ...creationDateRange,
            end: newValue
        });
    };


    return (
        <div className="bg-white rounded-lg shadow-md">
            {/* Header and Filter Section */}
            <div className="p-4 border-b">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                        Customers
                        {totalCustomers > 0 && <span className="text-sm text-gray-500 ml-2">({totalCustomers})</span>}
                    </h2>
                    <button
                        onClick={() => fetchCustomers()}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                        title="Refresh customer list"
                        disabled={isLoading}
                    >
                        <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
                    </button>
                </div>

                {/* Search and filters */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {/* Search input */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name, email, phone..."
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

                    {/* Date pickers - 2 columns */}
                    <div className="relative">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="From date"
                                value={creationDateRange.start}
                                onChange={handleStartDateChange}
                                slotProps={{ textField: { size: 'small' }, field: { format: 'DD/MM/YYYY' } }}
                            />
                        </LocalizationProvider>
                    </div>
                    <div className="relative">
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="To Date"
                                value={creationDateRange.end}
                                onChange={handleEndDateChange}
                                minDate={creationDateRange.start}
                                slotProps={{ textField: { size: 'small' }, field: { format: 'DD/MM/YYYY' } }}
                            />
                        </LocalizationProvider>
                    </div>

                    {/* Filter buttons */}
                    <div className="flex space-x-2">
                        <button
                            onClick={handleResetFilters}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex-1"
                            disabled={isLoading}
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleApplyFilters}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex-1"
                            disabled={isLoading}
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </div>

            {/* Customers Table */}
            <div className="overflow-x-auto">
                {isLoading ? (
                    <div className="py-20 text-center text-gray-500">
                        <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full mb-4"></div>
                        <p>Loading customers...</p>
                    </div>
                ) : error ? (
                    <div className="py-20 text-center text-red-500">
                        <p className="text-lg mb-2">Error loading customers</p>
                        <p className="text-sm">{error}</p>
                        <button
                            onClick={() => fetchCustomers()}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                    </div>
                ) : customers.length === 0 ? (
                    <div className="py-20 text-center text-gray-500">
                        <p className="text-lg">No customers found</p>
                        <p className="text-sm mt-2">Try changing your search criteria</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSortChange('username')}
                                >
                                    Customer {getSortIndicator('username')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact Info
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSortChange('status')}
                                >
                                    Status {getSortIndicator('status')}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSortChange('creation_at')}
                                >
                                    Joined {getSortIndicator('creation_at')}
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {customers.map((customer) => (
                                <tr
                                    key={customer.user_id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap" onClick={() => handleCustomerClick(customer)}>
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                {customer.first_name ? (
                                                    <span className="text-lg font-medium text-gray-600">
                                                        {customer.first_name[0]}{customer.last_name ? customer.last_name[0] : ''}
                                                    </span>
                                                ) : (
                                                    <span className="text-lg font-medium text-gray-600">
                                                        {customer.username[0]}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="ml-4 cursor-pointer">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {customer.first_name && customer.last_name
                                                        ? `${customer.first_name} ${customer.last_name}`
                                                        : customer.username}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    @{customer.username}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{customer.email}</div>
                                        {customer.phone_num && (
                                            <div className="text-sm text-gray-500">{customer.phone_num}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(customer.status)}
                                        {customer.status_reason && (
                                            <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                                                Reason: {customer.status_reason}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(customer.creation_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => handleEditCustomer(customer)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Edit customer"
                                            >
                                                <FiEdit2 size={18} />
                                            </button>

                                            {customer.status === 'active' ? (
                                                <button
                                                    onClick={() => handleStatusChange(customer, 'suspend')}
                                                    className="text-yellow-600 hover:text-yellow-900"
                                                    title="Suspend customer"
                                                >
                                                    <FiUserX size={18} />
                                                </button>
                                            ) : customer.status === 'suspended' ? (
                                                <button
                                                    onClick={() => handleStatusChange(customer, 'activate')}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Activate customer"
                                                >
                                                    <FiUserCheck size={18} />
                                                </button>
                                            ) : null}

                                            {customer.status !== 'banned' && (
                                                <button
                                                    onClick={() => handleStatusChange(customer, 'ban')}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Ban customer"
                                                >
                                                    <FiXOctagon size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {!isLoading && !error && customers.length > 0 && (
                <div className="px-4 py-3 bg-gray-50 border-t flex flex-col sm:flex-row items-center justify-between">
                    <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                        Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                        <span className="font-medium">
                            {Math.min(currentPage * itemsPerPage, totalCustomers)}
                        </span>{' '}
                        of <span className="font-medium">{totalCustomers}</span> customers
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

            {/* Customer Details Modal */}
            {selectedCustomer && (
                <CustomerDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => setIsDetailsModalOpen(false)}
                    customer={selectedCustomer}
                    onEdit={handleEditCustomer}
                    onDelete={handleDeleteCustomer}
                    onStatusChange={handleStatusChange}
                />
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedCustomer(null);
                }}
                onConfirm={confirmDeleteCustomer}
                itemName={selectedCustomer ?
                    (selectedCustomer.first_name && selectedCustomer.last_name
                        ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}`
                        : selectedCustomer.username)
                    : ''}
                itemType="customer account"
            />

            {/* Status Change Modal */}
            <StatusChangeModal
                isOpen={isStatusModalOpen}
                onClose={() => {
                    setIsStatusModalOpen(false);
                    setSelectedCustomer(null);
                    setStatusAction('');
                }}
                onConfirm={confirmStatusChange}
                customerName={selectedCustomer ?
                    (selectedCustomer.first_name && selectedCustomer.last_name
                        ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}`
                        : selectedCustomer.username)
                    : ''}
                action={statusAction}
            />
        </div>
    );
};

export default CustomerList;
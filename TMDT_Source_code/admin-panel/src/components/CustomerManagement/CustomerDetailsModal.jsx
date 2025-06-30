import React, { useState, useEffect } from 'react';
import { FiX, FiEdit2, FiTrash2, FiUserX, FiUserCheck, FiXOctagon, FiMail, FiPhone, FiMapPin, FiShoppingBag } from 'react-icons/fi';
import customerService from '../../services/customerService';
import { toast } from 'react-toastify';

const CustomerDetailsModal = ({ isOpen, onClose, customer, onEdit, onDelete, onStatusChange }) => {
    const [customerData, setCustomerData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('info'); // 'info', 'orders', 'addresses'

    useEffect(() => {
        if (isOpen && customer) {
            loadCustomerDetails();
        }
    }, [isOpen, customer]);

    const loadCustomerDetails = async () => {
        if (!customer) return;

        try {
            setIsLoading(true);
            setError(null);

            // Load detailed customer information
            const response = await customerService.getCustomerDetails(customer.user_id);

            if (response.success) {
                setCustomerData(response.customer);
            } else {
                setError(response.message || 'Failed to load customer details');
            }
        } catch (error) {
            setError(error.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    // No password reset functionality in admin panel

    // Helper function to format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    // Get status badge component
    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <span className="px-2 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">Active</span>;
            case 'suspended':
                return <span className="px-2 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">Suspended</span>;
            case 'banned':
                return <span className="px-2 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">Banned</span>;
            default:
                return <span className="px-2 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">Unknown</span>;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Modal header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <h3 className="text-xl font-semibold text-gray-900">Customer Details</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                        <FiX size={24} />
                    </button>
                </div>

                {/* Modal content - with scrollable content */}
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 135px)' }}>
                    {isLoading ? (
                        <div className="py-20 text-center">
                            <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full mb-4"></div>
                            <p className="text-gray-500">Loading customer details...</p>
                        </div>
                    ) : error ? (
                        <div className="py-20 text-center text-red-500">
                            <p className="text-lg mb-2">Error loading customer details</p>
                            <p className="text-sm">{error}</p>
                            <button
                                onClick={loadCustomerDetails}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : customerData ? (
                        <div className="px-6 py-4">
                            {/* Tabs navigation */}
                            <div className="border-b mb-6">
                                <nav className="-mb-px flex space-x-8">
                                    <button
                                        onClick={() => setActiveTab('info')}
                                        className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'info'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        Personal Information
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('orders')}
                                        className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'orders'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        Order History
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('addresses')}
                                        className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'addresses'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        Addresses
                                    </button>
                                </nav>
                            </div>

                            {/* Tab content */}
                            {activeTab === 'info' && (
                                <div className="space-y-6">
                                    {/* Customer profile header */}
                                    <div className="flex items-center">
                                        <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold mr-4 shadow">
                                            {customerData.first_name ? (
                                                <span>
                                                    {customerData.first_name[0]}{customerData.last_name ? customerData.last_name[0] : ''}
                                                </span>
                                            ) : (
                                                <span>
                                                    {customerData.username[0]}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold">
                                                {customerData.first_name && customerData.last_name
                                                    ? `${customerData.first_name} ${customerData.last_name}`
                                                    : customerData.username}
                                            </h2>
                                            <div className="flex items-center mt-1">
                                                {getStatusBadge(customerData.status)}
                                                <span className="ml-2 text-sm text-gray-500">
                                                    Customer ID: {customerData.user_id}
                                                </span>
                                            </div>
                                            {customerData.status_reason && (
                                                <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded border">
                                                    <span className="font-medium">Status reason:</span> {customerData.status_reason}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Contact information */}
                                    <div className="bg-gray-50 p-4 rounded-lg border">
                                        <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center">
                                                <FiMail className="text-gray-500 mr-2" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-500">Email</div>
                                                    <div className="text-gray-900">{customerData.email}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <FiPhone className="text-gray-500 mr-2" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-500">Phone</div>
                                                    <div className="text-gray-900">{customerData.phone_num || 'Not provided'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Account information */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Account Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-500">Username</div>
                                                <div className="text-gray-900">@{customerData.username}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-500">Account Status</div>
                                                <div>{getStatusBadge(customerData.status)}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-500">Member Since</div>
                                                <div className="text-gray-900">{formatDate(customerData.creation_at)}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-500">Last Updated</div>
                                                <div className="text-gray-900">{formatDate(customerData.modified_at)}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Roles */}
                                    {customerData.roles && customerData.roles.length > 0 && (
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-medium">User Roles</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {customerData.roles.map(role => (
                                                    <span
                                                        key={role.role_id}
                                                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                                    >
                                                        {role.role_name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Admin cannot manage passwords */}
                                </div>
                            )}

                            {activeTab === 'orders' && (
                                <div>
                                    <h3 className="text-lg font-medium mb-4">Order History</h3>
                                    {customerData.orders && customerData.orders.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Order ID
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Date
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Total
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Status
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {customerData.orders.map(order => (
                                                        <tr key={order.order_id} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                                                #{order.order_id}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {formatDate(order.creation_at)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {parseFloat(order.total)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                                            'bg-blue-100 text-blue-800'
                                                                    }`}>
                                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <FiShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                This customer hasn't placed any orders yet.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'addresses' && (
                                <div>
                                    <h3 className="text-lg font-medium mb-4">Saved Addresses</h3>
                                    {customerData.addresses && customerData.addresses.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {customerData.addresses.map(address => (
                                                <div
                                                    key={address.address_id}
                                                    className={`p-4 rounded-lg border ${address.is_default ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                                                >
                                                    {address.is_default == true && (
                                                        <div className="text-xs font-medium text-blue-600 mb-2">Default Address</div>
                                                    )}
                                                    <div className="font-medium">{address.recipient_name}</div>
                                                    <div className="text-gray-700">{address.phone_num}</div>
                                                    <div className="text-gray-700 mt-2">
                                                        {address.address},<br />
                                                        {address.city && `${address.city}, `}
                                                        {address.country}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <FiMapPin className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No addresses</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                This customer hasn't saved any addresses yet.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="py-20 text-center text-gray-500">
                            <p>No customer data available</p>
                        </div>
                    )}
                </div>

                {/* Modal footer */}
                {customerData && (
                    <div className="border-t px-6 py-3 flex justify-end space-x-3 bg-gray-50">
                        <button
                            onClick={() => onEdit(customerData)}
                            className="px-4 py-2 flex items-center text-blue-600 bg-white border border-blue-300 rounded-md hover:bg-blue-50"
                        >
                            <FiEdit2 className="mr-2" /> Edit
                        </button>

                        {customerData.status === 'active' ? (
                            <button
                                onClick={() => onStatusChange(customerData, 'suspend')}
                                className="px-4 py-2 flex items-center text-yellow-600 bg-white border border-yellow-300 rounded-md hover:bg-yellow-50"
                            >
                                <FiUserX className="mr-2" /> Suspend
                            </button>
                        ) : customerData.status === 'suspended' ? (
                            <button
                                onClick={() => onStatusChange(customerData, 'activate')}
                                className="px-4 py-2 flex items-center text-green-600 bg-white border border-green-300 rounded-md hover:bg-green-50"
                            >
                                <FiUserCheck className="mr-2" /> Activate
                            </button>
                        ) : null}

                        {customerData.status !== 'banned' && (
                            <button
                                onClick={() => onStatusChange(customerData, 'ban')}
                                className="px-4 py-2 flex items-center text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50"
                            >
                                <FiXOctagon className="mr-2" /> Ban
                            </button>
                        )}

                        {/* <button
                            onClick={() => onDelete(customerData)}
                            className="px-4 py-2 flex items-center text-white bg-red-600 rounded-md hover:bg-red-700"
                        >
                            <FiTrash2 className="mr-2" /> Delete
                        </button> */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerDetailsModal;
import React, { useState, useEffect } from 'react';
import { FiX, FiPackage, FiCreditCard, FiUser, FiMapPin, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { currency } from '../../App';
import orderService from '../../services/orderService';

const OrderDetailsModal = ({ isOpen, onClose, order, onOrderUpdated }) => {
    if (!isOpen || !order) return null;

    const [newStatus, setNewStatus] = useState(order.status);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (order) {
            setNewStatus(order.status);
        }
    }, [order]);

    const handleStatusChange = async () => {
        try {
            setIsSaving(true);
            const response = await orderService.updateOrderStatus(order.order_id, newStatus);

            if (response.success) {
                toast.success('Order status updated successfully');
                if (onOrderUpdated) {
                    onOrderUpdated({
                        ...order,
                        status: newStatus
                    });
                }
            } else {
                toast.error(response.message || 'Failed to update order status');
            }
        } catch (error) {
            toast.error(error.message || 'An error occurred while updating status');
            console.error('Error updating order status:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const orderStatusOptions = [
        { value: 'pending', label: 'Pending', color: 'yellow' },
        { value: 'processing', label: 'Processing', color: 'blue' },
        { value: 'shipped', label: 'Delivering', color: 'indigo' },
        { value: 'delivered', label: 'Delivered', color: 'green' },
        { value: 'cancelled', label: 'Cancelled', color: 'red' },
        { value: 'returned', label: 'Returned', color: 'purple' }
    ];

    const isStatusAllowed = (status) => {
        const paymentStatus = order.payment_status?.toLowerCase();
        const currentOrderStatus = order.status?.toLowerCase();

        if (currentOrderStatus === 'returned' || currentOrderStatus === 'cancelled') {
            return false;
        }

        // Define allowed transitions based on current status
        let allowedStatuses = [];
        if (currentOrderStatus === 'pending') {
            allowedStatuses = ['processing', 'cancelled'];
        } else if (currentOrderStatus === 'processing') {
            allowedStatuses = ['shipped', 'cancelled'];
        } else if (currentOrderStatus === 'shipped') {
            allowedStatuses = ['delivered'];
        } else if (currentOrderStatus === 'delivered') {
            allowedStatuses = ['returned'];
        }

        if (!allowedStatuses.includes(status)) {
            return false;
        }

        if (paymentStatus === 'pending') {
            return status === 'pending' || status === 'processing' || status === 'cancelled' || status === 'shipped' || status === 'delivered';
        } else if (paymentStatus === 'completed') {
            return true;
        } else if (paymentStatus === 'failed') {
            return status === 'cancelled';
        }

        return true;
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

    const getButtonStyle = (status) => {
        const isSelected = newStatus === status;
        const isAllowed = isStatusAllowed(status);

        let baseColors = {
            pending: 'yellow',
            processing: 'blue',
            shipped: 'indigo',
            delivered: 'green',
            cancelled: 'red',
            returned: 'purple'
        };

        const color = baseColors[status] || 'gray';

        if (isSelected) {
            return `bg-${color}-600 text-white border-${color}-600 hover:bg-${color}-700`;
        } else if (!isAllowed) {
            return `bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50`;
        } else {
            return `bg-white text-${color}-600 border-${color}-300 hover:bg-${color}-50`;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                        Order #{order.order_id}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <FiX size={24} />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 150px)' }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Order Status Section */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-lg font-medium mb-4 flex items-center">
                                <FiPackage className="mr-2" /> Order Status
                            </h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Current Status:</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Update Status
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {orderStatusOptions.map(option => {
                                            const isAllowed = isStatusAllowed(option.value);
                                            let buttonClass = "px-3 py-2 border rounded-md text-sm font-medium transition-colors ";

                                            if (newStatus === option.value) {
                                                switch (option.value) {
                                                    case 'pending':
                                                        buttonClass += "bg-yellow-600 text-white border-yellow-600";
                                                        break;
                                                    case 'processing':
                                                        buttonClass += "bg-blue-600 text-white border-blue-600";
                                                        break;
                                                    case 'shipped':
                                                        buttonClass += "bg-indigo-600 text-white border-indigo-600";
                                                        break;
                                                    case 'delivered':
                                                        buttonClass += "bg-green-600 text-white border-green-600";
                                                        break;
                                                    case 'cancelled':
                                                        buttonClass += "bg-red-600 text-white border-red-600";
                                                        break;
                                                    case 'returned':
                                                        buttonClass += "bg-purple-600 text-white border-purple-600";
                                                        break;
                                                    default:
                                                        buttonClass += "bg-gray-600 text-white border-gray-600";
                                                }
                                            } else if (!isAllowed) {
                                                buttonClass += "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed";
                                            } else {
                                                switch (option.value) {
                                                    case 'pending':
                                                        buttonClass += "bg-white text-yellow-600 border-yellow-300 hover:bg-yellow-50";
                                                        break;
                                                    case 'processing':
                                                        buttonClass += "bg-white text-blue-600 border-blue-300 hover:bg-blue-50";
                                                        break;
                                                    case 'shipped':
                                                        buttonClass += "bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-50";
                                                        break;
                                                    case 'delivered':
                                                        buttonClass += "bg-white text-green-600 border-green-300 hover:bg-green-50";
                                                        break;
                                                    case 'cancelled':
                                                        buttonClass += "bg-white text-red-600 border-red-300 hover:bg-red-50";
                                                        break;
                                                    case 'returned':
                                                        buttonClass += "bg-white text-purple-600 border-purple-300 hover:bg-purple-50";
                                                        break;
                                                    default:
                                                        buttonClass += "bg-white text-gray-600 border-gray-300 hover:bg-gray-50";
                                                }
                                            }

                                            return (
                                                <button
                                                    key={option.value}
                                                    onClick={() => isAllowed && setNewStatus(option.value)}
                                                    disabled={!isAllowed || isSaving}
                                                    className={buttonClass}
                                                >
                                                    {option.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {order.status === 'returned' && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            <span className="font-medium">Note:</span> Orders in the "Returned" state cannot be transitioned to any other status.
                                        </p>
                                    )}
                                    {order.status === 'cancelled' && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            <span className="font-medium">Note:</span> Cancelled orders can only be changed to "Returned" if payment was completed.
                                        </p>
                                    )}
                                    {order.payment_status === 'pending' && order.status !== 'returned' && order.status !== 'cancelled' && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            <span className="font-medium">Note:</span> With pending payment, only Pending, Processing, or Cancel statuses are allowed.
                                        </p>
                                    )}
                                    {order.payment_status === 'failed' && order.status !== 'returned' && order.status !== 'cancelled' && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            <span className="font-medium">Note:</span> With failed payment, only Cancel status is allowed.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-lg font-medium mb-4 flex items-center">
                                <FiCreditCard className="mr-2" /> Payment Information
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Payment Method:</span>
                                    <span className="font-medium capitalize">{order.payment_method}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Payment Status:</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.payment_status)}`}>
                                        {order.payment_status}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Amount:</span>
                                    <span className="font-medium">{currency}{order.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Customer Information */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-lg font-medium mb-4 flex items-center">
                                <FiUser className="mr-2" /> Customer Information
                            </h4>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-gray-600">Name:</span>
                                    <p className="font-medium">{order.user.username}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Email:</span>
                                    <p className="font-medium">{order.user.email}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Phone:</span>
                                    <p className="font-medium">{order.user.phone_num || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Information */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-lg font-medium mb-4 flex items-center">
                                <FiMapPin className="mr-2" /> Shipping Information
                            </h4>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-gray-600">Recipient:</span>
                                    <p className="font-medium">{order.shipping_address.recipient_name}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Address:</span>
                                    <p className="font-medium">{order.shipping_address.address}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">City:</span>
                                    <p className="font-medium">{order.shipping_address.city}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Country:</span>
                                    <p className="font-medium">{order.shipping_address.country}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="mt-6">
                        <h4 className="text-lg font-medium mb-4">Order Items</h4>
                        <div className="bg-gray-50 rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {order.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{item.product_name}</div>
                                                        {item.sku && <div className="text-sm text-gray-500">SKU: {item.sku}</div>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{item.size || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 text-right">
                                                {currency}{item.price.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 text-right">{item.quantity}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                                                {currency}{item.total.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                                            Total
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                                            {currency}{order.total.toFixed(2)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Order Notes */}
                    {order.note && (
                        <div className="mt-6">
                            <h4 className="text-lg font-medium mb-2">Order Notes</h4>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-700 whitespace-pre-line">{order.note}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="border-t px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        disabled={isSaving}
                    >
                        Close
                    </button>
                    <button
                        onClick={handleStatusChange}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:bg-blue-400"
                        disabled={isSaving || newStatus === order.status}
                    >
                        {isSaving ? (
                            <>
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                                Updating...
                            </>
                        ) : (
                            <>
                                <FiCheckCircle className="mr-2" />
                                Update Status
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;
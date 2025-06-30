import React, { useState, useEffect } from 'react';
import OrderManagement from '../components/OrderManagement/OrderManagement';
import OrderDetailsModal from '../components/OrderManagement/OrderDetailsModal';
import OrderDateSlider from '../components/OrderManagement/OrderDateSlider';
import orderService from '../services/orderService';
import { toast } from 'react-toastify';

const OrderDashboard = () => {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [orders, setOrders] = useState([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Pagination states
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Statuses');
    const [paymentFilter, setPaymentFilter] = useState('All Payment Statuses');

    // Fetch orders when component mounts, refreshTrigger changes, or pagination changes
    useEffect(() => {
        fetchOrdersForDate(selectedDate, pagination.page, pagination.limit);
    }, [selectedDate, pagination.page, pagination.limit, refreshTrigger]);

    const handleOrderClick = async (orderId) => {
        try {
            setIsLoading(true);
            const response = await orderService.getOrderDetails(orderId);
            if (response.success) {
                setSelectedOrder(response.order);
                setIsModalOpen(true);
            } else {
                toast.error(response.message || 'Failed to load order details');
            }
        } catch (error) {
            toast.error(error.message || 'An error occurred while loading order details');
            console.error('Error loading order details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // This function will be called when an order is updated
    const handleOrderUpdated = (updatedOrder) => {
        // Update the order in the orders array
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.id === updatedOrder.order_id ?
                    { ...order, status: updatedOrder.status } :
                    order
            )
        );

        // Also update the selected order
        setSelectedOrder(updatedOrder);

        // Force a refresh of the data by incrementing the refreshTrigger
        setRefreshTrigger(prev => prev + 1);
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        // Reset to first page when date changes
        setPagination(prev => ({
            ...prev,
            page: 1
        }));
    };

    const fetchOrdersForDate = async (date, page = 1, limit = 10) => {
        try {
            setIsLoading(true);
            // Format date to YYYY-MM-DD for API
            const formattedDate = date.toISOString().split('T')[0];

            const queryParams = {
                date: formattedDate,
                page: page,
                limit: limit
            };

            // Add filters if they are set
            if (searchTerm) queryParams.search = searchTerm;
            if (statusFilter !== 'All Statuses') queryParams.status = statusFilter;
            if (paymentFilter !== 'All Payment Statuses') queryParams.payment_status = paymentFilter;

            console.log("Fetching orders with params:", queryParams);
            const response = await orderService.getOrdersByDate(queryParams);
            console.log("API response:", response);

            if (response && response.success) {
                setOrders(response.orders || []);

                // Default pagination values in case they're not provided
                const defaultPagination = {
                    page: page,
                    limit: limit,
                    total: response.orders?.length || 0,
                    pages: 1
                };

                // Use pagination from response or defaults
                setPagination({
                    page: response.pagination?.page || defaultPagination.page,
                    limit: response.pagination?.limit || defaultPagination.limit,
                    total: response.pagination?.total || defaultPagination.total,
                    pages: response.pagination?.pages || defaultPagination.pages
                });
            } else {
                toast.error(response?.message || 'Failed to load orders');
                setOrders([]);
                setPagination({
                    page: 1,
                    limit: 10,
                    total: 0,
                    pages: 0
                });
            }
        } catch (error) {
            console.error("Error in fetchOrdersForDate:", error);
            toast.error(error.message || 'An error occurred while loading orders');
            setOrders([]);
            setPagination({
                page: 1,
                limit: 10,
                total: 0,
                pages: 0
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        setPagination(prev => ({
            ...prev,
            page: newPage
        }));
    };

    // Handle items per page change
    const handleLimitChange = (newLimit) => {
        setPagination(prev => ({
            ...prev,
            page: 1, // Reset to first page when changing items per page
            limit: newLimit
        }));
    };

    // Handle search and filter changes
    const handleSearch = (term) => {
        setSearchTerm(term);
        // Apply the search with current pagination but reset to page 1
        setPagination(prev => ({
            ...prev,
            page: 1
        }));
        // Manually trigger a fetch with the updated search term
        fetchOrdersForDate(selectedDate, 1, pagination.limit);
    };

    const handleStatusFilterChange = (status) => {
        setStatusFilter(status);
        setPagination(prev => ({
            ...prev,
            page: 1
        }));
        fetchOrdersForDate(selectedDate, 1, pagination.limit);
    };

    const handlePaymentFilterChange = (status) => {
        setPaymentFilter(status);
        setPagination(prev => ({
            ...prev,
            page: 1
        }));
        fetchOrdersForDate(selectedDate, 1, pagination.limit);
    };

    return (
        <div className="space-y-6">
            <OrderDateSlider
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
            />

            <OrderManagement
                orders={orders}
                onOrderClick={handleOrderClick}
                isLoading={isLoading}
                selectedDate={selectedDate}
                refreshTrigger={refreshTrigger}
                pagination={pagination}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
                searchTerm={searchTerm}
                onSearch={handleSearch}
                statusFilter={statusFilter}
                onStatusFilterChange={handleStatusFilterChange}
                paymentFilter={paymentFilter}
                onPaymentFilterChange={handlePaymentFilterChange}
            />

            <OrderDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                order={selectedOrder}
                onOrderUpdated={handleOrderUpdated}
            />
        </div>
    );
};

export default OrderDashboard;
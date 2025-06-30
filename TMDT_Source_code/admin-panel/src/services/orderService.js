import axios from 'axios';
import { backendUrl } from '../App';

const orderService = {
    /**
     * Get paginated list of orders with filtering options
     * @param {Object} options - Query parameters for filtering, sorting and pagination 
     * @returns {Promise} Promise with orders data
     */
    getOrders: async (options = {}) => {
        try {
            const queryParams = new URLSearchParams();

            // Add all options as query parameters
            Object.entries(options).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value);
                }
            });

            const response = await axios.get(`${backendUrl}/api/order/list?${queryParams.toString()}`, {
                headers: { token: localStorage.getItem('token') }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Get detailed information for a single order
     * @param {string|number} orderId - Order ID
     * @returns {Promise} Promise with order details
     */
    getOrderDetails: async (orderId) => {
        try {
            const response = await axios.get(`${backendUrl}/api/order/details/${orderId}`, {
                headers: { token: localStorage.getItem('token') }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Update order status
     * @param {string|number} orderId - Order ID to update
     * @param {string} status - New status value
     * @returns {Promise} Promise with update status
     */
    updateOrderStatus: async (orderId, status) => {
        try {
            const response = await axios.put(`${backendUrl}/api/order/status/${orderId}`,
                { status },
                { headers: { token: localStorage.getItem('token') } }
            );
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Get orders for a specific date with pagination and filter support
     * @param {Object} options - Options including date, page, limit, status, etc.
     * @returns {Promise} Promise with orders data and pagination info
     */
    getOrdersByDate: async (options = {}) => {
        try {
            const queryParams = new URLSearchParams();

            // Add all options as query parameters
            Object.entries(options).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value);
                }
            });

            const response = await axios.get(`${backendUrl}/api/order/by-date?${queryParams.toString()}`, {
                headers: { token: localStorage.getItem('token') }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Get order statistics 
     * @param {string} startDate - Start date for statistics (YYYY-MM-DD)
     * @param {string} endDate - End date for statistics (YYYY-MM-DD)
     * @returns {Promise} Promise with order statistics
     */
    getOrderStatistics: async (startDate, endDate) => {
        try {
            const response = await axios.get(`${backendUrl}/api/order/statistics`, {
                params: { start_date: startDate, end_date: endDate },
                headers: { token: localStorage.getItem('token') }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }
};

export default orderService;
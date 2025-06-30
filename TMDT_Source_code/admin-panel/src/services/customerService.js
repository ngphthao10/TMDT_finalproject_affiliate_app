import axios from 'axios';
import { backendUrl } from '../App';

const customerService = {
    /**
     * Get paginated list of customers with filtering options
     * @param {Object} options - Query parameters
     * @returns {Promise} Promise with customer data
     */
    getCustomers: async (options = {}) => {
        try {
            const queryParams = new URLSearchParams();

            // Add all options as query parameters
            Object.entries(options).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value);
                }
            });

            const response = await axios.get(`${backendUrl}/api/customers?${queryParams.toString()}`, {
                headers: { token: localStorage.getItem('token') }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Get detailed information for a single customer
     * @param {string|number} customerId - Customer ID
     * @returns {Promise} Promise with customer details
     */
    getCustomerDetails: async (customerId) => {
        try {
            const response = await axios.get(`${backendUrl}/api/customers/${customerId}`, {
                headers: { token: localStorage.getItem('token') }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Update customer information
     * @param {string|number} customerId - Customer ID to update
     * @param {Object} customerData - Updated customer data
     * @param {string} token - Admin authentication token
     * @returns {Promise} Promise with update status
     */
    updateCustomer: async (customerId, customerData, token) => {
        try {
            const response = await axios.put(`${backendUrl}/api/customers/${customerId}`, customerData, {
                headers: { token: localStorage.getItem('token') }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Change customer account status (activate/suspend/ban)
     * @param {string|number} customerId - Customer ID
     * @param {string} status - New status ('active', 'suspended', 'banned')
     * @param {string} reason - Reason for status change
     * @param {string} token - Admin authentication token
     * @returns {Promise} Promise with status change result
     */
    changeCustomerStatus: async (customerId, status, reason, token) => {
        try {
            const response = await axios.patch(`${backendUrl}/api/customers/${customerId}/status`,
                { status, reason },
                { headers: { token } }
            );
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Delete a customer account
     * @param {string|number} customerId - Customer ID to delete
     * @param {string} token - Admin authentication token
     * @returns {Promise} Promise with deletion status
     */
    deleteCustomer: async (customerId, token) => {
        try {
            const response = await axios.delete(`${backendUrl}/api/customers/${customerId}`, {
                headers: { token }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    // No password reset functionality in admin panel
};

export default customerService;
import axios from 'axios';
import { backendUrl } from '../App';

const dashboardService = {
    /**
     * Get main dashboard statistics
     * @param {string} startDate - Start date in ISO format
     * @param {string} endDate - End date in ISO format
     * @returns {Promise} Promise with dashboard stats
     */
    getDashboardStats: async (startDate, endDate) => {
        try {
            const response = await axios.get(`${backendUrl}/api/dashboard/stats`, {
                params: {
                    start_date: startDate,
                    end_date: endDate
                },
                headers: { token: localStorage.getItem('token') }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Get revenue data for chart
     * @param {string} startDate - Start date in ISO format
     * @param {string} endDate - End date in ISO format
     * @returns {Promise} Promise with revenue data
     */
    getRevenueData: async (startDate, endDate) => {
        try {
            const response = await axios.get(`${backendUrl}/api/dashboard/revenue`, {
                params: {
                    start_date: startDate,
                    end_date: endDate
                },
                headers: { token: localStorage.getItem('token') }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Get top performing products
     * @param {string} startDate - Start date in ISO format
     * @param {string} endDate - End date in ISO format
     * @returns {Promise} Promise with top products data
     */
    getTopProducts: async (startDate, endDate) => {
        try {
            const response = await axios.get(`${backendUrl}/api/dashboard/top-products`, {
                params: {
                    start_date: startDate,
                    end_date: endDate
                },
                headers: { token: localStorage.getItem('token') }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Get KOL performance data
     * @param {string} startDate - Start date in ISO format
     * @param {string} endDate - End date in ISO format
     * @returns {Promise} Promise with KOL performance data
     */
    getKOLPerformance: async (startDate, endDate, sortBy = 'commission') => {
        try {
            const response = await axios.get(`${backendUrl}/api/dashboard/kol-performance`, {
                params: {
                    start_date: startDate,
                    end_date: endDate,
                    sort_by: sortBy
                },
                headers: { token: localStorage.getItem('token') }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },
    /**
     * Get customer statistics
     * @param {string} startDate - Start date in ISO format
     * @param {string} endDate - End date in ISO format
     * @returns {Promise} Promise with customer statistics
     */
    getCustomerStats: async (startDate, endDate) => {
        try {
            const response = await axios.get(`${backendUrl}/api/dashboard/customer-stats`, {
                params: {
                    start_date: startDate,
                    end_date: endDate
                },
                headers: { token: localStorage.getItem('token') }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Export dashboard data (optional implementation)
     * @param {string} startDate - Start date in ISO format
     * @param {string} endDate - End date in ISO format
     * @param {string} format - Export format (e.g., 'csv', 'xlsx')
     * @returns {Promise} Promise with export URL or blob
     */
    exportData: async (startDate, endDate, format = 'csv') => {
        try {
            const response = await axios.get(`${backendUrl}/api/dashboard/export`, {
                params: {
                    start_date: startDate,
                    end_date: endDate,
                    format
                },
                headers: {
                    token: localStorage.getItem('token'),
                    'Accept': 'application/octet-stream'
                },
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `dashboard-export-${startDate}-${endDate}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Refresh dashboard data
     * @param {string} startDate - Start date in ISO format
     * @param {string} endDate - End date in ISO format
     * @returns {Promise} Promise with all dashboard data
     */
    refreshDashboard: async (startDate, endDate) => {
        try {
            const [
                statsResponse,
                revenueResponse,
                productsResponse,
                kolResponse,
                customerResponse
            ] = await Promise.all([
                dashboardService.getDashboardStats(startDate, endDate),
                dashboardService.getRevenueData(startDate, endDate),
                dashboardService.getTopProducts(startDate, endDate),
                dashboardService.getKOLPerformance(startDate, endDate),
                dashboardService.getCustomerStats(startDate, endDate)
            ]);

            return {
                stats: statsResponse.data,
                revenue: revenueResponse.data,
                products: productsResponse.data,
                kol: kolResponse.data,
                customers: customerResponse.data
            };
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }
};

export default dashboardService;
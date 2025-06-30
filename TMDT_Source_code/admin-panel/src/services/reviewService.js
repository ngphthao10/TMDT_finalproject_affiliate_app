import axios from 'axios';
import { backendUrl } from '../App';

const reviewService = {
    /**
     * Get paginated list of reviews with filtering options
     * @param {Object} options - Query parameters
     * @returns {Promise} Promise with reviews data
     */
    getReviews: async (options = {}) => {
        try {
            const queryParams = new URLSearchParams();

            // Add all options as query parameters
            Object.entries(options).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value);
                }
            });

            const response = await axios.get(`${backendUrl}/api/reviews?${queryParams.toString()}`, {
                headers: { token: localStorage.getItem('token') }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Get detailed information for a single review
     * @param {string|number} reviewId - Review ID
     * @returns {Promise} Promise with review details
     */
    getReviewDetails: async (reviewId) => {
        try {
            const response = await axios.get(`${backendUrl}/api/reviews/${reviewId}`, {
                headers: { token: localStorage.getItem('token') }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Update review status (approve/reject)
     * @param {string|number} reviewId - Review ID to update
     * @param {string} status - New status ('approved' or 'rejected')
     * @param {string} [rejectionReason] - Required reason if status is 'rejected'
     * @returns {Promise} Promise with update status
     */
    updateReviewStatus: async (reviewId, status, rejectionReason = '') => {
        try {
            const data = { status };

            // Add rejection reason if needed
            if (status === 'rejected') {
                data.rejection_reason = rejectionReason;
            }

            const response = await axios.put(
                `${backendUrl}/api/reviews/${reviewId}/status`,
                data,
                { headers: { token: localStorage.getItem('token') } }
            );
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Get product reviews statistics
     * @returns {Promise} Promise with review statistics by product
     */
    getReviewStatistics: async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/reviews/statistics`, {
                headers: { token: localStorage.getItem('token') }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Delete a review (admin only)
     * @param {string|number} reviewId - Review ID to delete
     * @returns {Promise} Promise with deletion status
     */
    deleteReview: async (reviewId) => {
        try {
            const response = await axios.delete(`${backendUrl}/api/reviews/${reviewId}`, {
                headers: { token: localStorage.getItem('token') }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }
};

export default reviewService;
import axios from 'axios';
import { backendUrl } from '../App';

const kolTierService = {
    /**
     * Get all KOL tiers
     * @returns {Promise} Promise with tiers data
     */
    getTiers: async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/kol-tiers/list`, {
                headers: {
                    'token': localStorage.getItem('token')
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Get a specific KOL tier
     * @param {Number} tierId - Tier ID
     * @returns {Promise} Promise with tier data
     */
    getTier: async (tierId) => {
        try {
            const response = await axios.get(`${backendUrl}/api/kol-tiers/${tierId}`, {
                headers: {
                    'token': localStorage.getItem('token')
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Create a new KOL tier
     * @param {Object} tierData - New tier data
     * @returns {Promise} Promise with created tier data
     */
    createTier: async (tierData) => {
        try {
            const response = await axios.post(`${backendUrl}/api/kol-tiers/create`, tierData, {
                headers: {
                    'token': localStorage.getItem('token')
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Update an existing KOL tier
     * @param {Number} tierId - Tier ID to update
     * @param {Object} tierData - Updated tier data
     * @returns {Promise} Promise with updated tier data
     */
    updateTier: async (tierId, tierData) => {
        try {
            const response = await axios.put(`${backendUrl}/api/kol-tiers/update/${tierId}`, tierData, {
                headers: {
                    'token': localStorage.getItem('token')
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Delete a KOL tier
     * @param {Number} tierId - Tier ID to delete
     * @returns {Promise} Promise with deletion status
     */
    deleteTier: async (tierId) => {
        try {
            const response = await axios.delete(`${backendUrl}/api/kol-tiers/delete/${tierId}`, {
                headers: {
                    'token': localStorage.getItem('token')
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }
};

export default kolTierService;
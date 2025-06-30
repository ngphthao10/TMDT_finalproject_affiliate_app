import axios from 'axios';
import { backendUrl } from '../App';

const kolPayoutService = {
    /**
     * Get payouts for a specific influencer
     */
    getInfluencerPayouts: async (params = {}) => {
        try {
            const response = await axios.get(`${backendUrl}/api/kol-payouts/influencer/payouts`, {
                headers: { 'token': localStorage.getItem('token') },
                params: params
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching influencer payouts:', error);
            return { success: false, message: error.response?.data?.message || error.message };
        }
    },

    /**
     * Get sales statistics for an influencer
     */
    getInfluencerSalesStats: async (params = {}) => {
        try {
            const response = await axios.get(`${backendUrl}/api/kol-payouts/influencer/stats`, {
                headers: { 'token': localStorage.getItem('token') },
                params: params
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching influencer stats:', error);
            return { success: false, message: error.response?.data?.message || error.message };
        }
    },

    /**
     * Get detailed information about a specific payout (for influencer)
     */
    getInfluencerPayoutDetails: async (payoutId) => {
        try {
            const response = await axios.get(`${backendUrl}/api/kol-payouts/influencer/payouts/${payoutId}`, {
                headers: { 'token': localStorage.getItem('token') }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching influencer payout details:', error);
            return { success: false, message: error.response?.data?.message || error.message };
        }
    }
};

export default kolPayoutService;
// kolPayoutService.js
import axios from 'axios';
import { backendUrl } from '../App';

class KolPayoutService {

    async getPayouts(params = {}) {
        try {
            const response = await axios.get(`${backendUrl}/api/kol-payouts/`, {
                params,
                headers: {
                    token: localStorage.getItem('token')
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching payouts:', error);
            throw error.response?.data || error;
        }
    }

    async getPayoutDetails(payoutId) {
        try {
            const response = await axios.get(`${backendUrl}/api/kol-payouts/${payoutId}`, {
                headers: {
                    token: localStorage.getItem('token')
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching payout details:', error);
            throw error.response?.data || error;
        }
    }

    async getEligiblePayouts(params = {}) {
        try {
            const response = await axios.get(`${backendUrl}/api/kol-payouts/eligible`, {
                params,
                headers: {
                    token: localStorage.getItem('token')
                }
            });
            console.log('data: ', response.data)
            return response.data;
        } catch (error) {
            console.error('Error fetching eligible payouts:', error);
            throw error.response?.data || error;
        }
    }

    async generatePayouts(payoutData) {
        try {
            const response = await axios.post(`${backendUrl}/api/kol-payouts/generate`, {
                payout_data: payoutData
            }, {
                headers: {
                    token: localStorage.getItem('token')
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error generating payouts:', error);
            throw error.response?.data || error;
        }
    }

    async updatePayoutStatus(payoutId, data) {
        try {
            const response = await axios.put(`${backendUrl}/api/kol-payouts/${payoutId}/status`, data, {
                headers: {
                    token: localStorage.getItem('token')
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating payout status:', error);
            throw error.response?.data || error;
        }
    }

    async exportPayoutReport(params = {}) {
        try {
            const response = await axios.get(`${backendUrl}/api/kol-payouts/export`, {
                params,
                headers: {
                    token: localStorage.getItem('token')
                },
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Error exporting payouts:', error);
            throw error.response?.data || error;
        }
    }
}

export default new KolPayoutService();
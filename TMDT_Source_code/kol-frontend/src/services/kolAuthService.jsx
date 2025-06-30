import axios from 'axios';
import { backendUrl } from '../App';

const kolAuthService = {
    login: async (credentials) => {
        try {
            const response = await axios.post(`${backendUrl}/api/users/kol/login`, credentials);
            return response.data;
        } catch (error) {
            if (error.response) {
                // The server responded with a status code outside the 2xx range
                throw error.response.data;
            } else if (error.request) {
                // The request was made but no response was received
                throw { success: false, message: 'No response from server' };
            } else {
                // Something happened in setting up the request
                throw { success: false, message: error.message };
            }
        }
    },

    verifyToken: async (token) => {
        try {
            const response = await axios.get(`${backendUrl}/api/users/verify`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Token verification failed' };
        }
    }
};

export default kolAuthService;
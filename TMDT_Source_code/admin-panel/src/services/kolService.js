import axios from 'axios';
import { backendUrl } from '../App';

const kolService = {

    getKOLs: async (options = {}) => {
        try {
            const queryParams = new URLSearchParams();

            // Add all options as query parameters
            Object.entries(options).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value);
                }
            });

            const response = await axios.get(`${backendUrl}/api/kols/list?${queryParams.toString()}`, {
                headers: {
                    'token': localStorage.getItem('token')
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },


    getKOLDetails: async (kolId) => {
        try {
            const response = await axios.get(`${backendUrl}/api/kols/${kolId}`, {
                headers: {
                    'token': localStorage.getItem('token')
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },


    updateKOLStatus: async (kolId, data) => {
        try {
            const response = await axios.put(
                `${backendUrl}/api/kols/${kolId}/status`,
                data,
                {
                    headers: {
                        'token': localStorage.getItem('token')
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },


    getTiers: async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/kols/tiers`, {
                headers: {
                    'token': localStorage.getItem('token')
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },


    getApplications: async (options = {}) => {
        try {
            const queryParams = new URLSearchParams();

            // Add all options as query parameters
            Object.entries(options).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value);
                }
            });

            // Match the proper endpoint
            const response = await axios.get(`${backendUrl}/api/kols/list/applications?${queryParams.toString()}`, {
                headers: {
                    'token': localStorage.getItem('token')
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },


    getApplicationDetails: async (applicationId) => {
        try {
            const response = await axios.get(`${backendUrl}/api/kols/applications/${applicationId}`, {
                headers: {
                    'token': localStorage.getItem('token')
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },


    approveApplication: async (applicationId, data = {}) => {
        try {
            const response = await axios.put(
                `${backendUrl}/api/kols/applications/${applicationId}/approve`,
                data,
                {
                    headers: {
                        'token': localStorage.getItem('token')
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    rejectApplication: async (applicationId, data) => {
        try {
            if (!data.reason) {
                throw new Error('Rejection reason is required');
            }

            const response = await axios.put(
                `${backendUrl}/api/kols/applications/${applicationId}/reject`,
                data,
                {
                    headers: {
                        'token': localStorage.getItem('token')
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }
};

export default kolService;
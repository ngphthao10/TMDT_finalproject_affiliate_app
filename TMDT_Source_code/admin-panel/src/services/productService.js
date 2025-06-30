import axios from 'axios';
import { backendUrl } from '../App';

const productService = {
    /**
     * Get paginated list of products with filtering options
     * @param {Object} options - Query parameters
     * @returns {Promise} Promise with product data
     */
    getProducts: async (options = {}) => {
        try {
            const queryParams = new URLSearchParams();

            // Add all options as query parameters
            Object.entries(options).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value);
                }
            });

            const response = await axios.get(`${backendUrl}/api/product/list?${queryParams.toString()}`, {
                headers: { token: localStorage.getItem('token') }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Get detailed information for a single product
     * @param {string|number} productId - Product ID
     * @returns {Promise} Promise with product details
     */
    getProductDetails: async (productId) => {
        try {
            const response = await axios.get(`${backendUrl}/api/product/details/${productId}`, {
                headers: { token: localStorage.getItem('token') }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Get product information for editing
     * @param {string|number} productId - Product ID
     * @param {string} token - Admin authentication token
     * @returns {Promise} Promise with product data ready for edit form
     */
    getProductForEdit: async (productId, token) => {
        try {
            const response = await axios.get(`${backendUrl}/api/product/edit/${productId}`, {
                headers: { token }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Add a new product
     * @param {FormData} formData - Product form data with images
     * @param {string} token - Admin authentication token
     * @returns {Promise} Promise with created product data
     */
    addProduct: async (formData, token) => {
        try {
            const response = await axios.post(`${backendUrl}/api/product/add`, formData, {
                headers: {
                    token,
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Update an existing product
     * @param {string|number} productId - Product ID to update
     * @param {FormData} formData - Product form data with images
     * @param {string} token - Admin authentication token
     * @returns {Promise} Promise with update status
     */
    updateProduct: async (productId, formData, token) => {
        try {
            const response = await axios.put(`${backendUrl}/api/product/update/${productId}`, formData, {
                headers: {
                    token,
                    'Content-Type': 'multipart/form-data'
                }
            });

            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },
    /**
     * Delete a product
     * @param {string|number} productId - Product ID to delete
     * @param {string} token - Admin authentication token
     * @returns {Promise} Promise with deletion status
     */
    deleteProduct: async (productId, token) => {
        try {
            const response = await axios.delete(`${backendUrl}/api/product/${productId}`, {
                headers: { token }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Delete a product image
     * @param {string|number} imageId - Image ID to delete
     * @param {string} token - Admin authentication token
     * @returns {Promise} Promise with deletion status
     */
    deleteProductImage: async (imageId, token) => {
        try {
            const response = await axios.delete(`${backendUrl}/api/product/image/${imageId}`, {
                headers: { token }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }
};

export default productService;
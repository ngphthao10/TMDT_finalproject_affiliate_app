import axios from 'axios';
import { backendUrl, currency } from '../App'

const categoryService = {
    /**
     * Get all parent categories
     * @returns {Promise} Promise object with categories data
     */
    getCategories: async () => {
        try {
            const response = await axios.get(backendUrl + `/api/categories`, {
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
     * Get all subcategories
     * @returns {Promise} Promise object with subcategories data
     */
    getAllSubCategories: async () => {
        try {
            const response = await axios.get(backendUrl + `/api/categories/subcategories`, {
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
     * Get subcategories for a specific parent category
     * @param {Number} parentId - Parent category ID
     * @returns {Promise} Promise object with subcategories data
     */
    getSubCategories: async (parentId) => {
        try {
            const response = await axios.get(backendUrl + `/api/categories/${parentId}/subcategories`, {
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
     * Create a new category
     * @param {Object} categoryData - Category data
     * @returns {Promise} Promise object with new category data
     */
    createCategory: async (categoryData) => {
        try {
            const response = await axios.post(backendUrl + `/api/categories`, categoryData, {
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
     * Create a new subcategory
     * @param {Object} subCategoryData - Subcategory data with parent_category_id
     * @returns {Promise} Promise object with new subcategory data
     */
    createSubCategory: async (subCategoryData) => {
        try {
            const response = await axios.post(backendUrl + `/api/categories/subcategory`, subCategoryData, {
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
     * Delete a category
     * @param {Number} categoryId - Category ID to delete
     * @returns {Promise} Promise object with deletion status
     */
    deleteCategory: async (categoryId) => {
        try {
            const response = await axios.delete(backendUrl + `/api/categories/${categoryId}`, {
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
     * Delete a subcategory
     * @param {Number} subCategoryId - Subcategory ID to delete
     * @returns {Promise} Promise object with deletion status
     */
    deleteSubCategory: async (subCategoryId) => {
        try {
            const response = await axios.delete(backendUrl + `/api/categories/subcategory/${subCategoryId}`, {
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

export default categoryService;
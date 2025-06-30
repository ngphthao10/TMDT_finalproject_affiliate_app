import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import categoryService from '../../services/categoryService';
import { toast } from 'react-toastify';
import DeleteConfirmationModal from '../DeleteConfirm';

const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [newSubCategory, setNewSubCategory] = useState('');
    const [selectedParentId, setSelectedParentId] = useState('');
    const [loading, setLoading] = useState(false);

    // State for delete confirmation modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteItemType, setDeleteItemType] = useState('');  // 'category' or 'subcategory'

    // Fetch categories and subcategories on component mount
    useEffect(() => {
        fetchCategories();
        fetchSubCategories();
    }, []);

    // Fetch all parent categories
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await categoryService.getCategories();
            if (response.success) {
                setCategories(response.data);
                // Set default selected parent if there are categories
                if (response.data.length > 0 && !selectedParentId) {
                    setSelectedParentId(response.data[0].category_id);
                }
            } else if (response.message && (response.message.includes('Not Authorized') || response.message.includes('Invalid token'))) {
                // Handle unauthorized error
                toast.error('Admin authorization required');
            }
        } catch (error) {
            toast.error('Failed to fetch categories: ' + (error.message || 'Unknown error'));
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch all subcategories
    const fetchSubCategories = async () => {
        try {
            setLoading(true);
            const response = await categoryService.getAllSubCategories();
            if (response.success) {
                setSubCategories(response.data);
            }
        } catch (error) {
            toast.error('Failed to fetch subcategories: ' + (error.message || 'Unknown error'));
            console.error('Error fetching subcategories:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle adding a new category
    const handleAddCategory = async () => {
        if (newCategory.trim() === '') {
            toast.warning('Category name cannot be empty');
            return;
        }

        try {
            setLoading(true);
            const response = await categoryService.createCategory({
                display_text: newCategory.trim(),
                description: ''
            });

            if (response.success) {
                toast.success('Category added successfully');
                setNewCategory('');
                fetchCategories(); // Refresh the categories list
            }
        } catch (error) {
            toast.error('Failed to add category: ' + (error.message || 'Unknown error'));
            console.error('Error adding category:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle adding a new subcategory
    const handleAddSubCategory = async () => {
        if (newSubCategory.trim() === '') {
            toast.warning('Subcategory name cannot be empty');
            return;
        }

        if (!selectedParentId) {
            toast.warning('Please select a parent category');
            return;
        }

        try {
            setLoading(true);
            const response = await categoryService.createSubCategory({
                display_text: newSubCategory.trim(),
                description: '',
                parent_category_id: selectedParentId
            });

            if (response.success) {
                toast.success('Subcategory added successfully');
                setNewSubCategory('');
                fetchSubCategories(); // Refresh the subcategories list
            }
        } catch (error) {
            toast.error('Failed to add subcategory: ' + (error.message || 'Unknown error'));
            console.error('Error adding subcategory:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle removing a category
    const handleRemoveCategory = (category) => {
        setItemToDelete(category);
        setDeleteItemType('category');
        setIsDeleteModalOpen(true);
    };

    // Handle removing a subcategory
    const handleRemoveSubCategory = (subCategory) => {
        setItemToDelete(subCategory);
        setDeleteItemType('subcategory');
        setIsDeleteModalOpen(true);
    };

    // Perform the actual category deletion
    const confirmDeleteCategory = async () => {
        if (!itemToDelete) return;

        try {
            setLoading(true);
            const response = await categoryService.deleteCategory(itemToDelete.category_id);

            if (response.success) {
                toast.success('Category deleted successfully');
                fetchCategories(); // Refresh the categories list
                fetchSubCategories(); // Also refresh subcategories as they might be affected
            } else {
                toast.error(response.message || 'Failed to delete category');
            }
        } catch (error) {
            toast.error('Failed to delete category: ' + (error.message || 'Unknown error'));
            console.error('Error deleting category:', error);
        } finally {
            setLoading(false);
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    // Perform the actual subcategory deletion
    const confirmDeleteSubCategory = async () => {
        if (!itemToDelete) return;

        try {
            setLoading(true);
            const response = await categoryService.deleteSubCategory(itemToDelete.category_id);

            if (response.success) {
                toast.success('Subcategory deleted successfully');
                fetchSubCategories(); // Refresh the subcategories list
            } else {
                toast.error(response.message || 'Failed to delete subcategory');
            }
        } catch (error) {
            toast.error('Failed to delete subcategory: ' + (error.message || 'Unknown error'));
            console.error('Error deleting subcategory:', error);
        } finally {
            setLoading(false);
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    // Handle confirmation from the modal
    const handleConfirmDelete = () => {
        if (deleteItemType === 'category') {
            confirmDeleteCategory();
        } else if (deleteItemType === 'subcategory') {
            confirmDeleteSubCategory();
        }
    };

    // Close the modal without taking action
    const handleCloseModal = () => {
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Categories management */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4">Product Categories</h3>
                <div className="mb-6">
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="Add new category"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={loading}
                        />
                        <button
                            onClick={handleAddCategory}
                            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:bg-blue-300"
                            disabled={loading}
                        >
                            <FiPlus className="mr-1" />
                            Add
                        </button>
                    </div>
                </div>

                <div className="border rounded-md overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 font-medium border-b">
                        Available Categories
                    </div>
                    <div className="divide-y max-h-60 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500">
                                Loading categories...
                            </div>
                        ) : categories.length > 0 ? (
                            categories.map((category) => (
                                <div key={category.category_id} className="flex justify-between items-center p-3 hover:bg-gray-50">
                                    <span>{category.display_text}</span>
                                    <button
                                        onClick={() => handleRemoveCategory(category)}
                                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                                        title="Remove category"
                                        disabled={loading}
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-gray-500">
                                No categories found
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sub-categories management */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4">Product Sub-Categories</h3>
                <div className="mb-6">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Parent Category
                        </label>
                        <select
                            value={selectedParentId}
                            onChange={(e) => setSelectedParentId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={loading || categories.length === 0}
                        >
                            <option value="">Select a parent category</option>
                            {categories.map((category) => (
                                <option key={category.category_id} value={category.category_id}>
                                    {category.display_text}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={newSubCategory}
                            onChange={(e) => setNewSubCategory(e.target.value)}
                            placeholder="Add new sub-category"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={loading || !selectedParentId}
                        />
                        <button
                            onClick={handleAddSubCategory}
                            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:bg-blue-300"
                            disabled={loading || !selectedParentId}
                        >
                            <FiPlus className="mr-1" />
                            Add
                        </button>
                    </div>
                </div>

                <div className="border rounded-md overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 font-medium border-b">
                        Available Sub-Categories
                    </div>
                    <div className="divide-y max-h-60 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500">
                                Loading subcategories...
                            </div>
                        ) : subCategories.length > 0 ? (
                            subCategories.map((subCategory) => (
                                <div key={subCategory.category_id} className="flex justify-between items-center p-3 hover:bg-gray-50">
                                    <div>
                                        <span className="font-medium">{subCategory.display_text}</span>
                                        {subCategory.parent_category && (
                                            <span className="ml-2 text-xs text-gray-500">
                                                (Parent: {subCategory.parent_category.display_text})
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleRemoveSubCategory(subCategory)}
                                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                                        title="Remove sub-category"
                                        disabled={loading}
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-gray-500">
                                No sub-categories found
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete confirmation modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmDelete}
                itemName={itemToDelete?.display_text || ''}
                itemType={deleteItemType}
            />
        </div>
    );
};

export default CategoryManager;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../../App';
import { toast } from 'react-toastify';
import {
    FiUpload,
    FiX,
    FiSave,
    FiRotateCcw,
    FiInfo,
    FiAlertCircle,
    FiPlusCircle,
    FiMinusCircle
} from 'react-icons/fi';
import categoryService from '../../services/categoryService';
import productService from '../../services/productService';
import ConfirmModal from '../ConfirmModal';

const ProductForm = ({ token, editProduct, onSuccess }) => {

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        sku: '',
        category_id: '',
        subCategory_id: '',
        commission_rate: '0'
    });

    // Inventory state - array of size items with their price and quantity
    const [inventoryItems, setInventoryItems] = useState([
        { size: 'S', price: '', quantity: '0', selected: false },
        { size: 'M', price: '', quantity: '0', selected: false },
        { size: 'L', price: '', quantity: '0', selected: false },
        { size: 'XL', price: '', quantity: '0', selected: false },
        { size: 'XXL', price: '', quantity: '0', selected: false }
    ]);

    // Image state
    const [images, setImages] = useState({ image1: null, image2: null, image3: null, image4: null });

    // Image preview state
    const [imagePreview, setImagePreview] = useState({ image1: null, image2: null, image3: null, image4: null });

    // Existing image IDs (for edit mode)
    const [existingImageIds, setExistingImageIds] = useState({
        image1: null,
        image2: null,
        image3: null,
        image4: null
    });

    // Loading and error states
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    // Fetch categories when component mounts
    useEffect(() => {
        fetchCategories();
    }, []);

    // Load initial data when component mounts or editProduct changes
    useEffect(() => {
        // Reset form when not editing
        if (!editProduct) {
            resetForm();
            return;
        }

        // Set edit mode
        setEditMode(true);

        // Populate form with edit product data
        setFormData({
            name: editProduct.name || '',
            description: editProduct.description || '',
            sku: editProduct.sku || '',
            category_id: editProduct.category_id || '',
            subCategory_id: editProduct.subCategory?.id || '',
            commission_rate: editProduct.commission_rate || 0
        });

        setSelectedCategory(editProduct.category_id || '');
        setSelectedSubCategory(editProduct.subCategory?.id || '');

        // Handle inventory data
        if (editProduct.inventory && editProduct.inventory.length > 0) {
            // Create a map of existing inventory by size
            const existingInventory = {};
            editProduct.inventory.forEach(item => {
                existingInventory[item.size] = {
                    price: item.price || '',
                    quantity: item.quantity || 0,
                    selected: true
                };
            });

            // Update inventory items
            setInventoryItems(prevItems =>
                prevItems.map(item => ({
                    ...item,
                    price: existingInventory[item.size]?.price || '',
                    quantity: existingInventory[item.size]?.quantity || 0,
                    selected: !!existingInventory[item.size]
                }))
            );
        } else if (editProduct.sizes && Array.isArray(editProduct.sizes)) {
            // Fallback for older data format
            const selectedSizes = editProduct.sizes;
            const price = editProduct.price || '';

            setInventoryItems(prevItems =>
                prevItems.map(item => ({
                    ...item,
                    price: selectedSizes.includes(item.size) ? price : '',
                    quantity: 0,
                    selected: selectedSizes.includes(item.size)
                }))
            );
        }

        // Set image previews from existing product
        if (editProduct.images && editProduct.images.length > 0) {
            const previews = {};
            const imageIds = {};

            editProduct.images.forEach((image, index) => {
                const key = `image${index + 1}`;
                previews[key] = image.url;
                imageIds[key] = image.id;
            });

            setImagePreview(previews);
            setExistingImageIds(imageIds);
        }

        // If category is set, fetch subcategories
        if (editProduct.category_id) {
            handleCategoryChange(editProduct.category_id);
        }
    }, [editProduct]);

    // Fetch all categories
    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            const response = await categoryService.getCategories();
            if (response.success) {
                setCategories(response.data || []);
            } else {
                toast.error('Failed to load categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Error loading categories');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Clear any error for this field
        if (formErrors[name]) {
            setFormErrors({ ...formErrors, [name]: null });
        }
    };

    // Handle category change
    const handleCategoryChange = async (e) => {
        const categoryId = typeof e === 'object' ? e.target.value : e;
        setSelectedCategory(categoryId);

        // Clear any error
        if (formErrors.category_id) {
            setFormErrors({ ...formErrors, category_id: null });
        }

        // Fetch subcategories if a category is selected
        if (categoryId) {
            try {
                setIsLoading(true);
                const response = await categoryService.getSubCategories(categoryId);
                if (response.success) {
                    setSubCategories(response.data || []);
                } else {
                    toast.error('Failed to load subcategories');
                    setSubCategories([]);
                }
            } catch (error) {
                console.error('Error fetching subcategories:', error);
                toast.error('Error loading subcategories');
                setSubCategories([]);
            } finally {
                setIsLoading(false);
            }
        } else {
            setSubCategories([]);
        }
    };

    // Handle subcategory change
    const handleSubCategoryChange = (e) => {
        const subCategoryId = e.target.value;
        setSelectedSubCategory(subCategoryId);

        // Also update formData
        setFormData({
            ...formData,
            subCategory_id: subCategoryId
        });

        // Clear any error
        if (formErrors.subCategory) {
            setFormErrors({ ...formErrors, subCategory: null });
        }
    };
    // Handle inventory item changes
    const handleInventoryChange = (index, field, value) => {
        const updatedItems = [...inventoryItems];

        if (field === 'selected') {
            updatedItems[index].selected = !updatedItems[index].selected;

            // If selecting this size, ensure price has a default value
            if (updatedItems[index].selected && !updatedItems[index].price) {
                // Try to copy price from another selected size
                const someSelectedItem = updatedItems.find(item => item.selected && item.price);
                if (someSelectedItem) {
                    updatedItems[index].price = someSelectedItem.price;
                }
            }
        } else {
            updatedItems[index][field] = value;
        }

        setInventoryItems(updatedItems);

        // Clear inventory error if at least one size is selected
        if (formErrors.inventory && updatedItems.some(item => item.selected)) {
            setFormErrors({ ...formErrors, inventory: null });
        }
    };

    // Apply price to all selected sizes
    const applyPriceToAll = (price) => {
        setInventoryItems(prevItems =>
            prevItems.map(item => ({
                ...item,
                price: item.selected ? price : item.price
            }))
        );
    };

    // Apply quantity to all selected sizes
    const applyQuantityToAll = (quantity) => {
        setInventoryItems(prevItems =>
            prevItems.map(item => ({
                ...item,
                quantity: item.selected ? quantity : item.quantity
            }))
        );
    };

    // Handle image change
    const handleImageChange = (e, imageKey) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];

            // Validate file type
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                toast.error('Please upload a valid image file (JPEG, PNG, GIF, WEBP)');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should not exceed 5MB');
                return;
            }

            setImages({
                ...images,
                [imageKey]: file
            });

            setImagePreview({
                ...imagePreview,
                [imageKey]: URL.createObjectURL(file)
            });
        }
    };

    // Add this state to track images that need to be deleted from the database
    const [imagesToRemove, setImagesToRemove] = useState([]);

    // Update the removeImage function
    const removeImage = async (imageKey) => {
        // If this is an existing image (has an ID), delete it
        if (existingImageIds[imageKey]) {
            const imageId = existingImageIds[imageKey];

            // Show loading state or spinner if needed

            try {
                // Call the API to delete the image
                const response = await productService.deleteProductImage(imageId, token);

                if (response.success) {

                    // Clear the image from state after successful deletion
                    setImages({
                        ...images,
                        [imageKey]: null
                    });

                    setImagePreview({
                        ...imagePreview,
                        [imageKey]: null
                    });

                    // Clear the ID from existing image IDs
                    setExistingImageIds({
                        ...existingImageIds,
                        [imageKey]: null
                    });
                } else {
                    toast.error(response.message || 'Failed to delete image');
                }
            } catch (error) {
                toast.error(error.message || 'An error occurred while deleting image');
                console.error('Error deleting image:', error);
            }
        } else {
            // For new images that haven't been saved yet, just remove from state
            setImages({
                ...images,
                [imageKey]: null
            });

            setImagePreview({
                ...imagePreview,
                [imageKey]: null
            });
        }
    };

    // Validate form
    const validateForm = () => {
        const errors = {};

        if (!formData.name.trim()) {
            errors.name = 'Product name is required';
        }

        if (!formData.description.trim()) {
            errors.description = 'Product description is required';
        }

        if (!selectedCategory) {
            errors.category_id = 'Category is required';
        }

        // Validate inventory
        const selectedItems = inventoryItems.filter(item => item.selected);

        if (selectedItems.length === 0) {
            errors.inventory = 'At least one size must be selected';
        } else {
            // Check that all selected items have valid prices
            const invalidPriceItems = selectedItems.filter(
                item => !item.price || isNaN(parseFloat(item.price)) || parseFloat(item.price) <= 0
            );

            if (invalidPriceItems.length > 0) {
                errors.inventory = 'All selected sizes must have valid prices';
            }
        }

        if (!editMode && !images.image1 && !imagePreview.image1) {
            errors.image1 = 'Main product image is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Reset form
    const resetForm = () => {
        // Only confirm if form has data
        const hasData = formData.name ||
            formData.description ||
            inventoryItems.some(item => item.selected) ||
            images.image1;

        if (hasData && !isSubmitting) {
            setShowResetConfirm(true);
            return;
        }
        // Move the actual reset logic to a separate function
        performReset();
    };

    // Add new function for actual reset
    const performReset = () => {
        setFormData({
            name: '',
            description: '',
            sku: '',
            category_id: '',
            subCategory_id: '',
            commission_rate: '0'
        });

        setInventoryItems([
            { size: 'S', price: '', quantity: '0', selected: false },
            { size: 'M', price: '', quantity: '0', selected: false },
            { size: 'L', price: '', quantity: '0', selected: false },
            { size: 'XL', price: '', quantity: '0', selected: false },
            { size: 'XXL', price: '', quantity: '0', selected: false }
        ]);

        setImages({
            image1: null,
            image2: null,
            image3: null,
            image4: null
        });

        setImagePreview({
            image1: null,
            image2: null,
            image3: null,
            image4: null
        });

        setSelectedCategory('');
        setSelectedSubCategory('');
        setFormErrors({});
        setShowResetConfirm(false);  // Close modal after reset
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setIsSubmitting(true);

        try {
            const formDataToSend = new FormData();

            // Add basic product info
            formDataToSend.append('name', formData.name);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('sku', formData.sku);
            formDataToSend.append('category_id', selectedCategory);

            // Add subcategory if selected
            if (selectedSubCategory) {
                formDataToSend.append('subCategory', selectedSubCategory);
            }
            // Add subcategory if selected
            if (formData.subCategory_id) {
                formDataToSend.append('subCategory_id', formData.subCategory_id);
            }
            formDataToSend.append('commission_rate', formData.commission_rate);

            // Add inventory data - separate field for backend compatibility
            const selectedItems = inventoryItems.filter(item => item.selected);

            // Add sizes field for compatibility (as JSON string)
            formDataToSend.append('sizes', JSON.stringify(selectedItems.map(item => item.size)));

            // Add price field for backward compatibility
            const firstItemPrice = selectedItems[0]?.price || '0';
            formDataToSend.append('price', firstItemPrice);

            // Set quantity field for backward compatibility
            const avgQuantity = Math.floor(
                selectedItems.reduce((sum, item) => sum + parseInt(item.quantity, 10), 0) / selectedItems.length
            );
            formDataToSend.append('quantity', avgQuantity.toString());

            // Add inventory as a JSON string for the improved API
            formDataToSend.append('inventory', JSON.stringify(
                selectedItems.map(item => ({
                    size: item.size,
                    price: parseFloat(item.price),
                    quantity: parseInt(item.quantity, 10)
                }))
            ));

            // Add image files if available
            for (const key in images) {
                if (images[key]) {
                    formDataToSend.append(key, images[key]);
                }
            }

            // If editing, use update endpoint, otherwise use add endpoint
            let response;
            if (editProduct) {
                console.log("Images to remove:", imagesToRemove);
                if (imagesToRemove.length > 0) {
                    formDataToSend.append('removed_images', JSON.stringify(imagesToRemove));
                }

                response = await productService.updateProduct(
                    editProduct.id,
                    formDataToSend,
                    token
                );
            } else {
                response = await productService.addProduct(
                    formDataToSend,
                    token
                );
            }

            if (response.success) {
                toast.success(response.message || (editProduct ? 'Product updated successfully' : 'Product added successfully'));
                if (onSuccess) {
                    onSuccess(response.data);
                }

            } else {
                toast.error(response.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error submitting product:', error);
            toast.error(error.response?.data?.message || 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Render form error message
    const renderError = (error) => {
        if (!error) return null;

        return (
            <p className="text-red-500 text-xs mt-1 flex items-center">
                <FiAlertCircle className="mr-1" />
                {error}
            </p>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-6">
                {editProduct ? 'Edit Product' : 'Add New Product'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Images */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Product Images</label>
                    <p className="text-xs text-gray-500 mb-2">Upload up to 4 product images. First image will be the main product image.</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(num => {
                            const imageKey = `image${num}`;
                            return (
                                <div key={imageKey} className="relative">
                                    {imagePreview[imageKey] ? (
                                        <div className="relative group">
                                            <img
                                                crossOrigin="anonymous"
                                                src={imagePreview[imageKey].startsWith('blob:')
                                                    ? imagePreview[imageKey]  // Blob URL cho file mới upload
                                                    : `${backendUrl}${imagePreview[imageKey]}`  // URL server cho ảnh đã lưu
                                                }
                                                alt={`Product preview ${num}`}
                                                className="w-full h-full object-cover border rounded-lg"
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(imageKey)}
                                                    className="p-1 bg-red-500 text-white rounded-full"
                                                >
                                                    <FiX size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label htmlFor={imageKey} className="cursor-pointer block">
                                            <div className={`border-2 border-dashed ${formErrors[imageKey] ? 'border-red-300' : 'border-gray-300'} rounded-lg p-4 h-32 flex flex-col items-center justify-center transition-colors hover:border-gray-400`}>
                                                <FiUpload className={`w-8 h-8 ${formErrors[imageKey] ? 'text-red-400' : 'text-gray-400'} mb-2`} />
                                                <span className={`text-xs ${formErrors[imageKey] ? 'text-red-500' : 'text-gray-500'}`}>Upload image</span>
                                            </div>
                                            <input
                                                type="file"
                                                id={imageKey}
                                                onChange={(e) => handleImageChange(e, imageKey)}
                                                className="hidden"
                                                accept="image/*"
                                            />
                                        </label>
                                    )}
                                    {num === 1 && !imagePreview[imageKey] && !editMode && (
                                        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                            Required
                                        </span>
                                    )}
                                    {renderError(formErrors[imageKey])}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Product Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Product Name*
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border ${formErrors.name ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 ${formErrors.name ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                            placeholder="Enter product name"
                        />
                        {renderError(formErrors.name)}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                            SKU (Optional)
                        </label>
                        <input
                            id="sku"
                            name="sku"
                            type="text"
                            value={formData.sku}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Product SKU (generated if empty)"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Product Description*
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className={`w-full px-3 py-2 border ${formErrors.description ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 ${formErrors.description ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                        placeholder="Enter product description"
                    />
                    {renderError(formErrors.description)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                            Category*
                        </label>
                        <select
                            id="category"
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            className={`w-full px-3 py-2 border ${formErrors.category_id ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 ${formErrors.category_id ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                        >
                            <option value="">Select a category</option>
                            {categories && categories.map((cat) => (
                                <option key={cat.category_id} value={cat.category_id}>
                                    {cat.display_text}
                                </option>
                            ))}
                        </select>
                        {renderError(formErrors.category_id)}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="subCategory" className="block text-sm font-medium text-gray-700">
                            Sub-Category*
                        </label>
                        <select
                            id="subCategory"
                            value={selectedSubCategory}
                            onChange={handleSubCategoryChange}
                            className={`w-full px-3 py-2 border ${formErrors.subCategory ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 ${formErrors.subCategory ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                        >
                            <option value="">Select a sub-category</option>
                            {subCategories && subCategories.map((subCat) => (
                                <option key={subCat.category_id} value={subCat.category_id}>
                                    {subCat.display_text}
                                </option>
                            ))}
                        </select>
                        {renderError(formErrors.subCategory)}
                    </div>
                </div>

                {/* Inventory Management */}
                <div className="space-y-4 border rounded-md p-4 bg-gray-50">
                    <div className="flex justify-between items-center">
                        <h4 className="text-lg font-medium text-gray-700">Inventory Management</h4>
                        <div className="text-xs text-gray-500">Select sizes and set prices/quantities</div>
                    </div>

                    {renderError(formErrors.inventory)}

                    {/* Bulk Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Set price for all selected sizes
                            </label>
                            <div className="flex">
                                <div className="relative flex-1">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="Enter price"
                                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                applyPriceToAll(e.target.value);
                                            }
                                        }}
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
                                    onClick={() => {
                                        const priceInput = document.querySelector('input[placeholder="Enter price"]');
                                        applyPriceToAll(priceInput.value);
                                    }}
                                >
                                    Apply
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Set quantity for all selected sizes
                            </label>
                            <div className="flex">
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Enter quantity"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            applyQuantityToAll(e.target.value);
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
                                    onClick={() => {
                                        const quantityInput = document.querySelector('input[placeholder="Enter quantity"]');
                                        applyQuantityToAll(quantityInput.value);
                                    }}
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Inventory Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Size
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Price ($)
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Quantity
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Available
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {inventoryItems.map((item, index) => (
                                    <tr key={item.size} className={item.selected ? 'bg-blue-50' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {item.size}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={item.price}
                                                onChange={(e) => handleInventoryChange(index, 'price', e.target.value)}
                                                className={`w-full px-3 py-1 border ${item.selected && (!item.price || parseFloat(item.price) <= 0)
                                                    ? 'border-red-300'
                                                    : 'border-gray-300'
                                                    } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                                disabled={!item.selected}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <input
                                                type="number"
                                                min="0"
                                                value={item.quantity}
                                                onChange={(e) => handleInventoryChange(index, 'quantity', e.target.value)}
                                                className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                disabled={!item.selected}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                            <div className="flex justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleInventoryChange(index, 'selected')}
                                                    className={`w-6 h-6 flex items-center justify-center rounded-full ${item.selected
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                                        }`}
                                                >
                                                    {item.selected ? <FiMinusCircle size={14} /> : <FiPlusCircle size={14} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="commission_rate" className="block text-sm font-medium text-gray-700">
                        Commission Rate (%) for Influencers
                    </label>
                    <input
                        id="commission_rate"
                        name="commission_rate"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.commission_rate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                    />
                    <p className="text-xs text-gray-500">
                        <FiInfo className="inline mr-1" />
                        Percentage commission for influencers who promote this product
                    </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 flex items-center"
                        disabled={isSubmitting}
                    >
                        <FiRotateCcw className="mr-2" />
                        Reset
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:bg-blue-400 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                                {editProduct ? 'Updating...' : 'Saving...'}
                            </>
                        ) : (
                            <>
                                <FiSave className="mr-2" />
                                {editProduct ? 'Update Product' : 'Add Product'}
                            </>
                        )}
                    </button>
                </div>
            </form>
            <ConfirmModal
                isOpen={showResetConfirm}
                onClose={() => setShowResetConfirm(false)}
                onConfirm={performReset}
                title="Reset Form"
                message="Are you sure you want to reset the form? All unsaved data will be lost."
            />
        </div>
    );
};

export default ProductForm;
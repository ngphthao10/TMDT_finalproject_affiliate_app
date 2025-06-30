import React, { useState, useEffect } from 'react';
import { FiSave, FiRotateCcw, FiAlertCircle, FiUser, FiMail, FiPhone } from 'react-icons/fi';
import { toast } from 'react-toastify';
import customerService from '../../services/customerService';
import ConfirmModal from '../ConfirmModal';

const CustomerForm = ({ token, editCustomer, onSuccess }) => {
    const [formData, setFormData] = useState({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        phone_num: '',
        status: 'active',
        status_reason: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    // Initialize form with customer data when editing
    useEffect(() => {
        if (editCustomer) {
            setEditMode(true);
            setFormData({
                username: editCustomer.username || '',
                first_name: editCustomer.first_name || '',
                last_name: editCustomer.last_name || '',
                email: editCustomer.email || '',
                phone_num: editCustomer.phone_num || '',
                status: editCustomer.status || 'active',
                status_reason: editCustomer.status_reason || ''
            });
        } else {
            resetForm();
        }
    }, [editCustomer]);

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Clear any error for this field
        if (formErrors[name]) {
            setFormErrors({ ...formErrors, [name]: null });
        }
    };

    // Validate form
    const validateForm = () => {
        const errors = {};

        if (!formData.username.trim()) {
            errors.username = 'Username is required';
        } else if (formData.username.includes(' ')) {
            errors.username = 'Username cannot contain spaces';
        }

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email is invalid';
        }

        if (formData.status !== 'active' && !formData.status_reason.trim()) {
            errors.status_reason = 'Reason is required when status is not active';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Reset form
    const resetForm = () => {
        const hasData = formData.username ||
            formData.first_name ||
            formData.last_name ||
            formData.email ||
            formData.phone_num;

        if (hasData && !isSubmitting) {
            setShowResetConfirm(true);
            return;
        }

        performReset();
    };

    const performReset = () => {
        setFormData({
            username: '',
            first_name: '',
            last_name: '',
            email: '',
            phone_num: '',
            status: 'active',
            status_reason: ''
        });
        setFormErrors({});
        setEditMode(false);
        setShowResetConfirm(false);
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
            // For edit mode, update existing customer
            if (editMode && editCustomer) {
                const response = await customerService.updateCustomer(
                    editCustomer.user_id,
                    formData,
                    token
                );

                if (response.success) {
                    toast.success('Customer updated successfully');
                    if (onSuccess) {
                        onSuccess(response.customer);
                    }
                } else {
                    toast.error(response.message || 'Failed to update customer');
                }
            } else {
                // For new customer, you would typically handle this differently
                // This would be a registration process or admin creating a new account
                toast.info('Creating new customers should be done through the registration process');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'An error occurred');
            console.error('Error submitting customer data:', error);
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
                {editMode ? 'Edit Customer' : 'Add New Customer'}
                {editMode && editCustomer && (
                    <span className="ml-2 text-sm text-gray-500">ID: {editCustomer.user_id}</span>
                )}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Account Information */}
                <div className="space-y-4">
                    <h4 className="text-lg font-medium">Account Information</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Username*
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiUser className="text-gray-400" />
                                </div>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className={`w-full pl-10 pr-3 py-2 border ${formErrors.username ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 ${formErrors.username ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                                    placeholder="Username"
                                    disabled={editMode} // Username typically can't be changed
                                />
                            </div>
                            {renderError(formErrors.username)}
                            {editMode && (
                                <p className="text-xs text-gray-500">Username cannot be changed</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email*
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiMail className="text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`w-full pl-10 pr-3 py-2 border ${formErrors.email ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 ${formErrors.email ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                                    placeholder="Email address"
                                />
                            </div>
                            {renderError(formErrors.email)}
                        </div>
                    </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-4">
                    <h4 className="text-lg font-medium">Personal Information</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                                First Name
                            </label>
                            <input
                                id="first_name"
                                name="first_name"
                                type="text"
                                value={formData.first_name}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="First name"
                            />
                            {renderError(formErrors.first_name)}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                                Last Name
                            </label>
                            <input
                                id="last_name"
                                name="last_name"
                                type="text"
                                value={formData.last_name}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Last name"
                            />
                            {renderError(formErrors.last_name)}
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                    <h4 className="text-lg font-medium">Contact Information</h4>

                    <div className="space-y-2">
                        <label htmlFor="phone_num" className="block text-sm font-medium text-gray-700">
                            Phone Number
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiPhone className="text-gray-400" />
                            </div>
                            <input
                                id="phone_num"
                                name="phone_num"
                                type="text"
                                value={formData.phone_num}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Phone number"
                            />
                        </div>
                        {renderError(formErrors.phone_num)}
                    </div>
                </div>

                {/* Account Status */}
                <div className="space-y-4">
                    <h4 className="text-lg font-medium">Account Status</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Status
                            </label>
                            <div className="px-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-gray-700">
                                {formData.status === 'active' ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Active
                                    </span>
                                ) : formData.status === 'suspended' ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Suspended
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Banned
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Status Reason
                            </label>
                            <div className="px-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-gray-700 min-h-[72px] overflow-auto">
                                {formData.status_reason ? (
                                    formData.status_reason
                                ) : (
                                    <span className="text-gray-400 italic">No reason provided</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
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
                                {editMode ? 'Updating...' : 'Saving...'}
                            </>
                        ) : (
                            <>
                                <FiSave className="mr-2" />
                                {editMode ? 'Update Customer' : 'Add Customer'}
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Confirmation Modal */}
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

export default CustomerForm;

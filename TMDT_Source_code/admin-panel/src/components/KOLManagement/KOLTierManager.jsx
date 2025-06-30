import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import DeleteConfirmationModal from '../DeleteConfirm';
import kolTierService from '../../services/kolTierService';

const KOLTierManager = () => {
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingTier, setEditingTier] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        tier_name: '',
        commission_rate: '',
        min_successful_purchases: ''
    });

    // Delete confirmation modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [tierToDelete, setTierToDelete] = useState(null);

    // Form errors state
    const [formErrors, setFormErrors] = useState({});

    // Fetch tiers on component mount
    useEffect(() => {
        fetchTiers();
    }, []);

    // Fetch tiers from API
    const fetchTiers = async () => {
        try {
            setLoading(true);
            const response = await kolTierService.getTiers();
            if (response.success) {
                setTiers(response.data);
            } else {
                toast.error(response.message || 'Failed to load tiers');
            }
        } catch (error) {
            console.error('Error fetching tiers:', error);
            toast.error(error.message || 'Failed to load tiers');
        } finally {
            setLoading(false);
        }
    };

    // Validate form
    const validateForm = () => {
        const errors = {};
        if (!formData.tier_name.trim()) {
            errors.tier_name = 'Tier name is required';
        }

        const commission = parseFloat(formData.commission_rate);
        if (isNaN(commission) || commission < 0 || commission > 100) {
            errors.commission_rate = 'Commission rate must be between 0 and 100';
        }

        const purchases = parseInt(formData.min_successful_purchases);
        if (isNaN(purchases) || purchases < 0) {
            errors.min_successful_purchases = 'Minimum purchases must be a positive number';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form submission for adding/editing a tier
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the form errors');
            return;
        }

        setLoading(true);

        try {
            const tierData = {
                tier_name: formData.tier_name.trim(),
                commission_rate: parseFloat(formData.commission_rate),
                min_successful_purchases: parseInt(formData.min_successful_purchases)
            };

            let response;
            if (editingTier) {
                response = await kolTierService.updateTier(editingTier.tier_id, tierData);
            } else {
                response = await kolTierService.createTier(tierData);
            }

            if (response.success) {
                toast.success(response.message);
                fetchTiers();
                resetForm();
            } else {
                toast.error(response.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Error saving tier:', error);
            toast.error(error.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Handle editing a tier
    const handleEdit = (tier) => {
        setEditingTier(tier);
        setFormData({
            tier_name: tier.tier_name,
            commission_rate: tier.commission_rate.toString(),
            min_successful_purchases: tier.min_successful_purchases.toString()
        });
        setFormErrors({});
    };

    // Reset form
    const resetForm = () => {
        setEditingTier(null);
        setFormData({
            tier_name: '',
            commission_rate: '',
            min_successful_purchases: ''
        });
        setFormErrors({});
    };

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    // Handle deleting a tier
    const handleDeleteClick = (tier) => {
        setTierToDelete(tier);
        setIsDeleteModalOpen(true);
    };

    // Confirm tier deletion
    const confirmDelete = async () => {
        if (!tierToDelete) return;

        setLoading(true);
        try {
            const response = await kolTierService.deleteTier(tierToDelete.tier_id);

            if (response.success) {
                toast.success(response.message);
                fetchTiers();
            } else {
                toast.error(response.message || 'Failed to delete tier');
            }
        } catch (error) {
            console.error('Error deleting tier:', error);
            toast.error(error.message || 'An error occurred');
        } finally {
            setLoading(false);
            setIsDeleteModalOpen(false);
            setTierToDelete(null);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Tier Form */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4">
                    {editingTier ? 'Edit Tier' : 'Add New Tier'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="tier_name" className="block text-sm font-medium text-gray-700 mb-1">
                            Tier Name*
                        </label>
                        <input
                            id="tier_name"
                            name="tier_name"
                            type="text"
                            value={formData.tier_name}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border ${formErrors.tier_name ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            placeholder="Enter tier name"
                            disabled={loading}
                        />
                        {formErrors.tier_name && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.tier_name}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="commission_rate" className="block text-sm font-medium text-gray-700 mb-1">
                            Commission Rate (%)*
                        </label>
                        <input
                            id="commission_rate"
                            name="commission_rate"
                            type="number"
                            value={formData.commission_rate}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border ${formErrors.commission_rate ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            placeholder="Enter commission rate percentage"
                            min="0"
                            max="100"
                            step="0.1"
                            disabled={loading}
                        />
                        {formErrors.commission_rate && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.commission_rate}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="min_successful_purchases" className="block text-sm font-medium text-gray-700 mb-1">
                            Minimum Successful Purchases*
                        </label>
                        <input
                            id="min_successful_purchases"
                            name="min_successful_purchases"
                            type="number"
                            value={formData.min_successful_purchases}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border ${formErrors.min_successful_purchases ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            placeholder="Minimum purchases required"
                            min="0"
                            disabled={loading}
                        />
                        {formErrors.min_successful_purchases && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.min_successful_purchases}</p>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                        {editingTier && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
                                disabled={loading}
                            >
                                <FiX className="mr-2" /> Cancel
                            </button>
                        )}

                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:bg-blue-300"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                                    {editingTier ? 'Updating...' : 'Adding...'}
                                </>
                            ) : (
                                <>
                                    <FiSave className="mr-2" />
                                    {editingTier ? 'Update Tier' : 'Add Tier'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Tiers List */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold mb-4">KOL Tiers</h3>

                <div className="border rounded-md overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 font-medium border-b grid grid-cols-12">
                        <div className="col-span-1 w-12">ID</div>
                        <div className="col-span-3">Name</div>
                        <div className="col-span-3">Commission</div>
                        <div className="col-span-3">Min. Purchases</div>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>

                    <div className="divide-y max-h-96 overflow-y-auto">
                        {loading && tiers.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                Loading tiers...
                            </div>
                        ) : tiers.length > 0 ? (
                            tiers.map((tier) => (
                                <div key={tier.tier_id} className="grid grid-cols-12 p-3 hover:bg-gray-50 items-center">
                                    <div className="col-span-1 text-gray-500">{tier.tier_id}</div>
                                    <div className="col-span-3 font-medium">{tier.tier_name}</div>
                                    <div className="col-span-3 text-center">{tier.commission_rate}%</div>
                                    <div className="col-span-3 text-center">{tier.min_successful_purchases}</div>
                                    <div className="col-span-2 flex justify-end space-x-2">
                                        <button
                                            onClick={() => handleEdit(tier)}
                                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                            title="Edit tier"
                                            disabled={loading}
                                        >
                                            <FiEdit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(tier)}
                                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                                            title="Delete tier"
                                            disabled={loading}
                                        >
                                            <FiTrash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-gray-500">
                                No tiers found. Add your first tier.
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-4 bg-blue-50 p-3 rounded-md border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-1">About KOL Tiers</h4>
                    <p className="text-sm text-blue-700">
                        Tiers determine the commission rates for KOLs based on their performance.
                        Higher tiers offer better commission rates but require more successful purchases.
                    </p>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                itemName={tierToDelete?.tier_name || ''}
                itemType="tier"
            />
        </div>
    );
};

export default KOLTierManager;
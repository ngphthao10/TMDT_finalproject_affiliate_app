import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName, itemType }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div
                className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center text-red-500 mb-4">
                    <FiAlertTriangle className="mr-2" size={24} />
                    <h3 className="text-xl font-bold">Confirm Delete</h3>
                </div>

                <div className="mb-6">
                    <p className="text-gray-700 mb-3">
                        Are you sure you want to delete the {itemType}:
                    </p>
                    <p className="font-semibold text-gray-900 p-2 bg-gray-100 rounded border border-gray-200">
                        {itemName}
                    </p>
                    <p className="text-gray-600 mt-3 text-sm">
                        This action cannot be undone.
                    </p>
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
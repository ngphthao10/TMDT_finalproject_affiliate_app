import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div className="flex items-center space-x-3">
                        <FiAlertTriangle className="text-yellow-500 text-2xl" />
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <FiX size={24} />
                    </button>
                </div>

                <div className="px-6 py-4">
                    <p className="text-gray-600">{message}</p>
                </div>

                <div className="border-t px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                        Reset Form
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
// StatusChangeModal.jsx
import React, { useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

const StatusChangeModal = ({ isOpen, onClose, onConfirm, kol, newStatus }) => {
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (newStatus !== 'active' && !reason.trim()) {
            return;
        }
        setIsSubmitting(true);
        await onConfirm(reason);
        setIsSubmitting(false);
        setReason('');
    };

    const getTitle = () => {
        switch (newStatus) {
            case 'active':
                return 'Activate KOL Account';
            case 'suspended':
                return 'Suspend KOL Account';
            case 'banned':
                return 'Ban KOL Account';
            default:
                return 'Change KOL Status';
        }
    };

    const getDescription = () => {
        const name = `${kol.user?.first_name} ${kol.user?.last_name} (${kol.user?.username})`;
        switch (newStatus) {
            case 'active':
                return `Are you sure you want to activate ${name}'s account?`;
            case 'suspended':
                return `Are you sure you want to suspend ${name}'s account?`;
            case 'banned':
                return `Are you sure you want to ban ${name}'s account?`;
            default:
                return `Are you sure you want to change ${name}'s status?`;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full 
                            ${newStatus === 'active' ? 'bg-green-100' :
                                newStatus === 'suspended' ? 'bg-yellow-100' : 'bg-red-100'}`}>
                            <FiAlertTriangle className={`
                                ${newStatus === 'active' ? 'text-green-600' :
                                    newStatus === 'suspended' ? 'text-yellow-600' : 'text-red-600'}`}
                                size={20}
                            />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">{getTitle()}</h3>
                    </div>
                </div>

                <div className="px-6 py-4">
                    <p className="text-sm text-gray-500 mb-4">{getDescription()}</p>

                    {newStatus !== 'active' && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason*
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                placeholder="Please provide a reason for this action"
                            />
                            {newStatus !== 'active' && !reason.trim() && (
                                <p className="mt-1 text-xs text-red-500">Reason is required</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || (newStatus !== 'active' && !reason.trim())}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-md
                            ${newStatus === 'active'
                                ? 'bg-green-600 hover:bg-green-700'
                                : newStatus === 'suspended'
                                    ? 'bg-yellow-600 hover:bg-yellow-700'
                                    : 'bg-red-600 hover:bg-red-700'} 
                            disabled:opacity-50`}
                    >
                        {isSubmitting ? 'Processing...' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StatusChangeModal;
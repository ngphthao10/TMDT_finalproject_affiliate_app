import React, { useState } from 'react';
import { FiX, FiAlertTriangle, FiUserCheck, FiUserX, FiXOctagon } from 'react-icons/fi';

const StatusChangeModal = ({ isOpen, onClose, onConfirm, customerName, action }) => {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    // Reset form when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setReason('');
            setError('');
        }
    }, [isOpen]);

    // Get title and icon based on action
    const getActionConfig = () => {
        switch (action) {
            case 'activate':
                return {
                    title: 'Activate Customer Account',
                    icon: <FiUserCheck className="text-green-500 text-2xl" />,
                    buttonClass: 'bg-green-600 hover:bg-green-700',
                    buttonText: 'Activate Account'
                };
            case 'suspend':
                return {
                    title: 'Suspend Customer Account',
                    icon: <FiUserX className="text-yellow-500 text-2xl" />,
                    buttonClass: 'bg-yellow-600 hover:bg-yellow-700',
                    buttonText: 'Suspend Account'
                };
            case 'ban':
                return {
                    title: 'Ban Customer Account',
                    icon: <FiXOctagon className="text-red-500 text-2xl" />,
                    buttonClass: 'bg-red-600 hover:bg-red-700',
                    buttonText: 'Ban Account'
                };
            default:
                return {
                    title: 'Change Account Status',
                    icon: <FiAlertTriangle className="text-blue-500 text-2xl" />,
                    buttonClass: 'bg-blue-600 hover:bg-blue-700',
                    buttonText: 'Confirm'
                };
        }
    };

    const actionConfig = getActionConfig();

    // Handle form submit
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate reason for suspend and ban actions
        if ((action === 'suspend' || action === 'ban') && !reason.trim()) {
            setError('Please provide a reason for this action');
            return;
        }

        onConfirm(reason);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div className="flex items-center space-x-3">
                        {actionConfig.icon}
                        <h3 className="text-lg font-semibold text-gray-900">{actionConfig.title}</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <FiX size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="px-6 py-4">
                        <p className="text-gray-700 mb-4">
                            {action === 'activate'
                                ? `Are you sure you want to activate the account for ${customerName}?`
                                : action === 'suspend'
                                    ? `Are you sure you want to suspend the account for ${customerName}?`
                                    : `Are you sure you want to ban the account for ${customerName}?`
                            }
                        </p>

                        {(action === 'suspend' || action === 'ban') && (
                            <div className="mt-4">
                                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="reason"
                                    value={reason}
                                    onChange={(e) => {
                                        setReason(e.target.value);
                                        if (error) setError('');
                                    }}
                                    rows={3}
                                    className={`w-full px-3 py-2 border ${error ? 'border-red-300' : 'border-gray-300'} rounded-md focus:outline-none`}
                                    placeholder="Please provide a reason for this action"
                                />
                                {error && (
                                    <p className="mt-1 text-sm text-red-600">{error}</p>
                                )}
                            </div>
                        )}

                        {action === 'activate' && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                                <p className="text-sm text-green-800">
                                    This will restore full access to the customer's account.
                                </p>
                            </div>
                        )}

                        {action === 'suspend' && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                <p className="text-sm text-yellow-800">
                                    This will temporarily restrict the customer's ability to place orders or modify their account.
                                </p>
                            </div>
                        )}

                        {action === 'ban' && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm text-red-800">
                                    This will permanently restrict the customer's account. This action should only be taken for serious violations.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="border-t px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`px-4 py-2 text-white ${actionConfig.buttonClass} rounded-md`}
                        >
                            {actionConfig.buttonText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StatusChangeModal;
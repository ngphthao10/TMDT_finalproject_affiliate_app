import React, { useState, useEffect } from 'react';
import { FiFileText, FiRefreshCw, FiDownload, FiCalendar } from 'react-icons/fi';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { toast } from 'react-toastify';
import kolPayoutService from '../services/kolPayoutService';
import { currency } from '../App';

const StatsCard = ({ title, value, borderColor = 'border-t-blue-500' }) => (
    <div className={`bg-white rounded-lg border border-t-4 ${borderColor} border-gray-200 p-4`}>
        <div className="flex flex-col mb-2 mt-2">
            <div className="flex justify-between items-center">
                <h3 className="text-gray-500 text-sm">{title}</h3>
                <span className="text-l font-bold">{value}</span>
            </div>
        </div>
    </div>
);

const KOLPayout = ({ influencerId }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [payouts, setPayouts] = useState([]);
    const [payoutStats, setPayoutStats] = useState({
        total: 0,
        paid: 0,
        pending: 0
    });
    const [salesStats, setSalesStats] = useState({
        total_orders: 0,
        total_amount: 0,
        commission_earned: 0,
        clicks: 0
    });
    const [startDate, setStartDate] = useState(dayjs().subtract(90, 'days'));
    const [endDate, setEndDate] = useState(dayjs());
    const [isPayoutDetailsOpen, setIsPayoutDetailsOpen] = useState(false);
    const [selectedPayout, setSelectedPayout] = useState(null);
    const [payoutDetails, setPayoutDetails] = useState(null);

    useEffect(() => {
        if (influencerId) {
            fetchPayouts();
            fetchSalesStats();
        }
    }, [influencerId]);

    const fetchPayouts = async () => {
        if (!influencerId) return;

        try {
            setIsLoading(true);
            const response = await kolPayoutService.getInfluencerPayouts({
                start_date: startDate.format('YYYY-MM-DD'),
                end_date: endDate.format('YYYY-MM-DD')
            });

            if (response.success) {
                setPayouts(response.payouts || []);

                // Calculate stats
                const totalAmount = response.payouts.reduce((sum, p) => sum + parseFloat(p.total_amount), 0);
                const paidAmount = response.payouts
                    .filter(p => p.payment_status === 'completed')
                    .reduce((sum, p) => sum + parseFloat(p.total_amount), 0);
                const pendingAmount = response.payouts
                    .filter(p => p.payment_status === 'pending')
                    .reduce((sum, p) => sum + parseFloat(p.total_amount), 0);

                setPayoutStats({
                    total: totalAmount,
                    paid: paidAmount,
                    pending: pendingAmount
                });
            } else {
                toast.error(response.message || 'Failed to fetch payouts');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error(error.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSalesStats = async () => {
        if (!influencerId) return;

        try {
            const response = await kolPayoutService.getInfluencerSalesStats({
                influencer_id: influencerId,
                start_date: startDate.format('YYYY-MM-DD'),
                end_date: endDate.format('YYYY-MM-DD')
            });

            if (response.success) {
                setSalesStats(response.stats || {
                    total_orders: 0,
                    total_amount: 0,
                    commission_earned: 0,
                    clicks: 0
                });
            }
        } catch (error) {
            console.error('Stats error:', error);
        }
    };

    const handleViewPayoutDetails = async (payout) => {
        try {
            setSelectedPayout(payout);
            setIsPayoutDetailsOpen(true);
            setPayoutDetails(null);

            const response = await kolPayoutService.getInfluencerPayoutDetails(payout.payout_id);

            if (response.success) {
                setPayoutDetails(response.payout);
            } else {
                toast.error(response.message || 'Failed to fetch payout details');
            }
        } catch (error) {
            console.error('Details error:', error);
            toast.error(error.message || 'Failed to fetch payout details');
        }
    };

    const handleDateFilterChange = () => {
        fetchPayouts();
        fetchSalesStats();
    };

    const setDateRange = (days) => {
        const end = dayjs();
        const start = dayjs().subtract(days, 'day');
        setEndDate(end);
        setStartDate(start);
        setTimeout(() => {
            fetchPayouts();
            fetchSalesStats();
        }, 100);
    };

    // Format currency
    const formatCurrency = (amount) => {
        return `${currency} ${parseFloat(amount).toFixed(2)}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header & Controls */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-grow">
                        <h3 className="text-xl text-left font-bold text-gray-800">My Earnings</h3>
                        <p className=" text-left text-gray-600">Track your commission earnings and payment history</p>
                    </div>

                    {/* Date Range Controls */}
                    <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600 flex items-center">
                                <FiCalendar className="mr-1" /> From:
                            </span>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    value={startDate}
                                    onChange={setStartDate}
                                    slotProps={{ textField: { size: 'small' }, field: { format: 'DD/MM/YYYY' } }}
                                />
                            </LocalizationProvider>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-gray-600">To:</span>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    value={endDate}
                                    onChange={setEndDate}
                                    minDate={startDate}
                                    slotProps={{ textField: { size: 'small' }, field: { format: 'DD/MM/YYYY' } }}
                                />
                            </LocalizationProvider>
                        </div>

                        <button
                            onClick={handleDateFilterChange}
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                            Apply
                        </button>
                    </div>

                    {/* Quick Date Selection */}
                    <div className="w-full md:w-auto flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => setDateRange(7)}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
                        >
                            Last 7 days
                        </button>
                        <button
                            onClick={() => setDateRange(30)}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
                        >
                            Last 30 days
                        </button>
                        <button
                            onClick={() => setDateRange(90)}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
                        >
                            Last 90 days
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDateFilterChange}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            disabled={isLoading}
                            title="Refresh data"
                        >
                            <FiRefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
                        </button>
                    </div>
                </div>

                {/* Payouts Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg text-left font-semibold text-gray-800">Payment History</h2>

                        <button
                            onClick={fetchPayouts}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Refresh"
                        >
                            <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="text-center py-10">
                                <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-red-600 rounded-full mb-4"></div>
                                <p className="text-gray-600">Loading payment history...</p>
                            </div>
                        ) : !influencerId ? (
                            <div className="text-center py-10">
                                <p className="text-gray-600">Please log in as an influencer to view your payment history.</p>
                            </div>
                        ) : payouts.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-gray-600">No payment records found for the selected period.</p>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Payment ID
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {payouts.map((payout) => (
                                        <tr key={payout.payout_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-left whitespace-nowrap text-sm text-gray-900">
                                                #{payout.payout_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {formatCurrency(payout.total_amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${payout.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    payout.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                    {payout.payment_status.charAt(0).toUpperCase() + payout.payment_status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {dayjs(payout.payout_date).format('YYYY-MM-DD')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleViewPayoutDetails(payout)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Payout Details Modal */}
                <Dialog
                    open={isPayoutDetailsOpen}
                    onClose={() => setIsPayoutDetailsOpen(false)}
                    maxWidth="lg"
                    fullWidth
                >
                    <DialogTitle>Payment Details</DialogTitle>
                    <DialogContent>
                        {!payoutDetails ? (
                            <div className="text-center py-10">
                                <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-red-600 rounded-full mb-4"></div>
                                <p className="text-gray-600">Loading details...</p>
                            </div>
                        ) : (
                            <div className="space-y-6 mt-2">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Payment ID</p>
                                            <p className="font-medium">#{payoutDetails.payout_id}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Amount</p>
                                            <p className="font-medium">{formatCurrency(payoutDetails.total_amount)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Status</p>
                                            <p>
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${payoutDetails.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    payoutDetails.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                    {payoutDetails.payment_status.charAt(0).toUpperCase() + payoutDetails.payment_status.slice(1)}
                                                </span>
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Payment Date</p>
                                            <p className="font-medium">{dayjs(payoutDetails.payout_date).format('YYYY-MM-DD')}</p>
                                        </div>
                                    </div>
                                    {payoutDetails.notes && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <p className="text-sm text-gray-500">Notes</p>
                                            <p>{payoutDetails.notes}</p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-gray-700 font-medium mb-2">Sales Contributing to This Payment</h3>
                                    {payoutDetails.related_orders?.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sale Amount</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {payoutDetails.related_orders.map(order => (
                                                        <tr key={order.order_id}>
                                                            <td className="px-4 py-2 whitespace-nowrap text-sm">#{order.order_id}</td>
                                                            <td className="px-4 py-2 text-sm">{order.product_name || 'Multiple Items'}</td>
                                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{formatCurrency(order.total)}</td>
                                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{formatCurrency(order.commission.total)}</td>
                                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{dayjs(order.creation_at).format('YYYY-MM-DD')}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm">No related orders information available.</p>
                                    )}
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="text-blue-700 font-medium mb-2">Payment Information</h3>
                                    <p className="text-sm">
                                        {payoutDetails.payment_status === 'completed' ? (
                                            <span>This payment was processed on {dayjs(payoutDetails.modified_at).format('YYYY-MM-DD')}.</span>
                                        ) : payoutDetails.payment_status === 'pending' ? (
                                            <span>This payment is currently being processed and should be completed within 5-7 business days.</span>
                                        ) : (
                                            <span>This payment could not be processed. Please contact support for assistance.</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <button
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                            onClick={() => setIsPayoutDetailsOpen(false)}
                        >
                            Close
                        </button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    );
};

export default KOLPayout;
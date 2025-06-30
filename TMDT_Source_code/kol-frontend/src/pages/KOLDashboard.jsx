import React, { useState, useEffect } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { backendUrl, currency } from '../App';


const StatsCard = ({ title, value }) => (
    <div className="bg-white rounded-lg border border-t-4 border-t-red-500 border-gray-200 p-4">
        <div className="flex flex-col mb-2 mt-2">
            <div className="flex justify-between items-center">
                <h3 className="text-gray-500 text-sm">{title}</h3>
                <span className="text-l font-bold">{value}</span>
            </div>
        </div>
    </div>
);

const KOLDashboard = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [stats, setStats] = useState({
        clicks: 0,
        total_orders: 0,
        total_quantity: 0,
        estimated_commission: 0,
        tier_name: '',
        tier_commission_rate: 0,
        top_products: []
    });

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(
                `${backendUrl}/api/kol-stats/dashboard/${user.influencer_id}?startDate=${startDate}&endDate=${endDate}`, {
                headers: { token: localStorage.getItem('token') }
            });
            const data = await response.json();

            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [startDate, endDate]);

    const handleRefresh = () => {
        fetchStats();
    };

    const setDateRange = (days) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);

        setEndDate(end.toISOString().split('T')[0]);
        setStartDate(start.toISOString().split('T')[0]);
    };

    const formatCurrency = (value) => {
        return `${currency} ${parseFloat(value).toFixed(2)}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Date filters */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-grow">
                        <h3 className="text-xl text-left font-bold text-gray-800">Data Period</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600">From :</span>
                            <input
                                type="date"
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-gray-600">To:</span>
                            <input
                                type="date"
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setDateRange(7)}
                                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
                            >
                                Last 7 days
                            </button>
                            <button
                                onClick={() => setDateRange(15)}
                                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
                            >
                                Last 15 days
                            </button>
                            <button
                                onClick={() => setDateRange(30)}
                                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
                            >
                                Last 30 days
                            </button>
                        </div>

                        <button
                            onClick={handleRefresh}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            disabled={isLoading}
                        >
                            <FiRefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
                        </button>
                    </div>
                </div>

                {/* Tier Information */}
                {stats.tier_name && (
                    <div className="bg-white rounded-lg p-4 shadow">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg text-left font-semibold text-gray-800">Your Tier: <span className="text-red-500">{stats.tier_name}</span></h3>
                                <p className="text-sm text-gray-600">Commission Rate Bonus: {stats.tier_commission_rate}%</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="Clicks"
                        value={stats.clicks}
                    />
                    <StatsCard
                        title="Orders"
                        value={stats.total_orders}
                    />
                    <StatsCard
                        title="Est. Commission"
                        value={formatCurrency(stats.estimated_commission)}
                    />
                    <StatsCard
                        title="Items Sold"
                        value={stats.total_quantity}
                    />
                </div>


                {/* Top Products */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg text-left font-semibold text-gray-800">My Top 5 Products</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Items Sold
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Revenue
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Commission
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Commission Rate
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {stats.top_products && stats.top_products.length > 0 ? (
                                    stats.top_products.map((product) => (
                                        <tr key={product.product_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-3">
                                                    {product.small_image && (
                                                        <img
                                                            crossOrigin="anonymous"
                                                            src={product.small_image
                                                                ? `${backendUrl}${product.small_image}`
                                                                : `${backendUrl}/products/default_image.jpg`
                                                            }
                                                            alt={product.name}
                                                            className="h-10 w-10 object-cover rounded-md"
                                                        />
                                                    )}
                                                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-center text-gray-900">{product.total_sold}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-center text-gray-900">{formatCurrency(product.total_revenue)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-center text-gray-900">{formatCurrency(product.commission)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-center text-gray-900">{product.commission_rate}% + {stats.tier_commission_rate}%</div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td className="px-6 py-4" colSpan="5">
                                            <div className="text-center text-gray-500">No data</div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KOLDashboard;
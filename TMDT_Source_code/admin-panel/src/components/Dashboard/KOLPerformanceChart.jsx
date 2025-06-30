import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiDollarSign } from 'react-icons/fi';
import { LuMousePointer2, LuShoppingCart, LuUser } from "react-icons/lu";
import dashboardService from '../../services/dashboardService';

const KOLPerformanceChart = ({ dateRange }) => {
    const [sortBy, setSortBy] = useState('commission');
    const [kolData, setKolData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchKOLData = async () => {
            try {
                setLoading(true);
                const response = await dashboardService.getKOLPerformance(
                    dateRange[0].toISOString(),
                    dateRange[1].toISOString(),
                    sortBy
                );

                if (response.success) {
                    setKolData(response.data);
                } else {
                    setError(response.message || 'Failed to fetch KOL performance data');
                }
            } catch (err) {
                setError(err.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (dateRange && dateRange[0] && dateRange[1]) {
            fetchKOLData();
        }
    }, [dateRange, sortBy]);

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <p>Error loading KOL performance data: {error}</p>
            </div>
        );
    }

    if (!kolData) return null;

    // Format tooltip value
    const formatTooltip = (value, name) => {
        if (name === 'Tier Commission' || name === 'Product Commission' || name === 'Total Commission') {
            return [`$${value.toLocaleString()}`, name];
        } else {
            return [value.toLocaleString(), name];
        }
    };

    // Prepare chart data with commission breakdown
    const chartData = kolData.kols.map(kol => ({
        name: kol.name,
        clicks: kol.clicks,
        orders: kol.orders,
        'Product Commission': kol.commission.product,
        'Tier Commission': kol.commission.tier,
        'Total Commission': kol.commission.total
    }));

    // Performance metrics for display
    const metrics = [
        {
            label: 'Total Clicks',
            value: kolData.totals.clicks.toLocaleString(),
            color: 'blue'
        },
        {
            label: 'Total Orders',
            value: kolData.totals.orders.toLocaleString(),
            color: 'purple'
        },
        {
            label: 'Total Com.',
            value: `$${kolData.totals.commission.total.toLocaleString()}`,
            color: 'green'
        },
        {
            label: 'Avg. Convert.',
            value: `${kolData.totals.conversion_rate.toFixed(2)}%`,
            color: 'indigo'
        }
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">KOL Performance</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSortBy('clicks')}
                        className={`px-3 py-1 rounded-md transition-colors ${sortBy === 'clicks'
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        By Clicks
                    </button>
                    <button
                        onClick={() => setSortBy('orders')}
                        className={`px-3 py-1 rounded-md transition-colors ${sortBy === 'orders'
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        By Orders
                    </button>
                    <button
                        onClick={() => setSortBy('commission')}
                        className={`px-3 py-1 rounded-md transition-colors ${sortBy === 'commission'
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        By Commission
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {metrics.map((metric, index) => (
                    <div key={index} className={`rounded-lg p-4 bg-${metric.color}-50`}>
                        <div className="flex items-center gap-2 text-gray-500">
                            <span className="text-sm">{metric.label}</span>
                        </div>
                        <div className="text-xl font-bold text-gray-900 mt-2">
                            {metric.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* KOL Performance Table */}
            <div className="mb-6 overflow-x-auto">
                <div className="bg-gray-50 rounded-lg overflow-hidden min-w-full">
                    <div className="grid grid-cols-5 text-sm font-medium text-gray-500 border-b border-gray-200 bg-gray-100">
                        <div className="p-3">KOL</div>
                        <div className="p-3 text-right">Clicks</div>
                        <div className="p-3 text-right">Orders</div>
                        <div className="p-3 text-right">Conversion</div>
                        <div className="p-3 text-right">Total Comm.</div>
                    </div>
                    {kolData.kols.map((kol, index) => (
                        <div
                            key={kol.id}
                            className="grid grid-cols-5 text-sm border-b border-gray-200 last:border-0 hover:bg-gray-50"
                        >
                            <div className="p-3 font-medium text-gray-900">
                                {index + 1}. {kol.name}
                            </div>
                            <div className="p-3 text-right text-gray-500">
                                {kol.clicks.toLocaleString()}
                            </div>
                            <div className="p-3 text-right text-gray-500">
                                {kol.orders.toLocaleString()}
                            </div>
                            <div className="p-3 text-right text-gray-500">
                                {kol.conversion_rate.toFixed(2)}%
                            </div>
                            <div className="p-3 text-right font-medium text-gray-700">
                                {kol.commission.total.toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="name"
                            stroke="#6b7280"
                            tick={{ fill: '#6b7280' }}
                            tickLine={{ stroke: '#6b7280' }}
                        />
                        <YAxis
                            stroke="#6b7280"
                            tick={{ fill: '#6b7280' }}
                            tickLine={{ stroke: '#6b7280' }}
                        />
                        <Tooltip
                            formatter={formatTooltip}
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.375rem',
                                padding: '0.5rem'
                            }}
                        />
                        <Legend />
                        {sortBy === 'clicks' && (
                            <Bar
                                dataKey="clicks"
                                fill="#6366f1"
                                name="Clicks"
                                radius={[4, 4, 0, 0]}
                            />
                        )}
                        {sortBy === 'orders' && (
                            <Bar
                                dataKey="orders"
                                fill="#8b5cf6"
                                name="Orders"
                                radius={[4, 4, 0, 0]}
                            />
                        )}
                        {sortBy === 'commission' && (
                            <Bar
                                dataKey="Total Commission"
                                fill="#10b981"
                                name="Total Commission"
                                radius={[4, 4, 0, 0]}
                            />
                        )}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default KOLPerformanceChart;
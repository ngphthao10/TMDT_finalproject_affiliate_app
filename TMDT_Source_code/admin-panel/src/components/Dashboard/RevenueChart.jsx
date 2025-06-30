import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import dashboardService from '../../services/dashboardService';

const RevenueChart = ({ token, dateRange }) => {
    const [activeMetric, setActiveMetric] = useState('all');
    const [chartData, setChartData] = useState([]);
    const [metrics, setMetrics] = useState({
        revenue: { total: 0, average: 0, growth: 0 },
        orders: { total: 0, average: 0, growth: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRevenueData = async () => {
            try {
                setLoading(true);
                const response = await dashboardService.getRevenueData(
                    dateRange[0].toISOString(),
                    dateRange[1].toISOString()
                );

                if (response.success && response.data) {
                    // Format the data
                    const formattedData = response.data.map(item => ({
                        date: new Date(item.date).toLocaleDateString(),
                        revenue: parseFloat(item.revenue),
                        orders: parseInt(item.orders)
                    }));

                    setChartData(formattedData);

                    // Calculate metrics
                    const totalRevenue = formattedData.reduce((sum, item) => sum + item.revenue, 0);
                    const totalOrders = formattedData.reduce((sum, item) => sum + item.orders, 0);

                    const avgRevenue = totalRevenue / formattedData.length;
                    const avgOrders = totalOrders / formattedData.length;

                    // Calculate growth
                    const revenueGrowth = formattedData.length > 1
                        ? ((formattedData[formattedData.length - 1].revenue - formattedData[0].revenue)
                            / formattedData[0].revenue) * 100
                        : 0;

                    const ordersGrowth = formattedData.length > 1
                        ? ((formattedData[formattedData.length - 1].orders - formattedData[0].orders)
                            / formattedData[0].orders) * 100
                        : 0;

                    setMetrics({
                        revenue: {
                            total: totalRevenue,
                            average: avgRevenue,
                            growth: revenueGrowth
                        },
                        orders: {
                            total: totalOrders,
                            average: avgOrders,
                            growth: ordersGrowth
                        }
                    });
                }
            } catch (err) {
                setError(err.message || 'Failed to fetch revenue data');
            } finally {
                setLoading(false);
            }
        };

        if (dateRange && dateRange[0] && dateRange[1]) {
            fetchRevenueData();
        }
    }, [dateRange]);

    const formatTooltip = (value, name) => {
        if (name === 'Revenue ($)') {
            return ['$' + value.toLocaleString(), 'Revenue'];
        }
        if (name === 'Orders') {
            return [value.toLocaleString(), 'Orders'];
        }
        // Fallback just in case
        return [value.toLocaleString(), name];
    };

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
                <p>Error loading revenue data: {error}</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveMetric('all')}
                        className={`px-3 py-1 rounded-md transition-colors ${activeMetric === 'all'
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setActiveMetric('revenue')}
                        className={`px-3 py-1 rounded-md transition-colors ${activeMetric === 'revenue'
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Revenue
                    </button>
                    <button
                        onClick={() => setActiveMetric('orders')}
                        className={`px-3 py-1 rounded-md transition-colors ${activeMetric === 'orders'
                            ? 'bg-green-100 text-green-600'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        Orders
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-gray-500 text-sm">Revenue</div>
                    <div className="mt-2 flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {metrics.revenue.total.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">Total</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {metrics.revenue.average.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">Average</div>
                        </div>
                        <div className={`flex items-center ${metrics.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {metrics.revenue.growth >= 0 ? <FiTrendingUp className="mr-1" /> : <FiTrendingDown className="mr-1" />}
                            <span className="font-medium">{Math.abs(metrics.revenue.growth).toFixed(1)}%</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-gray-500 text-sm">Orders</div>
                    <div className="mt-2 flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {metrics.orders.total.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">Total</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {metrics.orders.average.toFixed(1)}
                            </div>
                            <div className="text-sm text-gray-500">Average</div>
                        </div>
                        <div className={`flex items-center ${metrics.orders.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {metrics.orders.growth >= 0 ? <FiTrendingUp className="mr-1" /> : <FiTrendingDown className="mr-1" />}
                            <span className="font-medium">{Math.abs(metrics.orders.growth).toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="date"
                            stroke="#6b7280"
                            tick={{ fill: '#6b7280' }}
                            tickLine={{ stroke: '#6b7280' }}

                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#6b7280"
                            tick={{ fill: '#6b7280' }}
                            tickLine={{ stroke: '#6b7280' }}
                        />
                        <YAxis
                            yAxisId="left"
                            stroke="#6b7280"
                            tick={{ fill: '#6b7280' }}
                            tickLine={{ stroke: '#6b7280' }}
                            tickFormatter={(value) => `$${value.toLocaleString()}`}
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
                        {(activeMetric === 'all' || activeMetric === 'revenue') && (
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="revenue"
                                stroke="#2563eb"
                                strokeWidth={2}
                                dot={{ fill: '#2563eb', strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                                name="Revenue ($)"
                            />
                        )}
                        {(activeMetric === 'all' || activeMetric === 'orders') && (
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="orders"
                                stroke="#16a34a"
                                strokeWidth={2}
                                dot={{ fill: '#16a34a', strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                                name="Orders"
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RevenueChart;

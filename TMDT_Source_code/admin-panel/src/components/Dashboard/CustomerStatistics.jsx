import React, { useState, useEffect } from 'react';
import { FiUsers, FiUserPlus, FiUserCheck, FiShoppingBag, FiTrendingUp, FiRepeat } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import dashboardService from '../../services/dashboardService';

const CustomerStatistics = ({ dateRange }) => {
    const [customerStats, setCustomerStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCustomerStats = async () => {
            try {
                setLoading(true);
                const response = await dashboardService.getCustomerStats(
                    dateRange[0].toISOString(),
                    dateRange[1].toISOString()
                );

                if (response.success) {
                    setCustomerStats(response.data);
                } else {
                    setError(response.message || 'Failed to fetch customer statistics');
                }
            } catch (err) {
                setError(err.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (dateRange && dateRange[0] && dateRange[1]) {
            fetchCustomerStats();
        }
    }, [dateRange]);

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
                <p>Error loading customer statistics: {error}</p>
            </div>
        );
    }

    if (!customerStats) return null;

    const customerGroups = [
        {
            name: 'New Customers',
            value: customerStats.new_customers,
            color: '#3b82f6'
        },
        {
            name: 'Returning Customers',
            value: customerStats.returning_customers,
            color: '#10b981'
        }
    ];

    const metrics = [
        {
            title: 'Total Customers',
            value: customerStats.total_customers.toString(),
            trend: `${customerStats.customer_growth >= 0 ? '+' : ''}${customerStats.customer_growth}%`,
            isPositive: customerStats.customer_growth >= 0,
            icon: FiUsers,
            color: 'blue'
        },
        {
            title: 'New Customers',
            value: customerStats.new_customers.toString(),
            trend: `${customerStats.customer_growth >= 0 ? '+' : ''}${customerStats.customer_growth}%`,
            isPositive: customerStats.customer_growth >= 0,
            icon: FiUserPlus,
            color: 'green'
        },
        {
            title: 'Returning Customers',
            value: customerStats.returning_customers.toString(),
            trend: `${customerStats.retention_rate}%`,
            isPositive: true,
            icon: FiUserCheck,
            color: 'purple'
        },
        {
            title: 'Average Order Value',
            value: `$${parseFloat(customerStats.average_order_value).toFixed(2)}`,
            trend: `${customerStats.customer_growth >= 0 ? '+' : ''}${customerStats.customer_growth}%`,
            isPositive: customerStats.customer_growth >= 0,
            icon: FiShoppingBag,
            color: 'indigo'
        }
    ];

    const insights = [
        {
            title: 'Customer Retention Rate',
            value: `${customerStats.insights.retention_rate}%`,
            description: 'Percentage of customers who made repeat purchases',
            icon: FiRepeat,
            color: 'blue',
            trend: `${parseFloat(customerStats.insights.retention_rate) >= 0 ? '+' : ''}${customerStats.insights.retention_rate}%`
        },
        {
            title: 'Customer Growth Rate',
            value: `${customerStats.insights.growth_rate}%`,
            description: 'Month-over-month growth in customer base',
            icon: FiTrendingUp,
            color: 'green',
            trend: `${parseFloat(customerStats.insights.growth_rate) >= 0 ? '+' : ''}${customerStats.insights.growth_rate}%`
        }
    ];

    // Custom tooltip for pie chart
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 border border-gray-200 rounded-md shadow-sm">
                    <p className="text-sm font-medium">{payload[0].name}</p>
                    <p className="text-sm text-gray-600">
                        {payload[0].value} customers ({((payload[0].value / customerStats.total_customers) * 100).toFixed(1)}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Customer Statistics</h2>
                    <p className="text-sm text-gray-500 mt-1">Overview of customer base and behavior</p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {metrics.map((metric, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div className={`p-2 rounded-lg bg-${metric.color}-50`}>
                                <metric.icon className={`w-6 h-6 text-${metric.color}-500`} />
                            </div>
                            <span className={`text-sm font-medium ${metric.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                {metric.trend}
                            </span>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-sm text-gray-500">{metric.title}</h3>
                            <p className="mt-1 text-2xl font-bold text-gray-900">{metric.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart and Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-4">Customer Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={customerGroups}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={95}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {customerGroups.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    formatter={(value, entry, index) => (
                                        <span className="text-sm text-gray-600">{value}</span>
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Customer Insights */}
                <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-4">Customer Insights</h3>
                    <div className="space-y-4">
                        {insights.map((insight, index) => (
                            <div
                                key={index}
                                className={`flex items-center justify-between p-4 bg-${insight.color}-50 rounded-lg`}
                            >
                                <div className="flex-1">
                                    <p className={`text-sm font-medium text-${insight.color}-700`}>{insight.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className={`text-2xl font-bold text-${insight.color}-900`}>{insight.value}</p>
                                        <span className="text-sm text-green-600">({insight.trend})</span>
                                    </div>
                                    <p className={`text-sm text-${insight.color}-600 mt-1`}>{insight.description}</p>
                                </div>
                                <div className={`w-16 h-16 flex items-center justify-center rounded-full bg-${insight.color}-100`}>
                                    <insight.icon className={`w-8 h-8 text-${insight.color}-500`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerStatistics;
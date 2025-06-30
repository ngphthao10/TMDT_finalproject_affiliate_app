import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiShoppingCart, FiDollarSign, FiBarChart2 } from 'react-icons/fi';
import dashboardService from '../../services/dashboardService';

const DashboardStats = ({ token, dateRange }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await dashboardService.getDashboardStats(
                    dateRange[0].toISOString(),
                    dateRange[1].toISOString()
                );

                if (response.success) {
                    setStats(response.data);
                } else {
                    setError(response.message || 'Failed to fetch stats');
                }
            } catch (err) {
                setError(err.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (dateRange && dateRange[0] && dateRange[1]) {
            fetchStats();
        }
    }, [dateRange]);

    const formatNumber = (value, isPercentage = false) => {
        if (typeof value !== 'number') return '0';
        if (isPercentage) return `${value.toFixed(2)}%`;
        return value.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const statsConfig = [
        {
            title: "Total Revenue",
            getValue: (data) => '$' + data.total_revenue || '0',
            getChange: (data) => data.revenue_change,
            icon: FiDollarSign,
            color: "blue"
        },
        {
            title: "Total Orders",
            getValue: (data) => data.total_orders?.toString() || '0',
            getChange: (data) => data.orders_change,
            icon: FiShoppingCart,
            color: "green"
        },
        {
            title: "Average Order Value",
            getValue: (data) => formatNumber(data.avg_order_value),
            getChange: (data) => data.avg_order_change,
            icon: FiBarChart2,
            color: "purple"
        },
        {
            title: "Conversion Rate",
            getValue: (data) => formatNumber(data.conversion_rate, true),
            getChange: (data) => data.conversion_change,
            icon: FiTrendingUp,
            color: "indigo"
        }
    ];

    const getColorClasses = (color) => {
        const classes = {
            blue: "bg-blue-50 text-blue-600",
            green: "bg-green-50 text-green-600",
            purple: "bg-purple-50 text-purple-600",
            indigo: "bg-indigo-50 text-indigo-600"
        };
        return classes[color] || classes.blue;
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                            <div className="h-10 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <p>Error loading dashboard statistics: {error}</p>
            </div>
        );
    }

    if (!stats) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsConfig.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-lg ${getColorClasses(stat.color)}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div className={`text-sm font-medium ${(stat.getChange(stats) >= 0) ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {`${stat.getChange(stats) >= 0 ? '+' : ''}${stat.getChange(stats).toFixed(1)}%`}
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                        <p className="mt-1 text-2xl font-semibold text-gray-900">
                            {stat.getValue(stats)}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DashboardStats;
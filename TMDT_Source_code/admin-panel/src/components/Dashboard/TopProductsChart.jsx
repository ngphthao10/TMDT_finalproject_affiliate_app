import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import dashboardService from '../../services/dashboardService';

const TopProductsChart = ({ token, dateRange }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeMetric, setActiveMetric] = useState('revenue'); // 'revenue' or 'sales'

    useEffect(() => {
        const fetchTopProducts = async () => {
            try {
                setLoading(true);
                const response = await dashboardService.getTopProducts(
                    dateRange[0].toISOString(),
                    dateRange[1].toISOString()
                );

                if (response.success) {
                    setProducts(response.data.map(product => ({
                        ...product,
                        revenue: parseFloat(product.revenue),
                        sales: parseInt(product.sales)
                    })));
                } else {
                    setError(response.message || 'Failed to fetch top products');
                }
            } catch (err) {
                setError(err.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (dateRange && dateRange[0] && dateRange[1]) {
            fetchTopProducts();
        }
    }, [dateRange]);

    const formatTooltip = (value, name, props) => {
        if (name === 'revenue') {
            return [`$${value.toLocaleString()}`, 'Revenue'];
        }
        return [value.toLocaleString(), 'Units Sold'];
    };

    if (loading) {
        return (
            <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <p>Error loading top products: {error}</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setActiveMetric('revenue')}
                        className={`px-3 py-1 rounded-md transition-colors ${activeMetric === 'revenue'
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        By Revenue
                    </button>
                    <button
                        onClick={() => setActiveMetric('sales')}
                        className={`px-3 py-1 rounded-md transition-colors ${activeMetric === 'sales'
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        By Units Sold
                    </button>
                </div>
            </div>

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={products}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis
                            type="number"
                            tickFormatter={value =>
                                activeMetric === 'revenue'
                                    ? `$${value.toLocaleString()}`
                                    : value.toLocaleString()
                            }
                        />
                        <YAxis
                            dataKey="name"
                            type="category"
                            tick={{ fontSize: 12 }}
                            width={90}
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
                        <Bar
                            dataKey={activeMetric}
                            fill={activeMetric === 'revenue' ? '#2563eb' : '#16a34a'}
                            radius={[0, 4, 4, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Product
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Revenue
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Units Sold
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {product.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                    {product.revenue.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                    {product.sales.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TopProductsChart;
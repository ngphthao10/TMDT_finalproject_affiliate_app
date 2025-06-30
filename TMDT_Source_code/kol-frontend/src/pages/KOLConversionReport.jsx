import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiDownload, FiCalendar, FiBarChart2 } from 'react-icons/fi';
import { backendUrl, currency } from '../App';
import * as XLSX from 'xlsx';

const StatsCard = ({ title, value, borderColor = 'border-t-red-500' }) => (
    <div className={`bg-white rounded-lg border border-t-4 ${borderColor} border-gray-200 p-4`}>
        <div className="flex flex-col mb-2 mt-2">
            <div className="flex justify-between items-center">
                <h3 className="text-gray-500 text-sm">{title}</h3>
                <span className="text-l font-bold">{value}</span>
            </div>
        </div>
    </div>
);

const KolReport = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [reportData, setReportData] = useState(null);
    const [groupBy, setGroupBy] = useState('month'); // Default grouping

    const fetchReport = async () => {
        setIsLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await fetch(
                `${backendUrl}/api/kol-report/report/${user.influencer_id}?start_date=${startDate}&end_date=${endDate}&group_by=${groupBy}`, {
                headers: { token: localStorage.getItem('token') }
            });
            const data = await response.json();

            if (data.success) {
                setReportData(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch report:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [startDate, endDate, groupBy]);

    const handleRefresh = () => {
        fetchReport();
    };

    const setDateRange = (days) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);

        setEndDate(end.toISOString().split('T')[0]);
        setStartDate(start.toISOString().split('T')[0]);
    };

    const handleExport = () => {
        if (!reportData) return;

        try {
            // Get current user info
            const user = JSON.parse(localStorage.getItem('user'));
            const currentDateTime = new Date().toLocaleString();
            const periodText = `Period: ${startDate} to ${endDate}`;
            const groupByText = getGroupByDisplay();

            // Create workbook
            const wb = XLSX.utils.book_new();

            // Create worksheet
            const ws = XLSX.utils.aoa_to_sheet([]);

            // Define styles
            const titleStyle = {
                font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "C00000" } }, // Dark red background
                alignment: { horizontal: "center", vertical: "center" }
            };

            const subtitleStyle = {
                font: { bold: true, sz: 12 },
                fill: { fgColor: { rgb: "FDE9D9" } }, // Light orange background
                alignment: { horizontal: "center" }
            };

            const infoStyle = {
                font: { italic: true, sz: 11 },
                fill: { fgColor: { rgb: "FFF2CC" } }, // Light yellow background
                alignment: { horizontal: "left" }
            };

            const headerStyle = {
                font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "C00000" } }, // Dark red background
                alignment: { horizontal: "center", vertical: "center" },
                border: {
                    top: { style: "medium", color: { rgb: "000000" } },
                    bottom: { style: "medium", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } }
                }
            };

            const dataCellStyle = {
                border: {
                    top: { style: "thin", color: { rgb: "C0C0C0" } },
                    bottom: { style: "thin", color: { rgb: "C0C0C0" } },
                    left: { style: "thin", color: { rgb: "C0C0C0" } },
                    right: { style: "thin", color: { rgb: "C0C0C0" } }
                },
                alignment: { horizontal: "right" }
            };

            const dataLeftAlignStyle = {
                ...dataCellStyle,
                alignment: { horizontal: "left" }
            };

            const numberStyle = {
                ...dataCellStyle,
                numFmt: "#,##0"
            };

            const currencyStyle = {
                ...dataCellStyle,
                numFmt: `${currency} #,##0.00`
            };

            const productCommissionStyle = {
                ...currencyStyle,
                font: { color: { rgb: "008000" } } // Green text
            };

            const tierCommissionStyle = {
                ...currencyStyle,
                font: { color: { rgb: "800080" } } // Purple text
            };

            const totalCommissionStyle = {
                ...currencyStyle,
                font: { color: { rgb: "C00000" } } // Red text
            };

            const totalRowStyle = {
                font: { bold: true },
                fill: { fgColor: { rgb: "E6E6E6" } }, // Light gray background
                border: {
                    top: { style: "double", color: { rgb: "000000" } },
                    bottom: { style: "double", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } }
                },
                alignment: { horizontal: "right" }
            };

            const totalRowLeftStyle = {
                ...totalRowStyle,
                alignment: { horizontal: "left" }
            };

            const totalNumberStyle = {
                ...totalRowStyle,
                numFmt: "#,##0"
            };

            const totalCurrencyStyle = {
                ...totalRowStyle,
                numFmt: `${currency} #,##0.00`
            };

            const totalProductCommissionStyle = {
                ...totalCurrencyStyle,
                font: { bold: true, color: { rgb: "008000" } } // Green text
            };

            const totalTierCommissionStyle = {
                ...totalCurrencyStyle,
                font: { bold: true, color: { rgb: "800080" } } // Purple text
            };

            const totalTotalCommissionStyle = {
                ...totalCurrencyStyle,
                font: { bold: true, color: { rgb: "C00000" } } // Red text
            };

            // Create empty worksheet
            const aoa = [];

            // Add report title with styling
            aoa.push([`KOL Commission Report - ${groupByText}`]);
            aoa.push([periodText]);
            aoa.push([`Generated on: ${currentDateTime}`]);
            aoa.push([`Generated by: ${user.name || ''} (${user.email || user.username})`]);
            aoa.push(['']); // Empty row

            // Add column headers
            const labels = getColumnLabels();
            aoa.push([
                labels.period,
                labels.orders,
                labels.revenue,
                labels.productCommission,
                labels.tierCommission,
                labels.totalCommission
            ]);

            // Add data rows
            reportData.details.forEach(item => {
                let periodLabel = item.period;
                if (groupBy === 'product' && item.product_name) {
                    periodLabel = item.product_name;
                } else if (groupBy === 'kol' && item.kol_name) {
                    periodLabel = item.kol_name;
                }

                aoa.push([
                    periodLabel,
                    item.orders_count,
                    item.revenue,
                    item.commission.product,
                    item.commission.tier,
                    item.commission.total
                ]);
            });

            // Add total row
            if (reportData.details.length > 0) {
                aoa.push([
                    'TOTAL',
                    reportData.summary.total_orders,
                    reportData.summary.total_revenue,
                    reportData.summary.commission.product,
                    reportData.summary.commission.tier,
                    reportData.summary.commission.total
                ]);
            } else {
                aoa.push(['No data available for the selected period']);
            }

            // Convert arrays to worksheet
            const ws_data = XLSX.utils.aoa_to_sheet(aoa);

            // Set column widths
            ws_data['!cols'] = [
                { wch: 25 },  // Period/Product/KOL
                { wch: 10 },  // Orders
                { wch: 15 },  // Revenue
                { wch: 20 },  // Product Commission
                { wch: 20 },  // Tier Commission
                { wch: 20 },  // Total Commission
            ];

            // Apply styles

            // Title row with merged cells
            ws_data.A1 = { ...ws_data.A1, s: titleStyle };
            ws_data['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];

            // Subtitle with merged cells
            ws_data.A2 = { ...ws_data.A2, s: subtitleStyle };
            ws_data['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 5 } });

            // Info rows with merged cells
            for (let r = 2; r <= 3; r++) {
                ws_data[`A${r + 1}`] = { ...ws_data[`A${r + 1}`], s: infoStyle };
                ws_data['!merges'].push({ s: { r: r, c: 0 }, e: { r: r, c: 5 } });
            }

            // Header row (row 6)
            const headerRow = 5;
            for (let c = 0; c < 6; c++) {
                const cell = XLSX.utils.encode_cell({ r: headerRow, c: c });
                ws_data[cell] = { ...ws_data[cell], s: headerStyle };
            }

            // Data rows
            if (reportData.details.length > 0) {
                const dataStartRow = 6;
                const dataEndRow = dataStartRow + reportData.details.length - 1;

                for (let r = dataStartRow; r <= dataEndRow; r++) {
                    // Period/Product/KOL column - left-aligned text
                    const periodCell = XLSX.utils.encode_cell({ r: r, c: 0 });
                    ws_data[periodCell] = { ...ws_data[periodCell], s: dataLeftAlignStyle };

                    // Orders column - numbers
                    const ordersCell = XLSX.utils.encode_cell({ r: r, c: 1 });
                    ws_data[ordersCell] = { ...ws_data[ordersCell], s: numberStyle };

                    // Revenue column - currency
                    const revenueCell = XLSX.utils.encode_cell({ r: r, c: 2 });
                    ws_data[revenueCell] = { ...ws_data[revenueCell], s: currencyStyle };

                    // Product Commission column - currency with green text
                    const productCommCell = XLSX.utils.encode_cell({ r: r, c: 3 });
                    ws_data[productCommCell] = { ...ws_data[productCommCell], s: productCommissionStyle };

                    // Tier Commission column - currency with purple text
                    const tierCommCell = XLSX.utils.encode_cell({ r: r, c: 4 });
                    ws_data[tierCommCell] = { ...ws_data[tierCommCell], s: tierCommissionStyle };

                    // Total Commission column - currency with red text
                    const totalCommCell = XLSX.utils.encode_cell({ r: r, c: 5 });
                    ws_data[totalCommCell] = { ...ws_data[totalCommCell], s: totalCommissionStyle };
                }

                // Total row
                const totalRow = dataEndRow + 1;

                // "TOTAL" text - left-aligned, bold
                const totalLabelCell = XLSX.utils.encode_cell({ r: totalRow, c: 0 });
                ws_data[totalLabelCell] = { ...ws_data[totalLabelCell], s: totalRowLeftStyle };

                // Total Orders - right-aligned number, bold
                const totalOrdersCell = XLSX.utils.encode_cell({ r: totalRow, c: 1 });
                ws_data[totalOrdersCell] = { ...ws_data[totalOrdersCell], s: totalNumberStyle };

                // Total Revenue - right-aligned currency, bold
                const totalRevenueCell = XLSX.utils.encode_cell({ r: totalRow, c: 2 });
                ws_data[totalRevenueCell] = { ...ws_data[totalRevenueCell], s: totalCurrencyStyle };

                // Total Product Commission - right-aligned currency, bold, green
                const totalProdCommCell = XLSX.utils.encode_cell({ r: totalRow, c: 3 });
                ws_data[totalProdCommCell] = { ...ws_data[totalProdCommCell], s: totalProductCommissionStyle };

                // Total Tier Commission - right-aligned currency, bold, purple
                const totalTierCommCell = XLSX.utils.encode_cell({ r: totalRow, c: 4 });
                ws_data[totalTierCommCell] = { ...ws_data[totalTierCommCell], s: totalTierCommissionStyle };

                // Grand Total Commission - right-aligned currency, bold, red
                const grandTotalCell = XLSX.utils.encode_cell({ r: totalRow, c: 5 });
                ws_data[grandTotalCell] = { ...ws_data[grandTotalCell], s: totalTotalCommissionStyle };
            }

            // If there's no data, style the "No data" message row
            if (reportData.details.length === 0) {
                const noDataCell = XLSX.utils.encode_cell({ r: 6, c: 0 });
                ws_data[noDataCell] = {
                    ...ws_data[noDataCell],
                    s: {
                        font: { italic: true, color: { rgb: "666666" } },
                        alignment: { horizontal: "center" }
                    }
                };
                ws_data['!merges'].push({ s: { r: 6, c: 0 }, e: { r: 6, c: 5 } });
            }

            // Add sheet to workbook
            XLSX.utils.book_append_sheet(wb, ws_data, 'Commission Report');

            // Write file
            const fileName = `KOL_Report_${groupBy}_${startDate}_to_${endDate}.xlsx`;
            XLSX.writeFile(wb, fileName);
        } catch (error) {
            console.error('Error exporting Excel:', error);
            alert('Failed to export report. Please try again.');
        }
    };

    const formatCurrency = (value) => {
        return `${currency} ${parseFloat(value).toFixed(2)}`;
    };

    // Get display text for groupBy selection
    const getGroupByDisplay = () => {
        switch (groupBy) {
            case 'day': return 'Daily';
            case 'week': return 'Weekly';
            case 'month': return 'Monthly';
            case 'product': return 'By Product';
            case 'kol': return 'By KOL';
            default: return 'Details';
        }
    };

    // Get column labels based on groupBy
    const getColumnLabels = () => {
        const common = {
            orders: 'Orders',
            revenue: 'Revenue',
            productCommission: 'Product Commission',
            tierCommission: 'Tier Commission',
            totalCommission: 'Total Commission'
        };

        switch (groupBy) {
            case 'day':
            case 'week':
            case 'month':
                return { period: 'Period', ...common };
            case 'product':
                return { period: 'Product', ...common };
            case 'kol':
                return { period: 'KOL', ...common };
            default:
                return { period: 'Period', ...common };
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
            </div>
        );
    }

    if (!reportData) return null;

    const { summary, details } = reportData;
    const columnLabels = getColumnLabels();

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header & Controls */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-grow">
                        <h3 className="text-xl text-left font-bold text-gray-800">Commission Report</h3>
                    </div>

                    {/* Group By Controls */}
                    <div className="w-full md:w-auto flex flex-wrap items-center gap-3 mb-4 md:mb-0">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600 flex items-center">
                                <FiBarChart2 className="mr-1" /> Group By:
                            </span>
                            <select
                                value={groupBy}
                                onChange={(e) => setGroupBy(e.target.value)}
                                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                                <option value="day">Day</option>
                                <option value="week">Week</option>
                                <option value="month">Month</option>
                                <option value="product">Product</option>
                            </select>
                        </div>
                    </div>

                    {/* Date Range Controls */}
                    <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600 flex items-center">
                                <FiCalendar className="mr-1" /> From:
                            </span>
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

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRefresh}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            disabled={isLoading}
                            title="Refresh data"
                        >
                            <FiRefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
                        </button>

                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                            title="Export as Excel"
                        >
                            <FiDownload className="w-4 h-4" />
                            Export Excel
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="Total Orders"
                        value={summary.total_orders}
                    />
                    <StatsCard
                        title="Total Revenue"
                        value={formatCurrency(summary.total_revenue)}
                        borderColor="border-t-blue-500"
                    />
                    <StatsCard
                        title="Product Commission"
                        value={formatCurrency(summary.commission.product)}
                        borderColor="border-t-green-500"
                    />
                    <StatsCard
                        title="Tier Commission"
                        value={formatCurrency(summary.commission.tier)}
                        borderColor="border-t-purple-500"
                    />
                </div>

                {/* Total Commission Card */}
                <div className="bg-white rounded-lg p-6 border-l-4 border-l-red-500 shadow">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-gray-800">Total Commission</h3>
                        <span className="text-2xl font-bold text-red-500">
                            {formatCurrency(summary.commission.total)}
                        </span>
                    </div>
                </div>

                {/* Data Details Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg text-left font-semibold text-gray-800">
                            {getGroupByDisplay()} Details
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {columnLabels.period}
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {columnLabels.orders}
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {columnLabels.revenue}
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {columnLabels.productCommission}
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {columnLabels.tierCommission}
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {columnLabels.totalCommission}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {details.map((item, index) => {
                                    // Handle different data structures based on groupBy
                                    let displayPeriod = item.period;
                                    if (groupBy === 'product' && item.product_name) {
                                        displayPeriod = item.product_name;
                                    } else if (groupBy === 'kol' && item.kol_name) {
                                        displayPeriod = item.kol_name;
                                    }

                                    return (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {displayPeriod}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                                                {item.orders_count}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                                                {formatCurrency(item.revenue)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-green-600">
                                                {formatCurrency(item.commission.product)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-purple-600">
                                                {formatCurrency(item.commission.tier)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-red-500">
                                                {formatCurrency(item.commission.total)}
                                            </td>
                                        </tr>
                                    );
                                })}

                                {details.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                            No data available for the selected period and grouping
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

export default KolReport;
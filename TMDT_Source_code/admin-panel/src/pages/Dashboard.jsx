import React, { useState } from 'react';
import { FiDownload, FiRefreshCw } from 'react-icons/fi';
import { LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import dayjs from 'dayjs';
import DashboardStats from '../components/Dashboard/DashboardStats';
import RevenueChart from '../components/Dashboard/RevenueChart';
import TopProductsChart from '../components/Dashboard/TopProductsChart';
import KOLPerformanceChart from '../components/Dashboard/KOLPerformanceChart';
import CustomerStatistics from '../components/Dashboard/CustomerStatistics';

const Dashboard = ({ token }) => {
    const [timeRange, setTimeRange] = useState('7');
    const [isLoading, setIsLoading] = useState(false);
    const [dateRange, setDateRange] = useState([
        dayjs().subtract(7, 'day'),
        dayjs()
    ]);

    const handleExport = () => {
        console.log('Exporting data...');
    };

    const handleRefresh = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1000);
    };

    const handleTimeRangeChange = (value) => {
        setTimeRange(value);
        let start = dayjs();

        switch (value) {
            case '1':
                start = dayjs().startOf('day');
                break;
            case '2':
                start = dayjs().subtract(1, 'day').startOf('day');
                break;
            case '7':
                start = dayjs().subtract(7, 'day');
                break;
            case '14':
                start = dayjs().subtract(14, 'day');
                break;
            case '30':
                start = dayjs().subtract(30, 'day');
                break;
            default:
                break;
        }

        setDateRange([start, dayjs()]);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Header Card */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                            <p className="text-gray-500 mt-1">
                                Overview and analysis of business performance
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-5">


                            {/* Date Range Picker */}
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateRangePicker
                                    value={dateRange}
                                    onChange={(newValue) => setDateRange(newValue)}
                                    slotProps={{
                                        textField: { size: 'small' },
                                        fieldSeparator: { children: 'to' },
                                    }}
                                />
                            </LocalizationProvider>
                            {/* Time Range Selector */}
                            <div className="relative">
                                <select
                                    value={timeRange}
                                    onChange={(e) => handleTimeRangeChange(e.target.value)}
                                    className="bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="1">Today</option>
                                    <option value="2">Yesterday</option>
                                    <option value="7">Last 7 days</option>
                                    <option value="14">Last 14 days</option>
                                    <option value="30">Last 30 days</option>
                                </select>
                            </div>
                            {/* Action Buttons */}
                            <button
                                onClick={handleRefresh}
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                disabled={isLoading}
                            >
                                <FiRefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dashboard Content */}
                <div className="space-y-6">
                    <DashboardStats token={token} dateRange={dateRange} />

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <RevenueChart token={token} dateRange={dateRange} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <TopProductsChart token={token} dateRange={dateRange} />
                        </div>
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <KOLPerformanceChart dateRange={dateRange} />
                        </div>
                    </div>

                    {/* <div className="bg-white rounded-lg shadow-sm p-6">
                        <CustomerStatistics dateRange={dateRange} />
                    </div> */}
                </div>
            </div>
        </div >
    );
};

export default Dashboard;
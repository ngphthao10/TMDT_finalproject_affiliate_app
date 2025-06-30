import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiCalendar } from 'react-icons/fi';

const OrderDateSlider = ({ onDateChange }) => {
    // Initialize dates with current week
    const getDatesForWeek = (startDate) => {
        const dates = [];
        const sunday = new Date(startDate);
        sunday.setDate(sunday.getDate() - sunday.getDay());

        for (let i = 0; i < 7; i++) {
            const date = new Date(sunday);
            date.setDate(sunday.getDate() + i);
            dates.push(new Date(date));
        }

        return dates;
    };

    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [dates, setDates] = useState(() => getDatesForWeek(new Date()));
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Update dates when week changes
    // Reset dates when selectedDate changes externally
    useEffect(() => {
        const newDates = getDatesForWeek(currentWeek);
        setDates(newDates);
    }, [currentWeek]);

    // Sync with external selectedDate
    useEffect(() => {
        if (selectedDate) {
            setCurrentWeek(selectedDate);
            setDates(getDatesForWeek(selectedDate));
        }
    }, [selectedDate]);

    // Navigate to previous week
    const handlePrevWeek = () => {
        const newDate = new Date(currentWeek);
        newDate.setDate(currentWeek.getDate() - 7);
        setCurrentWeek(newDate);
    };

    // Navigate to next week
    const handleNextWeek = () => {
        const newDate = new Date(currentWeek);
        newDate.setDate(currentWeek.getDate() + 7);
        setCurrentWeek(newDate);
    };

    // Handle date selection
    const handleDateClick = (date) => {
        setSelectedDate(date);
        if (onDateChange) {
            onDateChange(date);
        }
    };

    // Format date for display
    const formatDate = (date) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        return {
            day: days[date.getDay()],
            date: date.getDate(),
            month: months[date.getMonth()]
        };
    };

    // Get week range text
    const getWeekRangeText = () => {
        if (!dates.length) return '';

        const startDate = dates[0];
        const endDate = dates[6];
        const formatDateText = (date) => `${date.getDate()}/${date.getMonth() + 1}`;
        return `${formatDateText(startDate)} - ${formatDateText(endDate)}`;
    };

    // Check if date is today
    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Header with navigation */}
            <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
                <button
                    className="hover:bg-blue-700 p-2 rounded transition-colors"
                    onClick={handlePrevWeek}
                >
                    <FiChevronLeft size={20} />
                </button>
                <div className="flex items-center space-x-2">
                    <FiCalendar />
                    <span>{getWeekRangeText()}</span>
                </div>
                <button
                    className="hover:bg-blue-700 p-2 rounded transition-colors"
                    onClick={handleNextWeek}
                >
                    <FiChevronRight size={20} />
                </button>
            </div>

            {/* Date selector */}
            <div className="flex border-b">
                {dates.map((date) => {
                    const formattedDate = formatDate(date);
                    const isSelected = date.toDateString() === selectedDate.toDateString();
                    const todayDate = isToday(date);

                    return (
                        <button
                            key={date.toISOString()}
                            onClick={() => handleDateClick(date)}
                            className={`flex-1 py-3 text-center transition-colors relative
                                        ${isSelected ? 'border-b-2 border-blue-600 bg-blue-50' : 'hover:bg-gray-50'}
                                        ${todayDate ? 'text-blue-600' : ''}`}
                        >
                            <div className="text-sm font-medium">{formattedDate.day}</div>
                            <div className={`text-lg ${isSelected ? 'text-blue-600 font-bold' : ''}`}>
                                {formattedDate.date}
                            </div>
                            <div className="text-xs text-gray-500">{formattedDate.month}</div>

                            {todayDate && (
                                <div className="text-xs font-semibold text-blue-600">Today</div>
                            )}
                        </button>

                    );
                })}
            </div>
        </div>
    );
};

export default OrderDateSlider;
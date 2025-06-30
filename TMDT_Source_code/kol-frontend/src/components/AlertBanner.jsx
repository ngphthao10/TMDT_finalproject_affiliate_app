// src/components/AlertBanner.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiAlertCircle } from 'react-icons/fi';

const AlertBanner = ({ message, link, linkText }) => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    let parts = [];
    if (message && linkText && message.includes(linkText)) {
        parts = message.split(linkText);
    } else {
        parts = [message || "", ''];
    }

    return (
        <div className="bg-red-100 text-red-800 px-4 py-3 relative flex items-center border border-red-200 my-2 mx-4 rounded">
            <FiAlertCircle className="mr-2 text-red-500" />
            <span>
                {parts[0]}
                {link ? (
                    <Link to={link} className="text-blue-500 hover:underline mx-1">
                        {linkText}
                    </Link>
                ) : (
                    linkText
                )}
                {parts[1]}
            </span>
            <button
                onClick={() => setIsVisible(false)}
                className="absolute top-0 bottom-0 right-0 px-4 py-3"
                aria-label="Close"
            >
                <FiX />
            </button>
        </div>
    );
};

export default AlertBanner;
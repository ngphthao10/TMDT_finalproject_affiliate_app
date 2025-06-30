import React from 'react';

const Logo = ({ className }) => {
    return (
        <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <rect width="32" height="32" rx="4" fill="#F97316" />
            <path d="M20.5 10H11.5C10.9477 10 10.5 10.4477 10.5 11V21C10.5 21.5523 10.9477 22 11.5 22H20.5C21.0523 22 21.5 21.5523 21.5 21V11C21.5 10.4477 21.0523 10 20.5 10Z" stroke="white" strokeWidth="2" />
            <path d="M13 15L14.5 16.5L19 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

export default Logo;
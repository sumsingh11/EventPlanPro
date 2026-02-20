import React from 'react';

const Card = ({ children, className = '', onClick, hover = false }) => {
    const hoverClass = hover ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer' : '';

    return (
        <div
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all duration-200 ${hoverClass} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default Card;

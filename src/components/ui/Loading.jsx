import React from 'react';

const Loading = ({ size = 'medium', text = 'Loading...' }) => {
    const sizeClasses = {
        small: 'h-8 w-8 border-2',
        medium: 'h-12 w-12 border-3',
        large: 'h-16 w-16 border-4',
    };

    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div
                className={`${sizeClasses[size]} border-primary-600 border-t-transparent rounded-full animate-spin`}
                role="status"
                aria-label="Loading"
            />
            {text && (
                <p className="mt-4 text-gray-600 dark:text-gray-400">{text}</p>
            )}
        </div>
    );
};

export default Loading;

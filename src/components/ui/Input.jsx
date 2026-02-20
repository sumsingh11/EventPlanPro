import React from 'react';

const Input = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    onBlur,
    placeholder,
    error,
    required = false,
    disabled = false,
    className = '',
    ...props
}) => {
    return (
        <div className={`mb-4 ${className}`}>
            {label && (
                <label
                    htmlFor={name}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed ${error ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;

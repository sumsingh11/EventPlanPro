import React from 'react';

const Logo = ({ size = 36, showText = true, textSize = 'text-xl' }) => {
    return (
        <div className="flex items-center space-x-2">
            {/* SVG Icon: calendar with checkmark */}
            <svg
                width={size}
                height={size}
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="EventPlanPro logo"
            >
                {/* Calendar body */}
                <rect x="4" y="8" width="32" height="28" rx="4" fill="#1e40af" />
                {/* Calendar top band */}
                <rect x="4" y="8" width="32" height="10" rx="4" fill="#2563eb" />
                {/* Calendar ring left */}
                <rect x="11" y="4" width="3" height="8" rx="1.5" fill="#93c5fd" />
                {/* Calendar ring right */}
                <rect x="26" y="4" width="3" height="8" rx="1.5" fill="#93c5fd" />
                {/* Checkmark */}
                <path
                    d="M13 24 L18 29 L27 19"
                    stroke="#60efb0"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>

            {showText && (
                <span className={`font-bold ${textSize} text-blue-800 dark:text-blue-300 tracking-tight`}>
                    Event<span className="text-blue-500">Plan</span>Pro
                </span>
            )}
        </div>
    );
};

export default Logo;

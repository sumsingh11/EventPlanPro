import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeNotification } from '../../store/slices/notificationSlice';
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const Notification = () => {
    const dispatch = useDispatch();
    const notifications = useSelector(state => state.notifications.notifications);

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return <FiCheckCircle className="text-green-500" size={20} />;
            case 'error':
                return <FiXCircle className="text-red-500" size={20} />;
            case 'warning':
                return <FiAlertCircle className="text-yellow-500" size={20} />;
            default:
                return <FiInfo className="text-blue-500" size={20} />;
        }
    };

    const getBgColor = (type) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
            case 'error':
                return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
            case 'warning':
                return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
            default:
                return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
        }
    };

    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg ${getBgColor(notification.type)} animate-slide-in`}
                >
                    <div className="flex-shrink-0 mt-0.5">
                        {getIcon(notification.type)}
                    </div>
                    <p className="flex-1 text-sm text-gray-900 dark:text-gray-100">
                        {notification.message}
                    </p>
                    <button
                        onClick={() => dispatch(removeNotification(notification.id))}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <FiX size={18} />
                    </button>
                </div>
            ))}
        </div>
    );
};

// Add animation styles to index.css
// @keyframes slide-in {
//   from { transform: translateX(100%); opacity: 0; }
//   to { transform: translateX(0); opacity: 1; }
// }
// .animate-slide-in {
//   animation: slide-in 0.3s ease-out;
// }

export default Notification;

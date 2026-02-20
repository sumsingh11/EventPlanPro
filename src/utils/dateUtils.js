import { formatDate as _formatDate } from 'date-fns';

/**
 * Format a date string or Date object to a readable format
 * @param {string|Date} date - Date to format
 * @param {string} format - Format string (default: 'MMM dd, yyyy')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'MMM dd, yyyy') => {
    if (!date) return '';

    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return _formatDate(dateObj, format);
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
};

/**
 * Format date for input fields (YYYY-MM-DD)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string for input
 */
export const formatDateForInput = (date) => {
    if (!date) return '';

    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toISOString().split('T')[0];
    } catch (error) {
        console.error('Error formatting date for input:', error);
        return '';
    }
};

/**
 * Get countdown message for an event
 * @param {string|Date} eventDate - Event date
 * @returns {object} Countdown object with message and isPast flag
 */
export const getCountdown = (eventDate) => {
    if (!eventDate) return { message: '', isPast: false };

    try {
        const dateObj = typeof eventDate === 'string' ? new Date(eventDate) : eventDate;
        const now = new Date();
        const diff = dateObj.getTime() - now.getTime();

        if (diff < 0) {
            return { message: 'Event has passed', isPast: true };
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days === 0) {
            return { message: 'Today!', isPast: false };
        } else if (days === 1) {
            return { message: 'Tomorrow!', isPast: false };
        } else if (days < 7) {
            return { message: `In ${days} days`, isPast: false };
        } else if (days < 30) {
            const weeks = Math.floor(days / 7);
            return { message: `In ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`, isPast: false };
        } else {
            const months = Math.floor(days / 30);
            return { message: `In ${months} ${months === 1 ? 'month' : 'months'}`, isPast: false };
        }
    } catch (error) {
        console.error('Error calculating countdown:', error);
        return { message: '', isPast: false };
    }
};

/**
 * Get relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to calculate from
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
    if (!date) return '';

    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const now = new Date();
        const diffMs = now.getTime() - dateObj.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHours = Math.floor(diffMin / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSec < 60) return 'Just now';
        if (diffMin < 60) return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
        if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
        if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;

        return formatDate(dateObj);
    } catch (error) {
        console.error('Error calculating relative time:', error);
        return '';
    }
};

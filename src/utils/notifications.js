// Notification toast management
// This is a simple implementation - later enhance with a library like react-hot-toast after all MUST HAVE features are implemented

let notificationCallback = null;

export const setNotificationCallback = (callback) => {
    notificationCallback = callback;
};

export const showNotification = (message, type = 'info') => {
    if (notificationCallback) {
        notificationCallback({ message, type });
    } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
};

export const showSuccess = (message) => {
    showNotification(message, 'success');
};

export const showError = (message) => {
    showNotification(message, 'error');
};

export const showWarning = (message) => {
    showNotification(message, 'warning');
};

export const showInfo = (message) => {
    showNotification(message, 'info');
};

// Common success messages
export const SUCCESS_MESSAGES = {
    EVENT_CREATED: 'Event created successfully',
    EVENT_UPDATED: 'Event updated successfully',
    EVENT_DELETED: 'Event deleted successfully',
    EVENT_DUPLICATED: 'Event duplicated successfully',
    GUEST_ADDED: 'Guest added successfully',
    GUEST_UPDATED: 'Guest updated successfully',
    GUEST_DELETED: 'Guest removed successfully',
    TASK_ADDED: 'Task added successfully',
    TASK_UPDATED: 'Task updated successfully',
    TASK_DELETED: 'Task deleted successfully',
    EXPENSE_ADDED: 'Expense added successfully',
    EXPENSE_UPDATED: 'Expense updated successfully',
    EXPENSE_DELETED: 'Expense deleted successfully',
    BUDGET_UPDATED: 'Budget updated successfully',
    SETTINGS_SAVED: 'Settings saved successfully',
    DATA_EXPORTED: 'Data exported successfully',
};

// Common error messages
export const ERROR_MESSAGES = {
    REQUIRED_FIELD: 'Please fill in all required fields',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_DATE: 'Please enter a valid date',
    DUPLICATE_GUEST: 'A guest with this email already exists for this event',
    BUDGET_EXCEEDED: 'Warning: Budget limit exceeded',
    NETWORK_ERROR: 'Network error. Please check your connection and try again',
    SERVER_ERROR: 'An error occurred. Please try again later',
    AUTH_ERROR: 'Authentication error. Please login again',
    PERMISSION_ERROR: 'You do not have permission to perform this action',
};

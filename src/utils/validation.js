// Form validation utilities

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validateRequired = (value) => {
    if (typeof value === 'string') {
        return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
};

export const validatePassword = (password) => {
    // At least 6 characters
    return password && password.length >= 6;
};

export const validatePasswordMatch = (password, confirmPassword) => {
    return password === confirmPassword;
};

export const validateDate = (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
};

export const validateFutureDate = (dateString) => {
    // Allow today and any future date (date-only, local timezone)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Parse as local time by splitting components
    const [y, m, d] = dateString.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date >= today;
};

// Validate that a date+time combination is in the future (always local timezone)
export const validateFutureDatetime = (dateString, timeString) => {
    if (!dateString || !timeString) return false;
    // Parse components individually to guarantee local time interpretation
    const [y, mo, d] = dateString.split('-').map(Number);
    const [h, mi] = timeString.split(':').map(Number);
    const eventDateTime = new Date(y, mo - 1, d, h, mi);
    return eventDateTime > new Date();
};

export const validateNumber = (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
};

export const validatePositiveNumber = (value) => {
    return validateNumber(value) && parseFloat(value) > 0;
};

// Validation error messages
export const getErrorMessage = (field, validation) => {
    const messages = {
        required: `${field} is required`,
        email: 'Please enter a valid email address',
        password: 'Password must be at least 6 characters',
        passwordMatch: 'Passwords do not match',
        date: 'Please enter a valid date',
        futureDate: 'Date must be in the future',
        number: 'Please enter a valid number',
        positiveNumber: 'Please enter a positive number',
    };
    return messages[validation] || 'Invalid input';
};

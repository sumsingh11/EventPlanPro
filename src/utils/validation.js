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
    const date = new Date(dateString);
    const now = new Date();
    return date > now;
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

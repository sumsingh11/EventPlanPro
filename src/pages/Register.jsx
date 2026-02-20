import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { register } from '../store/slices/authSlice';
import { showNotification } from '../store/slices/notificationSlice';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { validateEmail, validateRequired, validatePassword, validatePasswordMatch } from '../utils/validation';

const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!validateRequired(formData.firstName)) {
            newErrors.firstName = 'First name is required';
        }

        if (!validateRequired(formData.lastName)) {
            newErrors.lastName = 'Last name is required';
        }

        if (!validateRequired(formData.email)) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!validateRequired(formData.password)) {
            newErrors.password = 'Password is required';
        } else if (!validatePassword(formData.password)) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!validateRequired(formData.confirmPassword)) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (!validatePasswordMatch(formData.password, formData.confirmPassword)) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        const result = await dispatch(register({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            role: 'user',
        }));
        setLoading(false);

        if (result.success) {
            dispatch(showNotification('Registration successful!', 'success'));
            navigate('/dashboard');
        } else {
            dispatch(showNotification(result.error || 'Registration failed. Please try again.', 'error'));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-600 px-4 py-12">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Create Account
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Start planning your perfect events
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Input
                        label="First Name"
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        error={errors.firstName}
                        placeholder="John"
                        required
                    />

                    <Input
                        label="Last Name"
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        error={errors.lastName}
                        placeholder="Doe"
                        required
                    />

                    <Input
                        label="Email Address"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        placeholder="you@example.com"
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        placeholder="••••••••"
                        required
                    />

                    <Input
                        label="Confirm Password"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        error={errors.confirmPassword}
                        placeholder="••••••••"
                        required
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        size="large"
                        fullWidth
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;

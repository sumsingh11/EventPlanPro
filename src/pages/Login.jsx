import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../store/slices/authSlice';
import { showNotification } from '../store/slices/notificationSlice';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { validateEmail, validateRequired } from '../utils/validation';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
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

        if (!validateRequired(formData.email)) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!validateRequired(formData.password)) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        const result = await dispatch(login(formData.email, formData.password));
        setLoading(false);

        if (result.success) {
            dispatch(showNotification('Login successful!', 'success'));
            navigate('/dashboard');
        } else {
            dispatch(showNotification(result.error || 'Login failed. Please check your credentials.', 'error'));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-600 px-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Sign in to manage your events
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
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

                    <Button
                        type="submit"
                        variant="primary"
                        size="large"
                        fullWidth
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

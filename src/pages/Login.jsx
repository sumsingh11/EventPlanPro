import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login, googleLogin } from '../store/slices/authSlice';
import { showNotification } from '../store/slices/notificationSlice';
import { FcGoogle } from 'react-icons/fc';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';
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

    const handleGoogleLogin = async () => {
        setLoading(true);
        const result = await dispatch(googleLogin());
        setLoading(false);

        if (result.success) {
            dispatch(showNotification('Login successful!', 'success'));
            navigate('/dashboard');
        } else {
            dispatch(showNotification(result.error || 'Google login failed.', 'error'));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950 px-4">
            <div className="max-w-md w-full">

                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Logo size={48} textSize="text-2xl" />
                </div>

                {/* Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-slate-200 dark:border-gray-700 p-8">

                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                            Welcome back
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
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

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200 dark:border-gray-700"></span>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Button
                                variant="secondary"
                                fullWidth
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="flex items-center justify-center gap-3 border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 shadow-sm"
                            >
                                <FcGoogle size={22} />
                                <span className="text-gray-700 dark:text-gray-200 font-medium">
                                    Google
                                </span>
                            </Button>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                                Create one
                            </Link>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Login;

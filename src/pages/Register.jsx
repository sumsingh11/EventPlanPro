import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, googleLogin } from '../store/slices/authSlice';
import { showNotification } from '../store/slices/notificationSlice';
import { FcGoogle } from 'react-icons/fc';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';
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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950 px-4 py-12">
            <div className="max-w-md w-full">

                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <Logo size={48} textSize="text-2xl" />
                </div>

                {/* Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-slate-200 dark:border-gray-700 p-8">

                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                            Create your account
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Start planning your perfect events
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4">
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
                        </div>

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
                            placeholder="Min. 6 characters"
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
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Register;

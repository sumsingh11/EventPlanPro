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

    /* ── Decorative floating shapes for the hero panel ───────────────── */
    const shapes = [
        { emoji: '🎉', top: '8%', left: '10%', size: '3rem', rotate: '-15deg', delay: '0s' },
        { emoji: '📅', top: '18%', left: '70%', size: '2.4rem', rotate: '10deg', delay: '0.4s' },
        { emoji: '🎂', top: '40%', left: '15%', size: '2.8rem', rotate: '-8deg', delay: '0.8s' },
        { emoji: '🥂', top: '55%', left: '75%', size: '2.2rem', rotate: '20deg', delay: '0.2s' },
        { emoji: '🎊', top: '72%', left: '8%', size: '2.6rem', rotate: '-12deg', delay: '1s' },
        { emoji: '✨', top: '82%', left: '65%', size: '2rem', rotate: '5deg', delay: '0.6s' },
        { emoji: '💍', top: '30%', left: '55%', size: '2.2rem', rotate: '-20deg', delay: '1.2s' },
        { emoji: '🎵', top: '63%', left: '40%', size: '2rem', rotate: '15deg', delay: '0.9s' },
    ];

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">

            {/* ── LEFT PANEL — Hero / Brand ─────────────────────────────── */}
            <div
                className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center px-12 py-16"
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)' }}
            >
                {/* Animated floating emojis */}
                {shapes.map((s, i) => (
                    <span
                        key={i}
                        className="absolute select-none"
                        style={{
                            top: s.top, left: s.left, fontSize: s.size,
                            transform: `rotate(${s.rotate})`,
                            animation: `float 6s ease-in-out infinite`,
                            animationDelay: s.delay,
                            opacity: 0.85,
                        }}
                    >
                        {s.emoji}
                    </span>
                ))}

                {/* Soft circle blobs */}
                <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 -right-12 w-56 h-56 bg-purple-300/20 rounded-full blur-2xl pointer-events-none" />

                {/* Text */}
                <div className="relative z-10 text-center text-white">
                    <div className="text-6xl mb-6">🗓️</div>
                    <h2 className="text-4xl font-extrabold leading-tight mb-4">Plan Every<br />Perfect Moment</h2>
                    <p className="text-purple-200 text-lg max-w-xs mx-auto leading-relaxed">
                        Manage events, guests, budgets & tasks — all in one elegant place.
                    </p>
                    <div className="mt-8 flex justify-center gap-4 text-sm text-purple-200">
                        <span className="flex items-center gap-1">✅ Events</span>
                        <span className="flex items-center gap-1">✅ Guests</span>
                        <span className="flex items-center gap-1">✅ Budgets</span>
                    </div>
                </div>
            </div>

            {/* ── RIGHT PANEL — Form ───────────────────────────────────── */}
            <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-gray-950 px-6 py-12">
                <div className="w-full max-w-md">

                    {/* Logo (visible on mobile; hidden on large where left panel shows) */}
                    <div className="flex justify-center mb-8">
                        <Logo size={44} textSize="text-2xl" />
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-slate-200 dark:border-gray-700 p-8">

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
                            <Button type="submit" variant="primary" size="large" fullWidth disabled={loading}>
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
                                    variant="secondary" fullWidth onClick={handleGoogleLogin} disabled={loading}
                                    className="flex items-center justify-center gap-3 border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 shadow-sm"
                                >
                                    <FcGoogle size={22} />
                                    <span className="text-gray-700 dark:text-gray-200 font-medium">Google</span>
                                </Button>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
                                    Create one
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Float keyframe (injected inline so no CSS file change needed) */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(var(--r, 0deg)); }
                    50% { transform: translateY(-14px) rotate(var(--r, 0deg)); }
                }
            `}</style>
        </div>
    );
};

export default Login;

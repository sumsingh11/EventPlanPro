import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { signOut } from '../../store/slices/authSlice';
import { toggleDarkMode } from '../../store/slices/settingsSlice';
import { getAnnouncement } from '../../services/announcementService';
import { FiMenu, FiX, FiSun, FiMoon, FiLogOut, FiHome, FiSettings, FiShield, FiBell, FiTrendingUp } from 'react-icons/fi';
import Button from '../ui/Button';
import Logo from '../ui/Logo';



const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);

    const { userData, isAuthenticated } = useSelector(state => state.auth);
    const darkMode = useSelector(state => state.settings.darkMode);

    // Check for unread announcement
    useEffect(() => {
        if (!isAuthenticated) return;
        getAnnouncement().then(ann => {
            if (!ann) return;
            const read = localStorage.getItem('eventplanpro_inbox_read');
            setHasUnread(read !== ann.updatedAt);
        }).catch(() => { });
    }, [isAuthenticated]);

    const handleLogout = async () => {
        await dispatch(signOut());
        navigate('/login');
    };

    const handleToggleDarkMode = () => {
        dispatch(toggleDarkMode());
    };

    const isAdmin = userData?.role === 'admin';

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center">
                        <Logo size={30} textSize="text-lg" />
                    </Link>



                    {/* Desktop Navigation */}
                    {isAuthenticated && (
                        <div className="hidden md:flex items-center space-x-4">
                            <Link to="/dashboard" className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <FiHome size={18} />
                                <span>Dashboard</span>
                            </Link>

                            <Link to="/insights" className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <FiTrendingUp size={18} />
                                <span>Insights</span>
                            </Link>

                            <Link
                                to="/settings"
                                className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <FiSettings size={18} />
                                <span>Settings</span>
                            </Link>

                            {isAdmin && (
                                <Link to="/admin" className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    <FiShield size={18} />
                                    <span>Admin</span>
                                </Link>
                            )}

                            {/* Inbox Bell */}
                            <Link to="/inbox" className="relative p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Inbox">
                                <FiBell size={20} />
                                {hasUnread && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                                )}
                            </Link>

                            <button
                                onClick={handleToggleDarkMode}
                                className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                aria-label="Toggle dark mode"
                            >
                                {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
                            </button>

                            <div className="flex items-center space-x-3 pl-3 border-l border-gray-300 dark:border-gray-600">
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {userData?.firstName} {userData?.lastName}
                                </span>
                                <Button
                                    variant="outline"
                                    size="small"
                                    onClick={handleLogout}
                                    className="flex items-center space-x-1"
                                >
                                    <FiLogOut size={16} />
                                    <span>Logout</span>
                                </Button>
                            </div>
                        </div>
                    )}



                    {/* Mobile menu button */}
                    {isAuthenticated && (
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                        </button>
                    )}
                </div>
            </div>



            {/* Mobile Navigation */}
            {isAuthenticated && mobileMenuOpen && (
                <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <Link
                            to="/dashboard"
                            className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <FiHome size={18} />
                            <span>Dashboard</span>
                        </Link>

                        <Link
                            to="/settings"
                            className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <FiSettings size={18} />
                            <span>Settings</span>
                        </Link>

                        {isAdmin && (
                            <Link to="/admin" className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setMobileMenuOpen(false)}>
                                <FiShield size={18} />
                                <span>Admin</span>
                            </Link>
                        )}

                        <Link to="/inbox" className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setMobileMenuOpen(false)}>
                            <div className="relative">
                                <FiBell size={18} />
                                {hasUnread && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />}
                            </div>
                            <span>Inbox {hasUnread && '(New)'}</span>
                        </Link>

                        <button
                            onClick={handleToggleDarkMode}
                            className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
                            <span>Toggle {darkMode ? 'Light' : 'Dark'} Mode</span>
                        </button>

                        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                            {userData?.firstName} {userData?.lastName}
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                            <FiLogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;

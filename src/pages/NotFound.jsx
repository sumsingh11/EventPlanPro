import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Logo from '../components/ui/Logo';
import Button from '../components/ui/Button';
import { FiArrowLeft, FiHome } from 'react-icons/fi';

const NotFound = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector(state => state.auth);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950 px-4">
            <div className="text-center max-w-md">
                <div className="flex justify-center mb-6">
                    <Logo size={40} textSize="text-xl" />
                </div>

                <div className="text-8xl font-bold text-blue-100 dark:text-blue-900 mb-2 select-none">
                    404
                </div>

                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Page not found
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                    Sorry, we couldn't find the page you're looking for.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="secondary" onClick={() => navigate(-1)} className="flex items-center gap-2">
                        <FiArrowLeft size={16} /> Go Back
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                        className="flex items-center gap-2"
                    >
                        <FiHome size={16} /> {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;

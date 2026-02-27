import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Notification from '../ui/Notification';

const Layout = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
            <footer className="border-t border-gray-200 dark:border-gray-800 py-6 text-center text-gray-500 text-sm">
                <p>&copy; 2026 EventPlanPro. All rights reserved.</p>
            </footer>
            <Notification />
        </div>
    );
};

export default Layout;

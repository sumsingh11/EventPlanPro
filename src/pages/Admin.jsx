import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { showNotification } from '../store/slices/notificationSlice';
import Card from '../components/ui/Card';
import Loading from '../components/ui/Loading';
import { FiUsers, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { getAllUsers, getSystemStats } from '../services/adminService';

const Admin = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalEvents: 0,
        totalGuests: 0,
        totalTasks: 0,
        totalBudget: 0,
        totalExpenses: 0,
    });

    useEffect(() => {
        loadAdminData();
    }, []);

    const loadAdminData = async () => {
        try {
            setLoading(true);
            const [usersData, statsData] = await Promise.all([
                getAllUsers(),
                getSystemStats(),
            ]);
            setUsers(usersData);
            setStats(statsData);
        } catch (error) {
            console.error('Error loading admin data:', error);
            dispatch(showNotification('Failed to load admin data', 'error'));
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loading text="Loading admin dashboard..." />;
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Admin Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    System-wide analytics and user management
                </p>
            </div>


            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Users</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                {stats.totalUsers}
                            </p>
                        </div>
                        <FiUsers className="text-primary-500" size={32} />
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Events</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                {stats.totalEvents}
                            </p>
                        </div>
                        <FiCalendar className="text-blue-500" size={32} />
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Guests</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                {stats.totalGuests}
                            </p>
                        </div>
                        <FiUsers className="text-green-500" size={32} />
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Tasks</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                {stats.totalTasks}
                            </p>
                        </div>
                        <FiCalendar className="text-purple-500" size={32} />
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Budget</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                ${stats.totalBudget.toFixed(0)}
                            </p>
                        </div>
                        <FiDollarSign className="text-yellow-500" size={32} />
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Expenses</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                ${stats.totalExpenses.toFixed(0)}
                            </p>
                        </div>
                        <FiDollarSign className="text-red-500" size={32} />
                    </div>
                </Card>
            </div>


            {/* Users Table */}
            <Card>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    All Users
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Joined
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                        {user.firstName} {user.lastName}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {user.email}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.role === 'admin'
                                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {user.createdAt && new Date(user.createdAt.seconds * 1000).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Admin;

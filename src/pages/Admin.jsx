import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { showNotification } from '../store/slices/notificationSlice';
import Card from '../components/ui/Card';
import Loading from '../components/ui/Loading';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { FiUsers, FiCalendar, FiDollarSign, FiShield, FiTrash2, FiList } from 'react-icons/fi';
import { getAllUsers, getSystemStats, getAllEvents, updateUserRole, deleteUserAccount } from '../services/adminService';

const Admin = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [allEvents, setAllEvents] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [confirmModal, setConfirmModal] = useState({ open: false, type: null, user: null });
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
            const [usersData, statsData, eventsData] = await Promise.all([
                getAllUsers(),
                getSystemStats(),
                getAllEvents(),
            ]);
            setUsers(usersData);
            setStats(statsData);
            setAllEvents(eventsData);
        } catch (error) {
            console.error('Error loading admin data:', error);
            dispatch(showNotification('Failed to load admin data', 'error'));
        } finally {
            setLoading(false);
        }
    };

    const handlePromoteRole = (user) => {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        setConfirmModal({ open: true, type: 'role', user, newRole });
    };

    const handleDeleteUser = (user) => {
        setConfirmModal({ open: true, type: 'delete', user });
    };

    const handleConfirmAction = async () => {
        const { type, user, newRole } = confirmModal;
        setConfirmModal({ open: false, type: null, user: null });
        try {
            if (type === 'role') {
                await updateUserRole(user.id, newRole);
                setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
                dispatch(showNotification(`User ${newRole === 'admin' ? 'promoted to admin' : 'demoted to user'}`, 'success'));
            } else if (type === 'delete') {
                await deleteUserAccount(user.id);
                setUsers(prev => prev.filter(u => u.id !== user.id));
                dispatch(showNotification('User removed successfully', 'success'));
            }
        } catch (error) {
            dispatch(showNotification('Action failed. Please try again.', 'error'));
        }
    };

    if (loading) {
        return <Loading text="Loading admin dashboard..." />;
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FiShield },
        { id: 'users', label: `Users (${users.length})`, icon: FiUsers },
        { id: 'events', label: `All Events (${allEvents.length})`, icon: FiList },
    ];

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    Admin Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    System-wide analytics and user management
                </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <div className="flex space-x-6">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                    }`}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { label: 'Total Users', value: stats.totalUsers, icon: FiUsers, color: 'text-blue-500' },
                        { label: 'Total Events', value: stats.totalEvents, icon: FiCalendar, color: 'text-purple-500' },
                        { label: 'Total Guests', value: stats.totalGuests, icon: FiUsers, color: 'text-green-500' },
                        { label: 'Total Tasks', value: stats.totalTasks, icon: FiCalendar, color: 'text-orange-500' },
                        { label: 'Total Budget', value: `$${stats.totalBudget.toFixed(0)}`, icon: FiDollarSign, color: 'text-yellow-500' },
                        { label: 'Total Expenses', value: `$${stats.totalExpenses.toFixed(0)}`, icon: FiDollarSign, color: 'text-red-500' },
                    ].map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={stat.label}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                            {stat.value}
                                        </p>
                                    </div>
                                    <Icon className={stat.color} size={32} />
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <Card>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        All Users
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    {['Name', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
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
                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                            {user.createdAt && new Date(user.createdAt.seconds * 1000).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handlePromoteRole(user)}
                                                    title={user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                                                    className={`flex items-center gap-1 px-2 py-1 text-xs rounded font-medium transition-colors ${user.role === 'admin'
                                                            ? 'bg-purple-100 hover:bg-purple-200 text-purple-700 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 dark:text-purple-300'
                                                            : 'bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300'
                                                        }`}
                                                >
                                                    <FiShield size={12} />
                                                    {user.role === 'admin' ? 'Demote' : 'Promote'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user)}
                                                    title="Remove user"
                                                    className="flex items-center gap-1 px-2 py-1 text-xs rounded font-medium bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300 transition-colors"
                                                >
                                                    <FiTrash2 size={12} />
                                                    Remove
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {users.length === 0 && (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No users found</p>
                        )}
                    </div>
                </Card>
            )}

            {/* All Events Tab */}
            {activeTab === 'events' && (
                <Card>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        All Events (System-Wide)
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    {['Event Name', 'Type', 'Date', 'Location', 'Owner ID'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {allEvents.map((event) => (
                                    <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {event.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            {event.type}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            {event.date}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            {event.location || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-400 font-mono">
                                            {event.userId?.slice(0, 12)}…
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {allEvents.length === 0 && (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No events found</p>
                        )}
                    </div>
                </Card>
            )}

            {/* Confirm Action Modal */}
            <Modal
                isOpen={confirmModal.open}
                onClose={() => setConfirmModal({ open: false, type: null, user: null })}
                title={confirmModal.type === 'delete' ? 'Remove User' : `${confirmModal.newRole === 'admin' ? 'Promote to Admin' : 'Demote to User'}`}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setConfirmModal({ open: false, type: null, user: null })}>
                            Cancel
                        </Button>
                        <Button
                            variant={confirmModal.type === 'delete' ? 'danger' : 'primary'}
                            onClick={handleConfirmAction}
                        >
                            Confirm
                        </Button>
                    </>
                }
            >
                <p className="text-gray-700 dark:text-gray-300">
                    {confirmModal.type === 'delete'
                        ? `Are you sure you want to remove ${confirmModal.user?.firstName} ${confirmModal.user?.lastName}? This will delete their profile record.`
                        : `Are you sure you want to ${confirmModal.newRole === 'admin' ? 'promote' : 'demote'} ${confirmModal.user?.firstName} ${confirmModal.user?.lastName}?`
                    }
                </p>
            </Modal>
        </div>
    );
};

export default Admin;

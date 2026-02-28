import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { showNotification } from '../store/slices/notificationSlice';
import Card from '../components/ui/Card';
import Loading from '../components/ui/Loading';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { FiUsers, FiCalendar, FiDollarSign, FiShield, FiTrash2, FiList, FiDownload, FiMessageSquare, FiEye } from 'react-icons/fi';
import { getAllUsers, getSystemStats, getAllEvents, updateUserRole, deleteUserAccount, adminDeleteEvent, exportAdminReport } from '../services/adminService';
import { getAnnouncement, setAnnouncement, clearAnnouncement } from '../services/announcementService';

const Admin = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [allEvents, setAllEvents] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [confirmModal, setConfirmModal] = useState({ open: false, type: null, user: null, event: null });
    const [stats, setStats] = useState({
        totalUsers: 0, totalEvents: 0, totalGuests: 0,
        totalTasks: 0, totalBudget: 0, totalExpenses: 0,
    });


    // Announcement state
    const [announcementText, setAnnouncementText] = useState('');
    const [currentAnnouncement, setCurrentAnnouncement] = useState(null);

    useEffect(() => { loadAdminData(); }, []);

    const loadAdminData = async () => {
        try {
            setLoading(true);
            const [usersData, statsData, eventsData, ann] = await Promise.all([
                getAllUsers(), getSystemStats(), getAllEvents(), getAnnouncement(),
            ]);
            setUsers(usersData);
            setStats(statsData);
            setAllEvents(eventsData);
            if (ann) {
                setCurrentAnnouncement(ann);
                setAnnouncementText(ann.message || '');
            }
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
        setConfirmModal({ open: true, type: 'deleteUser', user });
    };

    const handleDeleteEvent = (event) => {
        setConfirmModal({ open: true, type: 'deleteEvent', event });
    };

    const handleConfirmAction = async () => {
        const { type, user, newRole, event } = confirmModal;
        setConfirmModal({ open: false, type: null, user: null, event: null });
        try {
            if (type === 'role') {
                await updateUserRole(user.id, newRole);
                setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
                dispatch(showNotification(`User ${newRole === 'admin' ? 'promoted to admin' : 'demoted to user'}`, 'success'));
            } else if (type === 'deleteUser') {
                await deleteUserAccount(user.id);
                setUsers(prev => prev.filter(u => u.id !== user.id));
                dispatch(showNotification('User removed successfully', 'success'));
            } else if (type === 'deleteEvent') {
                await adminDeleteEvent(event.id);
                setAllEvents(prev => prev.filter(e => e.id !== event.id));
                dispatch(showNotification('Event deleted successfully', 'success'));
            }
        } catch (error) {
            dispatch(showNotification('Action failed. Please try again.', 'error'));
        }
    };

    const handleExportReport = async () => {
        try {
            const data = { stats, users, events: allEvents };
            await exportAdminReport(activeTab, data);
            dispatch(showNotification(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} report downloaded`, 'success'));
        } catch (err) {
            dispatch(showNotification('Failed to export report', 'error'));
        }
    };

    const handleSaveAnnouncement = async () => {
        try {
            if (!announcementText.trim()) {
                await clearAnnouncement();
                setCurrentAnnouncement(null);
                dispatch(showNotification('Announcement cleared', 'success'));
            } else {
                await setAnnouncement(announcementText.trim());
                setCurrentAnnouncement({ message: announcementText.trim() });
                dispatch(showNotification('Announcement published', 'success'));
            }
        } catch (err) {
            dispatch(showNotification('Failed to update announcement', 'error'));
        }
    };

    const handleClearAnnouncement = async () => {
        try {
            await clearAnnouncement();
            setAnnouncementText('');
            setCurrentAnnouncement(null);
            dispatch(showNotification('Announcement cleared', 'success'));
        } catch (err) {
            dispatch(showNotification('Failed to clear announcement', 'error'));
        }
    };

    if (loading) return <Loading text="Loading admin dashboard..." />;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FiShield },
        { id: 'users', label: `Users (${users.length})`, icon: FiUsers },
        { id: 'events', label: `All Events (${allEvents.length})`, icon: FiList },
        { id: 'announcements', label: 'Announcements', icon: FiMessageSquare },
    ];

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">Admin Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400">System-wide analytics and management</p>
                </div>
                <Button variant="secondary" onClick={handleExportReport} className="flex items-center gap-2">
                    <FiDownload size={16} /> Export Report
                </Button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <div className="flex space-x-6 overflow-x-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                    }`}
                            >
                                <Icon size={16} /> {tab.label}
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
                                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stat.value}</p>
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
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">All Users</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    {['Name', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{user.firstName} {user.lastName}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>{user.role}</span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                            {user.createdAt && new Date(user.createdAt.seconds * 1000).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handlePromoteRole(user)} title={user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'} className={`flex items-center gap-1 px-2 py-1 text-xs rounded font-medium transition-colors ${user.role === 'admin' ? 'bg-purple-100 hover:bg-purple-200 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                                                    <FiShield size={12} /> {user.role === 'admin' ? 'Demote' : 'Promote'}
                                                </button>
                                                <button onClick={() => handleDeleteUser(user)} title="Remove user" className="flex items-center gap-1 px-2 py-1 text-xs rounded font-medium bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:text-red-300 transition-colors">
                                                    <FiTrash2 size={12} /> Remove
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {users.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-8">No users found</p>}
                    </div>
                </Card>
            )}

            {/* All Events Tab */}
            {activeTab === 'events' && (
                <Card>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">All Events (System-Wide)</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    {['Event Name', 'Type', 'Date', 'Status', 'Owner ID', 'Actions'].map(h => (
                                        <th key={h} className={`px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {allEvents.map((event) => (
                                    <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{event.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{event.type}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{event.date}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${event.status === 'completed' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                                event.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                                    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                }`}>
                                                {event.status || 'active'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-400 font-mono">{event.userId?.slice(0, 12)}…</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/events/${event.id}`)}
                                                    title="View Event"
                                                    className="flex items-center gap-1 px-2 py-1 text-xs rounded font-medium bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 transition-colors"
                                                >
                                                    <FiEye size={12} /> View
                                                </button>
                                                <button onClick={() => handleDeleteEvent(event)} title="Delete event" className="flex items-center gap-1 px-2 py-1 text-xs rounded font-medium bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:text-red-300 transition-colors">
                                                    <FiTrash2 size={12} /> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {allEvents.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-8">No events found</p>}
                    </div>
                </Card>
            )}

            {/* Announcements Tab */}
            {activeTab === 'announcements' && (
                <Card>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">System Announcement</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Post a message visible to all users on their Dashboard.
                    </p>

                    {currentAnnouncement && (
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">Current announcement:</p>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">{currentAnnouncement.message}</p>
                        </div>
                    )}

                    <textarea
                        value={announcementText}
                        onChange={(e) => setAnnouncementText(e.target.value)}
                        rows={3}
                        placeholder="Type your announcement message..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none mb-4"
                    />
                    <div className="flex gap-3">
                        <Button variant="primary" onClick={handleSaveAnnouncement}>
                            {currentAnnouncement ? 'Update Announcement' : 'Publish Announcement'}
                        </Button>
                        {currentAnnouncement && (
                            <Button variant="danger" onClick={handleClearAnnouncement}>
                                Clear Announcement
                            </Button>
                        )}
                    </div>
                </Card>
            )}

            {/* Confirm Action Modal */}
            <Modal
                isOpen={confirmModal.open}
                onClose={() => setConfirmModal({ open: false, type: null, user: null, event: null })}
                title={
                    confirmModal.type === 'deleteUser' ? 'Remove User' :
                        confirmModal.type === 'deleteEvent' ? 'Delete Event' :
                            `${confirmModal.newRole === 'admin' ? 'Promote to Admin' : 'Demote to User'}`
                }
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setConfirmModal({ open: false, type: null, user: null, event: null })}>Cancel</Button>
                        <Button variant={confirmModal.type?.startsWith('delete') ? 'danger' : 'primary'} onClick={handleConfirmAction}>Confirm</Button>
                    </>
                }
            >
                <p className="text-gray-700 dark:text-gray-300">
                    {confirmModal.type === 'deleteUser'
                        ? `Are you sure you want to remove ${confirmModal.user?.firstName} ${confirmModal.user?.lastName}? This will delete their profile record.`
                        : confirmModal.type === 'deleteEvent'
                            ? `Are you sure you want to delete the event "${confirmModal.event?.name}"? This action cannot be undone.`
                            : `Are you sure you want to ${confirmModal.newRole === 'admin' ? 'promote' : 'demote'} ${confirmModal.user?.firstName} ${confirmModal.user?.lastName}?`
                    }
                </p>
            </Modal>
        </div>
    );
};

export default Admin;

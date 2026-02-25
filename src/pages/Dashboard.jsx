import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    fetchEvents,
    selectFilteredEvents,
    selectActiveEventCount,
    selectHistoryEventCount,
    setSearchQuery,
    setFilterType,
    setSortOrder,
    setStatusFilter,
    deleteEventById,
    duplicateEvent
} from '../store/slices/eventSlice';
import { showNotification } from '../store/slices/notificationSlice';
import { getUserGuests } from '../services/guestService';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Loading from '../components/ui/Loading';
import Modal from '../components/ui/Modal';
import { FiPlus, FiCalendar, FiMapPin, FiUsers, FiDollarSign, FiEdit, FiTrash2, FiCopy, FiSearch, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { formatDate, getCountdown } from '../utils/dateUtils';
import { SUCCESS_MESSAGES } from '../utils/notifications';
import { getAnnouncement } from '../services/announcementService';

const STATUS_BADGES = {
    active: { label: 'Active', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: FiClock },
    completed: { label: 'Completed', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', icon: FiCheckCircle },
    cancelled: { label: 'Cancelled', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', icon: FiXCircle },
};

const Dashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { userData } = useSelector(state => state.auth);
    const events = useSelector(selectFilteredEvents);
    const activeCount = useSelector(selectActiveEventCount);
    const historyCount = useSelector(selectHistoryEventCount);
    const { loading, searchQuery, filterType, statusFilter } = useSelector(state => state.events);

    const [deleteModal, setDeleteModal] = useState({ isOpen: false, eventId: null, eventName: '' });
    const [eventGuestCounts, setEventGuestCounts] = useState({});
    const [announcement, setAnnouncementData] = useState(null);

    useEffect(() => {
        if (userData?.userId) {
            dispatch(fetchEvents(userData.userId));
            loadGuestCounts();
        }
        // Load system announcement
        getAnnouncement().then(ann => { if (ann) setAnnouncementData(ann); }).catch(() => { });
    }, [dispatch, userData]);

    const loadGuestCounts = async () => {
        if (!userData?.userId) return;
        try {
            const allGuests = await getUserGuests(userData.userId);
            // Group by eventId and count RSVP statuses
            const counts = {};
            allGuests.forEach(g => {
                if (!counts[g.eventId]) counts[g.eventId] = { total: 0, attending: 0, pending: 0 };
                counts[g.eventId].total++;
                if (g.rsvpStatus === 'Attending') counts[g.eventId].attending++;
                if (g.rsvpStatus === 'Pending') counts[g.eventId].pending++;
            });
            setEventGuestCounts(counts);
        } catch (err) {
            // Non-critical — dashboard works without counts
        }
    };

    const handleSearch = (e) => dispatch(setSearchQuery(e.target.value));
    const handleFilterChange = (e) => dispatch(setFilterType(e.target.value));
    const handleSortChange = (e) => dispatch(setSortOrder(e.target.value));
    const handleStatusTab = (status) => dispatch(setStatusFilter(status));

    const handleDeleteClick = (event) => {
        setDeleteModal({ isOpen: true, eventId: event.id, eventName: event.name });
    };

    const confirmDelete = async () => {
        const result = await dispatch(deleteEventById(deleteModal.eventId));
        if (result.success) {
            dispatch(showNotification(SUCCESS_MESSAGES.EVENT_DELETED, 'success'));
        }
        setDeleteModal({ isOpen: false, eventId: null, eventName: '' });
    };

    const handleDuplicate = async (event) => {
        const result = await dispatch(duplicateEvent(event, userData.userId));
        if (result.success) {
            dispatch(showNotification(SUCCESS_MESSAGES.EVENT_DUPLICATED, 'success'));
        }
    };

    if (loading) {
        return <Loading text="Loading events..." />;
    }

    return (
        <div>
            {/* System Announcement Banner */}
            {announcement && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-3">
                    <span className="text-blue-500 text-lg">📢</span>
                    <div>
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300">System Announcement</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-0.5">{announcement.message}</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Welcome{userData?.firstName && `, ${userData.firstName}`}!
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Manage and organize your events
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Active Events</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{activeCount}</p>
                        </div>
                        <FiCalendar className="text-green-500" size={32} />
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">History</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{historyCount}</p>
                        </div>
                        <FiCheckCircle className="text-blue-500" size={32} />
                    </div>
                </Card>

                <Card>
                    <Button
                        variant="primary"
                        size="large"
                        fullWidth
                        onClick={() => navigate('/events/create')}
                        className="flex items-center justify-center gap-2"
                    >
                        <FiPlus size={20} />
                        Create New Event
                    </Button>
                </Card>
            </div>

            {/* Active / History Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <div className="flex space-x-6">
                    <button
                        onClick={() => handleStatusTab('active')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${statusFilter === 'active'
                            ? 'border-green-600 text-green-600 dark:text-green-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                    >
                        <FiClock size={16} />
                        Active Events ({activeCount})
                    </button>
                    <button
                        onClick={() => handleStatusTab('history')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${statusFilter === 'history'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                    >
                        <FiCheckCircle size={16} />
                        History ({historyCount})
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                </div>

                <select
                    value={filterType}
                    onChange={handleFilterChange}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                    <option value="all">All Types</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Corporate Event">Corporate Event</option>
                    <option value="Party">Party</option>
                    <option value="Conference">Conference</option>
                    <option value="Other">Other</option>
                </select>

                <select
                    onChange={handleSortChange}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                    <option value="asc">Date: Soonest First</option>
                    <option value="desc">Date: Latest First</option>
                </select>
            </div>

            {/* Events Grid */}
            {events.length === 0 ? (
                <Card className="text-center py-12">
                    <FiCalendar className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {statusFilter === 'history' ? 'No past events' : 'No events yet'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {statusFilter === 'history'
                            ? 'Completed and cancelled events will appear here'
                            : 'Get started by creating your first event'}
                    </p>
                    {statusFilter !== 'history' && (
                        <Button
                            variant="primary"
                            onClick={() => navigate('/events/create')}
                            className="inline-flex items-center gap-2"
                        >
                            <FiPlus size={20} />
                            Create Event
                        </Button>
                    )}
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => {
                        const countdown = getCountdown(event.date);
                        const status = event.status || 'active';
                        const badge = STATUS_BADGES[status] || STATUS_BADGES.active;
                        const BadgeIcon = badge.icon;
                        const guestInfo = eventGuestCounts[event.id];

                        return (
                            <Card key={event.id} className="hover:shadow-lg transition-shadow">
                                {/* Thumbnail */}
                                {event.thumbnail && (
                                    <div className="mb-3 -mx-6 -mt-6 rounded-t-xl overflow-hidden h-32">
                                        <img src={event.thumbnail} alt={event.name} className="w-full h-full object-cover" />
                                    </div>
                                )}

                                {/* Status badge */}
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}>
                                        <BadgeIcon size={12} />
                                        {badge.label}
                                    </span>
                                    <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                                        {event.type}
                                    </span>
                                </div>

                                {/* Event name */}
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 truncate">
                                    {event.name}
                                </h3>

                                {/* Details */}
                                <div className="space-y-1.5 mb-3 text-sm">
                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                        <FiCalendar className="mr-2 flex-shrink-0" size={14} />
                                        {formatDate(event.date)} at {event.time}
                                    </div>

                                    {event.location && (
                                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                                            <FiMapPin className="mr-2 flex-shrink-0" size={14} />
                                            <span className="truncate">{event.location}</span>
                                        </div>
                                    )}

                                    {/* Guest summary */}
                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                        <FiUsers className="mr-2 flex-shrink-0" size={14} />
                                        {guestInfo
                                            ? `${guestInfo.total} guests (${guestInfo.attending} confirmed)`
                                            : `Capacity: ${event.guestLimit || '—'}`
                                        }
                                    </div>

                                    {/* Budget summary */}
                                    {event.budgetLimit && (
                                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                                            <FiDollarSign className="mr-2 flex-shrink-0" size={14} />
                                            Budget: ${event.budgetLimit}
                                        </div>
                                    )}

                                    {/* Countdown — only for active events */}
                                    {status === 'active' && !countdown.isPast && (
                                        <div className="text-sm font-medium text-primary-600 dark:text-primary-400">
                                            🎉 {countdown.message}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Button
                                        variant="primary"
                                        size="small"
                                        onClick={() => navigate(`/events/${event.id}`)}
                                        className="flex-1 flex items-center justify-center gap-1"
                                    >
                                        <FiEdit size={14} />
                                        View
                                    </Button>

                                    <Button
                                        variant="secondary"
                                        size="small"
                                        onClick={() => handleDuplicate(event)}
                                        className="flex items-center justify-center gap-1"
                                        title="Duplicate event"
                                    >
                                        <FiCopy size={14} />
                                    </Button>

                                    <Button
                                        variant="danger"
                                        size="small"
                                        onClick={() => handleDeleteClick(event)}
                                        className="flex items-center justify-center gap-1"
                                        title="Delete event"
                                    >
                                        <FiTrash2 size={14} />
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, eventId: null, eventName: '' })}
                title="Delete Event"
                footer={
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => setDeleteModal({ isOpen: false, eventId: null, eventName: '' })}
                        >
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </>
                }
            >
                <p className="text-gray-700 dark:text-gray-300">
                    Are you sure you want to delete "{deleteModal.eventName}"? This action cannot be undone and will permanently remove the event and all related data.
                </p>
            </Modal>
        </div>
    );
};

export default Dashboard;

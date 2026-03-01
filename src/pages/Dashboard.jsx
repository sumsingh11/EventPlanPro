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
import { formatDate } from '../utils/dateUtils';
import { SUCCESS_MESSAGES } from '../utils/notifications';
import CountdownTimer from '../components/ui/CountdownTimer';
import { getAnnouncement } from '../services/announcementService';
import { checkEventReminders } from '../services/reminderService';

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
    const [reminderBanners, setReminderBanners] = useState([]);

    // Use ALL user events for reminders — not the tab-filtered list
    const allUserEvents = useSelector(state => state.events.events);

    // Build reminder banners when events load — uses ALL events, not just tab-filtered
    useEffect(() => {
        if (allUserEvents.length === 0) return;
        const dismissed = JSON.parse(localStorage.getItem('epp_dismissed_reminders') || '[]');
        const all = checkEventReminders(allUserEvents);
        setReminderBanners(all.filter(r => !dismissed.includes(r.id)));
    }, [allUserEvents]);

    const dismissReminder = (id) => {
        const saved = JSON.parse(localStorage.getItem('epp_dismissed_reminders') || '[]');
        const next = [...new Set([...saved, id])];
        localStorage.setItem('epp_dismissed_reminders', JSON.stringify(next));
        setReminderBanners(prev => prev.filter(r => r.id !== id));
    };

    useEffect(() => {
        if (userData?.userId) {
            dispatch(fetchEvents(userData.userId));
            loadGuestCounts();
        }
        // Load system announcement
        getAnnouncement().then(ann => {
            if (ann) {
                const STORAGE_KEY = 'eventplanpro_inbox_read';
                const readTimestamp = localStorage.getItem(STORAGE_KEY);
                if (readTimestamp !== ann.updatedAt) setAnnouncementData(ann);
            }
        }).catch(() => { });
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
            {/* Reminder Banners (in-app notifications) */}
            {reminderBanners.map(r => (
                <div key={r.id} className={`mb-3 p-3 rounded-lg flex items-start gap-3 border ${r.urgent ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'}`}>
                    <p className={`flex-1 text-sm font-medium ${r.urgent ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'}`}>{r.message}</p>
                    <button onClick={() => dismissReminder(r.id)} className="text-gray-400 hover:text-gray-600 flex-shrink-0 text-lg leading-none">&times;</button>
                </div>
            ))}

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
                        const status = event.status || 'active';
                        const badge = STATUS_BADGES[status] || STATUS_BADGES.active;
                        const BadgeIcon = badge.icon;
                        const guestInfo = eventGuestCounts[event.id];

                        return (
                            <Card
                                key={event.id}
                                className="hover:shadow-lg transition-shadow overflow-hidden p-0 border-t-0"
                                style={{ backgroundColor: `${event.color}08` }}
                            >
                                {/* Colored header strip — shows event colour prominently */}
                                {!event.thumbnail && (
                                    <div
                                        className="h-14 flex items-end px-5 pb-2"
                                        style={{ background: `linear-gradient(135deg, ${event.color || '#6366f1'} 0%, ${event.color || '#6366f1'}bb 100%)` }}
                                    >
                                        <div className="overflow-hidden">
                                            <p className="text-white font-semibold text-sm leading-tight truncate">{event.name}</p>
                                            <p className="text-white/75 text-[10px] truncate">{event.type}</p>
                                        </div>
                                    </div>
                                )}
                                {/* Thumbnail (replaces header strip when present) */}
                                {event.thumbnail && (
                                    <div className="relative h-32 overflow-hidden">
                                        <img src={event.thumbnail} alt={event.name} className="w-full h-full object-cover" />
                                        <div className="absolute bottom-0 left-0 right-0 px-5 py-2" style={{ background: `linear-gradient(to top, ${event.color || '#6366f1'}cc, transparent)` }}>
                                            <p className="text-white font-semibold text-sm truncate">{event.name}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="p-5">
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

                                        {/* Guest Capacity Counter */}
                                        {event.guestLimit && guestInfo && (
                                            <div className="flex items-center gap-1">
                                                <FiUsers className="flex-shrink-0 text-gray-500" size={14} />
                                                <span className="text-xs font-medium">
                                                    <span className={guestInfo.total >= parseInt(event.guestLimit) ? 'text-red-500' : 'text-green-600 dark:text-green-400'}>
                                                        {guestInfo.total}
                                                    </span>
                                                    <span className="text-gray-400"> / {event.guestLimit} capacity</span>
                                                </span>
                                            </div>
                                        )}

                                        {/* Tags */}
                                        {event.tags && event.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {event.tags.slice(0, 2).map(tag => (
                                                    <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{tag}</span>
                                                ))}
                                                {event.tags.length > 2 && <span className="text-[10px] text-gray-400">+{event.tags.length - 2}</span>}
                                            </div>
                                        )}

                                    </div>

                                    {/* Actions */}
                                    <div className="mt-4 flex gap-2">
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

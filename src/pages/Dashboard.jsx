import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    fetchEvents,
    selectFilteredEvents,
    setSearchQuery,
    setFilterType,
    setSortOrder,
    deleteEventById,
    duplicateEvent
} from '../store/slices/eventSlice';
import { showNotification } from '../store/slices/notificationSlice';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Loading from '../components/ui/Loading';
import Modal from '../components/ui/Modal';
import { FiPlus, FiCalendar, FiMapPin, FiUsers, FiDollarSign, FiCheckCircle, FiEdit, FiTrash2, FiCopy, FiSearch } from 'react-icons/fi';
import { formatDate, getCountdown } from '../utils/dateUtils';
import { SUCCESS_MESSAGES } from '../utils/notifications';

const Dashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { userData } = useSelector(state => state.auth);
    const events = useSelector(selectFilteredEvents);
    const { loading, searchQuery, filterType } = useSelector(state => state.events);

    const [deleteModal, setDeleteModal] = useState({ isOpen: false, eventId: null, eventName: '' });

    useEffect(() => {
        if (userData?.userId) {
            dispatch(fetchEvents(userData.userId));
        }
    }, [dispatch, userData]);

    const handleSearch = (e) => {
        dispatch(setSearchQuery(e.target.value));
    };

    const handleFilterChange = (e) => {
        dispatch(setFilterType(e.target.value));
    };

    const handleSortChange = (e) => {
        dispatch(setSortOrder(e.target.value));
    };

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

    // Quick stats
    const totalEvents = events.length;
    const upcomingEvents = events.filter(e => new Date(e.date) > new Date()).length;

    return (
        <div>
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
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Events</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalEvents}</p>
                        </div>
                        <FiCalendar className="text-primary-500" size={32} />
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Upcoming Events</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{upcomingEvents}</p>
                        </div>
                        <FiCalendar className="text-green-500" size={32} />
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
                        No events yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Get started by creating your first event
                    </p>
                    <Button
                        variant="primary"
                        onClick={() => navigate('/events/create')}
                        className="inline-flex items-center gap-2"
                    >
                        <FiPlus size={20} />
                        Create Event
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => {
                        const countdown = getCountdown(event.date);

                        return (
                            <Card key={event.id} className="hover:shadow-lg transition-shadow">
                                <div className="mb-4">
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                        {event.name}
                                    </h3>
                                    <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                                        {event.type}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                                        <FiCalendar className="mr-2" size={16} />
                                        {formatDate(event.date)} at {event.time}
                                    </div>

                                    {event.location && (
                                        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                                            <FiMapPin className="mr-2" size={16} />
                                            {event.location}
                                        </div>
                                    )}

                                    {!countdown.isPast && (
                                        <div className="text-sm font-medium text-primary-600 dark:text-primary-400">
                                            🎉 {countdown.message}
                                        </div>
                                    )}
                                </div>

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
                                    >
                                        <FiCopy size={14} />
                                    </Button>

                                    <Button
                                        variant="danger"
                                        size="small"
                                        onClick={() => handleDeleteClick(event)}
                                        className="flex items-center justify-center gap-1"
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
                    Are you sure you want to delete "{deleteModal.eventName}"? This action cannot be undone.
                </p>
            </Modal>
        </div>
    );
};

export default Dashboard;

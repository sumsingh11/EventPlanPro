import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getEvent, updateEvent } from '../services/eventService';
import { updateEventStatus } from '../store/slices/eventSlice';
import { fetchEventGuests, clearGuests } from '../store/slices/guestSlice';
import { fetchEventTasks, clearTasks } from '../store/slices/taskSlice';
import { fetchEventBudget, clearBudget } from '../store/slices/budgetSlice';
import { showNotification } from '../store/slices/notificationSlice';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Loading from '../components/ui/Loading';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { FiEdit, FiArrowLeft, FiUsers, FiCheckSquare, FiDollarSign, FiCheckCircle, FiXCircle, FiPrinter, FiImage } from 'react-icons/fi';
import GuestList from '../components/guest/GuestList';
import TaskList from '../components/task/TaskList';
import BudgetOverview from '../components/budget/BudgetOverview';
import EventMedia from '../components/media/EventMedia';
import { formatDate } from '../utils/dateUtils';
import { SUCCESS_MESSAGES } from '../utils/notifications';

const EVENT_TYPES = ['Birthday', 'Wedding', 'Anniversary', 'Corporate Event', 'Party', 'Conference', 'Other'];

const STATUS_LABELS = {
    active: { label: 'Active', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
    completed: { label: 'Completed', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
    cancelled: { label: 'Cancelled', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' },
};

const EventDetail = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userData } = useSelector(state => state.auth);

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [statusModal, setStatusModal] = useState({ open: false, newStatus: null });

    useEffect(() => {
        loadEventData();
        return () => {
            dispatch(clearGuests());
            dispatch(clearTasks());
            dispatch(clearBudget());
        };
    }, [eventId]);

    const loadEventData = async () => {
        try {
            setLoading(true);
            const eventData = await getEvent(eventId);
            setEvent(eventData);
            setFormData(eventData);
            const uid = userData?.userId;
            dispatch(fetchEventGuests(eventId, uid));
            dispatch(fetchEventTasks(eventId, uid));
            dispatch(fetchEventBudget(eventId, uid));
        } catch (error) {
            console.error('Error loading event:', error);
            dispatch(showNotification('Failed to load event', 'error'));
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => setEditMode(true);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            await updateEvent(eventId, formData);
            setEvent(formData);
            setEditMode(false);
            dispatch(showNotification(SUCCESS_MESSAGES.EVENT_UPDATED, 'success'));
        } catch (error) {
            dispatch(showNotification('Failed to update event', 'error'));
        }
    };

    const handleStatusChange = async () => {
        const { newStatus } = statusModal;
        setStatusModal({ open: false, newStatus: null });
        try {
            const result = await dispatch(updateEventStatus(eventId, newStatus));
            if (result.success) {
                setEvent(prev => ({ ...prev, status: newStatus }));
                dispatch(showNotification(`Event marked as ${newStatus}`, 'success'));
            }
        } catch (err) {
            dispatch(showNotification('Failed to update status', 'error'));
        }
    };

    if (loading) {
        return <Loading text="Loading event details..." />;
    }

    if (!event) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 mb-4">Event not found</p>
                <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FiEdit },
        { id: 'guests', label: 'Guests', icon: FiUsers },
        { id: 'tasks', label: 'Tasks', icon: FiCheckSquare },
        { id: 'budget', label: 'Budget', icon: FiDollarSign },
        { id: 'media', label: 'Media', icon: FiImage },
    ];

    const currentStatus = event.status || 'active';
    const statusBadge = STATUS_LABELS[currentStatus] || STATUS_LABELS.active;

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <Button
                    variant="secondary"
                    size="small"
                    onClick={() => navigate('/dashboard')}
                    className="mb-4 flex items-center gap-2"
                >
                    <FiArrowLeft size={16} />
                    Back to Dashboard
                </Button>

                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                {event.name}
                            </h1>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                                {statusBadge.label}
                            </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                            {event.type} • {formatDate(event.date)}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Print Summary */}
                        <Button
                            variant="secondary"
                            size="small"
                            onClick={() => window.print()}
                            className="flex items-center gap-1 print:hidden"
                        >
                            <FiPrinter size={14} />
                            Print Summary
                        </Button>
                        {/* Status action buttons */}
                        {currentStatus === 'active' && (
                            <>
                                <Button
                                    variant="secondary"
                                    size="small"
                                    onClick={() => setStatusModal({ open: true, newStatus: 'completed' })}
                                    className="flex items-center gap-1"
                                >
                                    <FiCheckCircle size={14} />
                                    Mark Completed
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="small"
                                    onClick={() => setStatusModal({ open: true, newStatus: 'cancelled' })}
                                    className="flex items-center gap-1 text-red-600 dark:text-red-400"
                                >
                                    <FiXCircle size={14} />
                                    Cancel Event
                                </Button>
                            </>
                        )}
                        {(currentStatus === 'completed' || currentStatus === 'cancelled') && (
                            <Button
                                variant="secondary"
                                size="small"
                                onClick={() => setStatusModal({ open: true, newStatus: 'active' })}
                                className="flex items-center gap-1"
                            >
                                Reactivate
                            </Button>
                        )}

                        {activeTab === 'overview' && !editMode && currentStatus === 'active' && (
                            <Button variant="primary" onClick={handleEdit} className="flex items-center gap-2">
                                <FiEdit size={16} />
                                Edit Event
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <div className="flex space-x-8 overflow-x-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'overview' && (
                    <Card>
                        {editMode ? (
                            <div>
                                <Input
                                    label="Event Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Event Type
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    >
                                        {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <Input label="Date" type="date" name="date" value={formData.date} onChange={handleChange} />
                                    <Input label="Time" type="time" name="time" value={formData.time} onChange={handleChange} />
                                </div>

                                <Input
                                    label="Location"
                                    name="location"
                                    value={formData.location || ''}
                                    onChange={handleChange}
                                />

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description || ''}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="Add any notes or details..."
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rules / Guidelines</label>
                                    <textarea
                                        name="rules"
                                        value={formData.rules || ''}
                                        onChange={handleChange}
                                        rows={2}
                                        placeholder="e.g., Dress code, parking info..."
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <Input
                                        label="Venue Capacity"
                                        type="number"
                                        name="guestLimit"
                                        value={formData.guestLimit || ''}
                                        onChange={handleChange}
                                    />
                                    <Input
                                        label="Budget Limit ($)"
                                        type="number"
                                        name="budgetLimit"
                                        value={formData.budgetLimit || ''}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="flex gap-4 mt-6">
                                    <Button
                                        variant="secondary"
                                        onClick={() => { setEditMode(false); setFormData(event); }}
                                        fullWidth
                                    >
                                        Cancel
                                    </Button>
                                    <Button variant="primary" onClick={handleSave} fullWidth>
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Event Name</p>
                                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{event.name}</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                                        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{event.type}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Date & Time</p>
                                        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                            {formatDate(event.date)} at {event.time}
                                        </p>
                                    </div>
                                </div>

                                {event.location && (
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                                        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{event.location}</p>
                                    </div>
                                )}

                                {event.description && (
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Description</p>
                                        <p className="text-base text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{event.description}</p>
                                    </div>
                                )}

                                {event.rules && (
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Rules / Guidelines</p>
                                        <p className="text-base text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{event.rules}</p>
                                    </div>
                                )}

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Venue Capacity</p>
                                        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{event.guestLimit || '—'}</p>
                                    </div>
                                    {event.budgetLimit && (
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Budget Limit</p>
                                            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">${event.budgetLimit}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </Card>
                )}

                {activeTab === 'guests' && <GuestList eventId={eventId} venueCapacity={event.guestLimit} event={event} />}
                {activeTab === 'tasks' && <TaskList eventId={eventId} />}
                {activeTab === 'budget' && <BudgetOverview eventId={eventId} />}

                {activeTab === 'media' && (
                    <EventMedia eventId={eventId} userId={userData?.userId} />
                )}
            </div>

            {/* Status Change Confirmation Modal */}
            <Modal
                isOpen={statusModal.open}
                onClose={() => setStatusModal({ open: false, newStatus: null })}
                title={`Mark as ${statusModal.newStatus === 'completed' ? 'Completed' : statusModal.newStatus === 'cancelled' ? 'Cancelled' : 'Active'}?`}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setStatusModal({ open: false, newStatus: null })}>Cancel</Button>
                        <Button variant="primary" onClick={handleStatusChange}>Confirm</Button>
                    </>
                }
            >
                <p className="text-gray-700 dark:text-gray-300">
                    {statusModal.newStatus === 'completed'
                        ? 'This event will be moved to your History tab. You can reactivate it later.'
                        : statusModal.newStatus === 'cancelled'
                            ? 'This event will be marked as cancelled and moved to History. You can reactivate it later.'
                            : 'This event will be moved back to Active events.'}
                </p>
            </Modal>
        </div>
    );
};

export default EventDetail;

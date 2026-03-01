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
import { FiEdit, FiArrowLeft, FiUsers, FiCheckSquare, FiDollarSign, FiCheckCircle, FiXCircle, FiPrinter, FiImage, FiCheck, FiCalendar, FiExternalLink, FiClock } from 'react-icons/fi';

const EVENT_COLORS = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Sky', value: '#0ea5e9' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Teal', value: '#14b8a6' },
];

const EVENT_TAGS = [
    'Rustic', 'Luxury', 'Modern', 'Boho', 'Formal',
    'Minimalist', 'Corporate', 'Traditional', 'Destination', 'Casual', 'Other'
];

import GuestList from '../components/guest/GuestList';
import TaskList from '../components/task/TaskList';
import BudgetOverview from '../components/budget/BudgetOverview';
import EventMedia from '../components/media/EventMedia';
import { formatDate } from '../utils/dateUtils';
import { SUCCESS_MESSAGES } from '../utils/notifications';
import CountdownTimer from '../components/ui/CountdownTimer';

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
        <div className="space-y-6">
            {/* Event Branding Header */}
            <div
                className="relative -mx-4 -mt-4 p-8 md:p-12 text-white rounded-t-xl overflow-hidden shadow-lg"
                style={{ background: `linear-gradient(135deg, ${event.color || '#6366f1'} 0%, ${event.color || '#6366f1'}aa 100%)` }}
            >
                {/* Subtle overlay pattern */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>

                <div className="relative z-10">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors font-medium bg-black/10 hover:bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm"
                    >
                        <FiArrowLeft size={18} /> Back to Dashboard
                    </button>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-md">
                                    {event.name}
                                </h1>
                                <span className="px-3 py-1 text-xs font-bold rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/30 uppercase tracking-wider">
                                    {event.type}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-white/90 text-lg">
                                <span className="flex items-center gap-2">
                                    <FiCalendar className="opacity-75" /> {formatDate(event.date)}
                                </span>
                                {event.time && (
                                    <span className="flex items-center gap-2">
                                        <FiClock className="opacity-75" /> {event.time}
                                    </span>
                                )}
                                <span className="px-2 py-0.5 rounded bg-white/10 border border-white/20 text-xs font-semibold">
                                    ID: {eventId.slice(-6).toUpperCase()}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Button
                                variant="primary"
                                onClick={handleEdit}
                                className="bg-white text-gray-900 border-none hover:bg-white/90 shadow-md font-bold px-6"
                            >
                                <FiEdit size={16} /> Edit Details
                            </Button>
                            <span className={`px-4 py-2 rounded-lg text-sm font-bold shadow-md border border-white/20 backdrop-blur-md ${statusBadge.bg.replace('bg-', 'bg-white/').replace('100', '20') || 'bg-white/20'} text-white`}>
                                {statusBadge.label}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Summary */}
            <div className="flex justify-end pr-4">
                <Button
                    variant="secondary"
                    size="small"
                    onClick={() => window.print()}
                    className="flex items-center gap-1 print:hidden"
                >
                    <FiPrinter size={14} />
                    Print Summary
                </Button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id);
                            setEditMode(false);
                        }}
                        className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="pb-12">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <Card style={{ borderLeft: `6px solid ${event.color || '#6366f1'}` }}>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 italic">Event Overview</h2>
                                    {editMode ? (
                                        <div className="flex gap-2">
                                            <Button variant="secondary" size="small" onClick={() => setEditMode(false)}>Cancel</Button>
                                            <Button variant="primary" size="small" onClick={handleSave}>Save Changes</Button>
                                        </div>
                                    ) : (
                                        currentStatus === 'active' && (
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="secondary"
                                                    size="small"
                                                    onClick={() => setStatusModal({ open: true, newStatus: 'completed' })}
                                                    className="flex items-center gap-1"
                                                >
                                                    <FiCheckCircle size={14} />
                                                    Complete
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    size="small"
                                                    onClick={() => setStatusModal({ open: true, newStatus: 'cancelled' })}
                                                    className="flex items-center gap-1 text-red-600 dark:text-red-400"
                                                >
                                                    <FiXCircle size={14} />
                                                    Cancel
                                                </Button>
                                            </div>
                                        )
                                    )}
                                </div>

                                {editMode ? (
                                    <div className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <Input label="Event Name" name="name" value={formData.name} onChange={handleChange} required />
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Type</label>
                                                <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                                                    {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <Input label="Date" type="date" name="date" value={formData.date} onChange={handleChange} required />
                                            <Input label="Time" type="time" name="time" value={formData.time} onChange={handleChange} />
                                        </div>
                                        <Input label="Location" name="location" value={formData.location} onChange={handleChange} placeholder="Hotel, Park, etc." />
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                                        </div>

                                        {/* Color Picker in Detail Edit */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Event Color Theme</label>
                                            <div className="flex flex-wrap gap-3">
                                                {EVENT_COLORS.map((c) => (
                                                    <button
                                                        key={c.value}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, color: c.value }))}
                                                        className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${formData.color === c.value ? 'border-primary-600 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                                                        style={{ backgroundColor: c.value }}
                                                        title={c.name}
                                                    >
                                                        {formData.color === c.value && <FiCheck className="text-white" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Event Tags</label>
                                            <div className="flex flex-wrap gap-2">
                                                {EVENT_TAGS.map((tag) => {
                                                    const isSelected = (formData.tags || []).includes(tag);
                                                    return (
                                                        <button
                                                            key={tag}
                                                            type="button"
                                                            onClick={() => {
                                                                const currentTags = formData.tags || [];
                                                                const nextTags = isSelected
                                                                    ? currentTags.filter(t => t !== tag)
                                                                    : [...currentTags, tag];
                                                                setFormData(prev => ({ ...prev, tags: nextTags }));
                                                            }}
                                                            className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${isSelected
                                                                    ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                                                                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary-600'
                                                                }`}
                                                        >
                                                            {tag}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                            {event.thumbnail ? (
                                                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                                                    <img src={event.thumbnail} alt={event.name} className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-24 h-24 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 flex-shrink-0 border-2 border-dashed border-primary-200">
                                                    <FiImage size={32} />
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{event.name}</h3>
                                                <p className="text-gray-600 dark:text-gray-400">{event.description || 'No description provided.'}</p>
                                            </div>
                                        </div>

                                        {/* Tags display */}
                                        {event.tags && event.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {event.tags.map(tag => (
                                                    <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-800">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Google Calendar Button */}
                                        <a
                                            href={`https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(event.name)}&dates=${(event.date || '').replace(/-/g, '')}T${(event.time || '0900').replace(':', '')}00/${(event.date || '').replace(/-/g, '')}T${(event.time || '0900').replace(':', '')}00&location=${encodeURIComponent(event.location || '')}&details=${encodeURIComponent(event.description || '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 border-2 border-blue-200 dark:border-blue-800 transition-all hover:scale-105 active:scale-95 w-fit shadow-sm"
                                        >
                                            <FiCalendar size={16} />
                                            Add to Google Calendar
                                            <FiExternalLink size={12} />
                                        </a>

                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</p>
                                                <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-gray-100">
                                                    <span className={`w-2 h-2 rounded-full ${currentStatus === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-400'}`}></span>
                                                    {statusBadge.label}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Capacity</p>
                                                <p className="font-semibold text-gray-900 dark:text-gray-100">{event.guestLimit || 'Unlimited'}</p>
                                            </div>
                                            {event.budgetLimit && (
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Budget</p>
                                                    <p className="font-semibold text-gray-900 dark:text-gray-100">${event.budgetLimit}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="text-center">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 italic">Time Remaining</h3>
                                {currentStatus === 'active' ? (
                                    <CountdownTimer date={event.date} time={event.time} variant="full" />
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 py-4">Event is {currentStatus}</p>
                                )}
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'guests' && <GuestList eventId={eventId} venueCapacity={event.guestLimit} event={event} />}
                {activeTab === 'tasks' && <TaskList eventId={eventId} />}
                {activeTab === 'budget' && <BudgetOverview eventId={eventId} />}
                {activeTab === 'media' && <EventMedia eventId={eventId} userId={userData?.userId} />}
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

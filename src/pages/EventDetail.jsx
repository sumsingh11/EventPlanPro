import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getEvent, updateEvent } from '../services/eventService';
import { fetchEventGuests, clearGuests } from '../store/slices/guestSlice';
import { fetchEventTasks, clearTasks } from '../store/slices/taskSlice';
import { fetchEventBudget, clearBudget } from '../store/slices/budgetSlice';
import { showNotification } from '../store/slices/notificationSlice';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Loading from '../components/ui/Loading';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { FiEdit, FiArrowLeft, FiUsers, FiCheckSquare, FiDollarSign } from 'react-icons/fi';
import GuestList from '../components/guest/GuestList';
import TaskList from '../components/task/TaskList';
import BudgetOverview from '../components/budget/BudgetOverview';
import { formatDate } from '../utils/dateUtils';
import { SUCCESS_MESSAGES } from '../utils/notifications';

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

    useEffect(() => {
        loadEventData();

        return () => {
            // Cleanup
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

            // Load related data
            dispatch(fetchEventGuests(eventId));
            dispatch(fetchEventTasks(eventId));
            dispatch(fetchEventBudget(eventId));
        } catch (error) {
            console.error('Error loading event:', error);
            dispatch(showNotification('Failed to load event', 'error'));
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setEditMode(true);
    };

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
    ];

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

                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            {event.name}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {event.type} • {formatDate(event.date)}
                        </p>
                    </div>

                    {activeTab === 'overview' && !editMode && (
                        <Button variant="primary" onClick={handleEdit} className="flex items-center gap-2">
                            <FiEdit size={16} />
                            Edit Event
                        </Button>
                    )}
                </div>
            </div>



            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <div className="flex space-x-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
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
                                        <option value="Birthday">Birthday</option>
                                        <option value="Wedding">Wedding</option>
                                        <option value="Anniversary">Anniversary</option>
                                        <option value="Corporate Event">Corporate Event</option>
                                        <option value="Party">Party</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <Input
                                        label="Date"
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                    />

                                    <Input
                                        label="Time"
                                        type="time"
                                        name="time"
                                        value={formData.time}
                                        onChange={handleChange}
                                    />
                                </div>

                                <Input
                                    label="Location"
                                    name="location"
                                    value={formData.location || ''}
                                    onChange={handleChange}
                                />

                                <div className="grid md:grid-cols-2 gap-4">
                                    <Input
                                        label="Guest Limit"
                                        type="number"
                                        name="guestLimit"
                                        value={formData.guestLimit || ''}
                                        onChange={handleChange}
                                    />

                                    <Input
                                        label="Budget Limit"
                                        type="number"
                                        name="budgetLimit"
                                        value={formData.budgetLimit || ''}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="flex gap-4 mt-6">
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setEditMode(false);
                                            setFormData(event);
                                        }}
                                        fullWidth
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={handleSave}
                                        fullWidth
                                    >
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

                                <div className="grid md:grid-cols-2 gap-4">
                                    {event.guestLimit && (
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Guest Limit</p>
                                            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{event.guestLimit}</p>
                                        </div>
                                    )}

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

                {activeTab === 'guests' && <GuestList eventId={eventId} />}
                {activeTab === 'tasks' && <TaskList eventId={eventId} />}
                {activeTab === 'budget' && <BudgetOverview eventId={eventId} />}
            </div>
        </div>
    );
};

export default EventDetail;

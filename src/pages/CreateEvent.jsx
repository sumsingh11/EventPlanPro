import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addNewEvent } from '../store/slices/eventSlice';
import { showNotification } from '../store/slices/notificationSlice';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { validateRequired, validateFutureDate } from '../utils/validation';
import { formatDateForInput } from '../utils/dateUtils';
import { SUCCESS_MESSAGES } from '../utils/notifications';

const CreateEvent = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userData } = useSelector(state => state.auth);

    const [formData, setFormData] = useState({
        name: '',
        type: 'Birthday',
        date: '',
        time: '',
        location: '',
        guestLimit: '',
        budgetLimit: '',
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!validateRequired(formData.name)) {
            newErrors.name = 'Event name is required';
        }

        if (!validateRequired(formData.date)) {
            newErrors.date = 'Event date is required';
        }

        if (!validateRequired(formData.time)) {
            newErrors.time = 'Event time is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        const result = await dispatch(addNewEvent(formData, userData.userId));
        setLoading(false);

        if (result.success) {
            dispatch(showNotification(SUCCESS_MESSAGES.EVENT_CREATED, 'success'));
            navigate('/dashboard');
        } else {
            dispatch(showNotification('Failed to create event', 'error'));
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Create New Event
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Fill in the details for your event
                </p>
            </div>

            <Card>
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Event Name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        error={errors.name}
                        placeholder="My Awesome Event"
                        required
                    />

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Event Type <span className="text-red-500">*</span>
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
                            error={errors.date}
                            required
                        />

                        <Input
                            label="Time"
                            type="time"
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
                            error={errors.time}
                            required
                        />
                    </div>

                    <Input
                        label="Location"
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="123 Main St, City, State"
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                        <Input
                            label="Guest Limit"
                            type="number"
                            name="guestLimit"
                            value={formData.guestLimit}
                            onChange={handleChange}
                            placeholder="100"
                            min="1"
                        />

                        <Input
                            label="Budget Limit"
                            type="number"
                            name="budgetLimit"
                            value={formData.budgetLimit}
                            onChange={handleChange}
                            placeholder="5000"
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <div className="flex gap-4 mt-6">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => navigate('/dashboard')}
                            fullWidth
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Event'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default CreateEvent;

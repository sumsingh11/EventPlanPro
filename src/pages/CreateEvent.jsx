import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addNewEvent } from '../store/slices/eventSlice';
import { showNotification } from '../store/slices/notificationSlice';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { validateRequired, validateFutureDate, validateFutureDatetime } from '../utils/validation';
import { SUCCESS_MESSAGES } from '../utils/notifications';
import { FiUpload, FiX, FiCheck } from 'react-icons/fi';

const EVENT_TYPES = ['Birthday', 'Wedding', 'Anniversary', 'Corporate Event', 'Party', 'Conference', 'Other'];

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
    { label: 'Rustic', style: 'Outdoor', budget: 'Budget' },
    { label: 'Luxury', style: 'Beach', budget: 'Premium' },
    { label: 'Modern', style: 'Indoor', budget: 'Mid-Range' },
    { label: 'Boho', style: 'Garden', budget: 'Mid-Range' },
    { label: 'Formal', style: 'Banquet Hall', budget: 'Premium' },
    { label: 'Minimalist', style: 'Home', budget: 'Budget' },
    { label: 'Corporate', style: 'Office', budget: 'Sponsored' },
    { label: 'Traditional', style: 'Community Hall', budget: 'Mid-Range' },
    { label: 'Destination', style: 'Resort', budget: 'Luxury' },
    { label: 'Casual', style: 'Backyard', budget: 'Budget' },
    { label: 'Other', style: 'Custom', budget: 'Flexible' },
];

const CreateEvent = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userData } = useSelector(state => state.auth);

    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        name: '',
        type: 'Birthday',
        date: '',
        time: '',
        location: '',
        description: '',
        rules: '',
        guestLimit: '',
        budgetLimit: '',
        color: '#6366f1',
        tags: [],
    });

    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleColorSelect = (color) => {
        setFormData(prev => ({ ...prev, color }));
    };

    const handleTagToggle = (tag) => {
        setFormData(prev => {
            const exists = prev.tags.includes(tag.label);
            return {
                ...prev,
                tags: exists
                    ? prev.tags.filter(t => t !== tag.label)
                    : [...prev.tags, tag.label],
            };
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 500 * 1024) {
            setErrors(prev => ({ ...prev, thumbnail: 'Image must be smaller than 500KB' }));
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setThumbnail(reader.result);
            setThumbnailPreview(reader.result);
            setErrors(prev => ({ ...prev, thumbnail: '' }));
        };
        reader.readAsDataURL(file);
    };

    const removeThumbnail = () => {
        setThumbnail(null);
        setThumbnailPreview(null);
    };

    const validate = () => {
        const newErrors = {};
        if (!validateRequired(formData.name)) newErrors.name = 'Event name is required';
        if (!validateRequired(formData.date)) {
            newErrors.date = 'Event date is required';
        } else if (!validateFutureDate(formData.date)) {
            newErrors.date = 'Event date cannot be in the past';
        }
        if (!validateRequired(formData.time)) {
            newErrors.time = 'Event time is required';
        } else if (formData.date && !validateFutureDatetime(formData.date, formData.time)) {
            newErrors.time = 'Event date and time must be in the future';
        }
        if (!validateRequired(formData.guestLimit)) newErrors.guestLimit = 'Venue capacity is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        const eventData = { ...formData, thumbnail: thumbnail || null };
        const result = await dispatch(addNewEvent(eventData, userData.userId));
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">Create New Event</h1>
                <p className="text-gray-500 dark:text-gray-400">Fill in the details for your event</p>
            </div>

            <Card>
                <form onSubmit={handleSubmit} className="space-y-1">

                    {/* Thumbnail Upload */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Event Thumbnail</label>
                        {thumbnailPreview ? (
                            <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600">
                                <img src={thumbnailPreview} alt="preview" className="w-full h-full object-cover" />
                                <button type="button" onClick={removeThumbnail} className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full">
                                    <FiX size={14} />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <FiUpload className="text-gray-400 mb-2" size={24} />
                                <span className="text-sm text-gray-500">Click to upload thumbnail (max 500KB)</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                        )}
                        {errors.thumbnail && <p className="text-red-500 text-xs mt-1">{errors.thumbnail}</p>}
                    </div>

                    {/* Event Name */}
                    <Input label="Event Name" type="text" name="name" value={formData.name} onChange={handleChange} error={errors.name} placeholder="My Awesome Event" required />

                    {/* Event Type */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Event Type <span className="text-red-500">*</span>
                        </label>
                        <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                            {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    {/* Date & Time */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Date <span className="text-red-500">*</span>
                            </label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} min={today} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${errors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                        </div>
                        <Input label="Time" type="time" name="time" value={formData.time} onChange={handleChange} error={errors.time} required />
                    </div>

                    {/* Location */}
                    <Input label="Location" type="text" name="location" value={formData.location} onChange={handleChange} placeholder="123 Main St, City, State" />

                    {/* Description */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Add any notes or details about your event..." className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none" />
                    </div>

                    {/* Rules */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rules / Guidelines</label>
                        <textarea name="rules" value={formData.rules} onChange={handleChange} rows={2} placeholder="e.g., Dress code, parking info, dietary restrictions..." className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none" />
                    </div>

                    {/* Venue Capacity & Budget */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Venue Capacity <span className="text-red-500">*</span>
                            </label>
                            <input type="number" name="guestLimit" value={formData.guestLimit} onChange={handleChange} placeholder="100" min="1" className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${errors.guestLimit ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
                            {errors.guestLimit && <p className="text-red-500 text-xs mt-1">{errors.guestLimit}</p>}
                            {formData.guestLimit && (
                                <p className="text-xs text-gray-400 mt-1">Guest count will be tracked against this limit in the Guests tab.</p>
                            )}
                        </div>
                        <Input label="Budget Limit ($)" type="number" name="budgetLimit" value={formData.budgetLimit} onChange={handleChange} placeholder="5000" min="0" step="0.01" />
                    </div>

                    {/* Event Color */}
                    <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Event Color</label>
                        <div className="flex gap-2 flex-wrap">
                            {EVENT_COLORS.map(c => (
                                <button
                                    key={c.value}
                                    type="button"
                                    title={c.name}
                                    onClick={() => handleColorSelect(c.value)}
                                    className="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110"
                                    style={{
                                        backgroundColor: c.value,
                                        borderColor: formData.color === c.value ? '#1e293b' : 'transparent',
                                    }}
                                >
                                    {formData.color === c.value && <FiCheck size={14} color="white" />}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">This color will appear as an accent on your event card.</p>
                    </div>

                    {/* Event Tags */}
                    <div className="mb-5">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Event Tags <span className="text-gray-400 font-normal">(optional)</span></label>
                        <div className="flex flex-wrap gap-2">
                            {EVENT_TAGS.map(tag => {
                                const selected = formData.tags.includes(tag.label);
                                return (
                                    <button
                                        key={tag.label}
                                        type="button"
                                        onClick={() => handleTagToggle(tag)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selected
                                            ? 'bg-primary-600 text-white border-primary-600'
                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-primary-400'}`}
                                    >
                                        {tag.label} · {tag.style} · {tag.budget}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="secondary" onClick={() => navigate('/dashboard')} fullWidth>Cancel</Button>
                        <Button type="submit" variant="primary" fullWidth disabled={loading}>
                            {loading ? 'Creating...' : 'Create Event'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default CreateEvent;

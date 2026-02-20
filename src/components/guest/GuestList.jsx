import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    addNewGuest,
    modifyGuest,
    deleteGuestById,
    setRsvpFilter,
    selectFilteredGuests,
    selectGuestCount
} from '../../store/slices/guestSlice';
import { showNotification } from '../../store/slices/notificationSlice';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { validateEmail, validateRequired } from '../../utils/validation';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../utils/notifications';



const GuestList = ({ eventId }) => {
    const dispatch = useDispatch();
    const { userData } = useSelector(state => state.auth);
    const guests = useSelector(selectFilteredGuests);
    const guestCount = useSelector(selectGuestCount);
    const { rsvpFilter } = useSelector(state => state.guests);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGuest, setEditingGuest] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        rsvpStatus: 'Pending',
    });
    const [errors, setErrors] = useState({});

    const [deleteModal, setDeleteModal] = useState({ isOpen: false, guestId: null, guestName: '' });

    const handleAdd = () => {
        setEditingGuest(null);
        setFormData({ firstName: '', lastName: '', email: '', rsvpStatus: 'Pending' });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleEdit = (guest) => {
        setEditingGuest(guest);
        setFormData({
            firstName: guest.firstName,
            lastName: guest.lastName,
            email: guest.email,
            rsvpStatus: guest.rsvpStatus,
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!validateRequired(formData.firstName)) {
            newErrors.firstName = 'First name is required';
        }

        if (!validateRequired(formData.lastName)) {
            newErrors.lastName = 'Last name is required';
        }

        if (!validateRequired(formData.email)) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Invalid email address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        let result;
        if (editingGuest) {
            result = await dispatch(modifyGuest(editingGuest.id, formData));
            if (result.success) {
                dispatch(showNotification(SUCCESS_MESSAGES.GUEST_UPDATED, 'success'));
            }
        } else {
            result = await dispatch(addNewGuest(formData, eventId, userData.userId));
            if (result.success) {
                dispatch(showNotification(SUCCESS_MESSAGES.GUEST_ADDED, 'success'));
            } else if (result.error && result.error.includes('exists')) {
                dispatch(showNotification(ERROR_MESSAGES.DUPLICATE_GUEST, 'error'));
                return;
            }
        }

        setIsModalOpen(false);
    };

    const handleDelete = async () => {
        await dispatch(deleteGuestById(deleteModal.guestId));
        dispatch(showNotification(SUCCESS_MESSAGES.GUEST_DELETED, 'success'));
        setDeleteModal({ isOpen: false, guestId: null, guestName: '' });
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Guests ({guestCount})
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage your event attendees</p>
                </div>
                <Button
                    variant="primary"
                    onClick={handleAdd}
                    className="flex items-center gap-2"
                >
                    <FiPlus size={16} />
                    Add Guest
                </Button>
            </div>


            {/* RSVP Filter */}
            <div className="mb-4">
                <select
                    value={rsvpFilter}
                    onChange={(e) => dispatch(setRsvpFilter(e.target.value))}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                    <option value="all">All ({guestCount})</option>
                    <option value="Attending">Attending</option>
                    <option value="Not Attending">Not Attending</option>
                    <option value="Pending">Pending</option>
                </select>
            </div>


            {/* Guest Table */}
            {guests.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">No guests added yet</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    RSVP Status
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {guests.map((guest) => (
                                <tr key={guest.id}>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                                        {guest.firstName} {guest.lastName}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {guest.email}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${guest.rsvpStatus === 'Attending' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                                guest.rsvpStatus === 'Not Attending' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                            }`}>
                                            {guest.rsvpStatus}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm space-x-2">
                                        <button
                                            onClick={() => handleEdit(guest)}
                                            className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
                                        >
                                            <FiEdit size={16} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteModal({ isOpen: true, guestId: guest.id, guestName: `${guest.firstName} ${guest.lastName}` })}
                                            className="text-red-600 hover:text-red-700 dark:text-red-400"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}



            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingGuest ? 'Edit Guest' : 'Add Guest'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSubmit}>
                            {editingGuest ? 'Update' : 'Add'}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSubmit}>
                    <Input
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        error={errors.firstName}
                        required
                    />

                    <Input
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        error={errors.lastName}
                        required
                    />

                    <Input
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        required
                    />

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            RSVP Status
                        </label>
                        <select
                            name="rsvpStatus"
                            value={formData.rsvpStatus}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                            <option value="Pending">Pending</option>
                            <option value="Attending">Attending</option>
                            <option value="Not Attending">Not Attending</option>
                        </select>
                    </div>
                </form>
            </Modal>



            {/* Delete Modal */}
            <Modal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, guestId: null, guestName: '' })}
                title="Remove Guest"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setDeleteModal({ isOpen: false, guestId: null, guestName: '' })}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Remove
                        </Button>
                    </>
                }
            >
                <p className="text-gray-700 dark:text-gray-300">
                    Are you sure you want to remove {deleteModal.guestName} from this event?
                </p>
            </Modal>
        </Card>
    );
};

export default GuestList;

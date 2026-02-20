import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleDarkMode, setLastExport } from '../store/slices/settingsSlice';
import { showNotification } from '../store/slices/notificationSlice';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { FiMoon, FiSun, FiDownload, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import { exportEvents, exportGuests, exportExpenses } from '../utils/exportUtils';
import { getUserEvents } from '../services/eventService';
import { getUserGuests } from '../services/guestService';
import { getUserExpenses } from '../services/budgetService';

const Settings = () => {
    const dispatch = useDispatch();
    const { darkMode, lastExport } = useSelector(state => state.settings);
    const { userData } = useSelector(state => state.auth);

    const [resetModal, setResetModal] = useState(false);
    const [exporting, setExporting] = useState(false);

    const handleToggleDarkMode = () => {
        dispatch(toggleDarkMode());
        dispatch(showNotification(`Dark mode ${!darkMode ? 'enabled' : 'disabled'}`, 'success'));
    };

    const handleExportEvents = async () => {
        try {
            setExporting(true);
            const events = await getUserEvents(userData.userId);
            exportEvents(events);
            const timestamp = new Date().toISOString();
            dispatch(setLastExport(timestamp));
            dispatch(showNotification('Events exported successfully', 'success'));
        } catch (error) {
            dispatch(showNotification('Failed to export events', 'error'));
        } finally {
            setExporting(false);
        }
    };

    const handleExportGuests = async () => {
        try {
            setExporting(true);
            const guests = await getUserGuests(userData.userId);
            exportGuests(guests);
            dispatch(showNotification('Guests exported successfully', 'success'));
        } catch (error) {
            dispatch(showNotification('Failed to export guests', 'error'));
        } finally {
            setExporting(false);
        }
    };

    const handleExportExpenses = async () => {
        try {
            setExporting(true);
            const expenses = await getUserExpenses(userData.userId);
            exportExpenses(expenses);
            dispatch(showNotification('Expenses exported successfully', 'success'));
        } catch (error) {
            dispatch(showNotification('Failed to export expenses', 'error'));
        } finally {
            setExporting(false);
        }
    };

    const handleExportAll = async () => {
        await handleExportEvents();
        await handleExportGuests();
        await handleExportExpenses();
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Settings
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Manage your preferences and data
                </p>
            </div>

            {/* User Profile */}
            <Card className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Profile Information
                </h2>
                <div className="space-y-3">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                        <p className="text-base text-gray-900 dark:text-gray-100">
                            {userData?.firstName} {userData?.lastName}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                        <p className="text-base text-gray-900 dark:text-gray-100">{userData?.email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Role</p>
                        <p className="text-base text-gray-900 dark:text-gray-100 capitalize">{userData?.role}</p>
                    </div>
                </div>
            </Card>

            {/* Appearance */}
            <Card className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Appearance
                </h2>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {darkMode ? <FiMoon size={20} /> : <FiSun size={20} />}
                        <div>
                            <p className="text-base text-gray-900 dark:text-gray-100 font-medium">
                                Dark Mode
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {darkMode ? 'Currently enabled' : 'Currently disabled'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleToggleDarkMode}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${darkMode ? 'bg-primary-600' : 'bg-gray-200'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>
            </Card>

            {/* Data Export */}
            <Card className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Export Data
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Download your data as CSV files
                    {lastExport && (
                        <span className="block mt-1">
                            Last export: {new Date(lastExport).toLocaleString()}
                        </span>
                    )}
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                    <Button
                        variant="secondary"
                        onClick={handleExportEvents}
                        disabled={exporting}
                        className="flex items-center justify-center gap-2"
                    >
                        <FiDownload size={16} />
                        Export Events
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={handleExportGuests}
                        disabled={exporting}
                        className="flex items-center justify-center gap-2"
                    >
                        <FiDownload size={16} />
                        Export Guests
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={handleExportExpenses}
                        disabled={exporting}
                        className="flex items-center justify-center gap-2"
                    >
                        <FiDownload size={16} />
                        Export Expenses
                    </Button>

                    <Button
                        variant="primary"
                        onClick={handleExportAll}
                        disabled={exporting}
                        className="flex items-center justify-center gap-2"
                    >
                        <FiDownload size={16} />
                        Export All Data
                    </Button>
                </div>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3 mb-4">
                    <FiAlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                        <h2 className="text-xl font-semibold text-red-900 dark:text-red-100">
                            Danger Zone
                        </h2>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            These actions cannot be undone
                        </p>
                    </div>
                </div>
                <Button
                    variant="danger"
                    onClick={() => setResetModal(true)}
                    className="flex items-center gap-2"
                >
                    <FiTrash2 size={16} />
                    Reset All Application Data
                </Button>
            </Card>

            {/* Reset Confirmation Modal */}
            <Modal
                isOpen={resetModal}
                onClose={() => setResetModal(false)}
                title="Reset All Data"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setResetModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => {
                                setResetModal(false);
                                dispatch(showNotification('Data reset feature coming soon', 'info'));
                            }}
                        >
                            Confirm Reset
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300">
                        Are you absolutely sure you want to reset all data?
                    </p>
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                        <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                            This will permanently delete:
                        </p>
                        <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400 mt-2 space-y-1">
                            <li>All events</li>
                            <li>All guests</li>
                            <li>All tasks</li>
                            <li>All budgets and expenses</li>
                            <li>All settings and preferences</li>
                        </ul>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                        This action cannot be undone.
                    </p>
                </div>
            </Modal>
        </div>
    );
};

export default Settings;

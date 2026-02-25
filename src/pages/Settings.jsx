import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleDarkMode, setLastExport } from '../store/slices/settingsSlice';
import { setUser } from '../store/slices/authSlice';
import { showNotification } from '../store/slices/notificationSlice';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { FiMoon, FiSun, FiDownload, FiTrash2, FiAlertCircle, FiUser, FiLock, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { exportEvents, exportGuests, exportExpenses } from '../utils/exportUtils';
import { getUserEvents } from '../services/eventService';
import { getUserGuests } from '../services/guestService';
import { getUserExpenses } from '../services/budgetService';
import { updateUserProfile, changePassword } from '../services/authService';

const Settings = () => {
    const dispatch = useDispatch();
    const { darkMode, lastExport } = useSelector(state => state.settings);
    const { userData } = useSelector(state => state.auth);

    // Profile edit state
    const [profileEdit, setProfileEdit] = useState(false);
    const [profileData, setProfileData] = useState({
        firstName: userData?.firstName || '',
        lastName: userData?.lastName || '',
    });
    const [profileLoading, setProfileLoading] = useState(false);

    // Password change state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Other state
    const [resetModal, setResetModal] = useState(false);
    const [exporting, setExporting] = useState(false);

    //  Profile update 
    const handleProfileSave = async () => {
        if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
            dispatch(showNotification('First and last name are required', 'error'));
            return;
        }
        try {
            setProfileLoading(true);
            await updateUserProfile(userData.userId, {
                firstName: profileData.firstName.trim(),
                lastName: profileData.lastName.trim(),
            });
            // Update Redux state so Navbar reflects the new name immediately
            dispatch(setUser({
                user: null, // keep existing auth user
                userData: { ...userData, firstName: profileData.firstName.trim(), lastName: profileData.lastName.trim() },
            }));
            setProfileEdit(false);
            dispatch(showNotification('Profile updated successfully', 'success'));
        } catch (error) {
            dispatch(showNotification('Failed to update profile', 'error'));
        } finally {
            setProfileLoading(false);
        }
    };

    //  Password change 
    const validatePassword = () => {
        const errs = {};
        if (!passwordData.currentPassword) errs.currentPassword = 'Current password is required';
        if (!passwordData.newPassword) errs.newPassword = 'New password is required';
        else if (passwordData.newPassword.length < 6) errs.newPassword = 'Password must be at least 6 characters';
        if (passwordData.newPassword !== passwordData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
        setPasswordErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (!validatePassword()) return;
        try {
            setPasswordLoading(true);
            await changePassword(passwordData.currentPassword, passwordData.newPassword);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            dispatch(showNotification('Password changed successfully', 'success'));
        } catch (error) {
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                setPasswordErrors({ currentPassword: 'Current password is incorrect' });
            } else {
                dispatch(showNotification('Failed to change password. Please try again.', 'error'));
            }
        } finally {
            setPasswordLoading(false);
        }
    };

    // Dark mode toggle
    const handleToggleDarkMode = () => {
        dispatch(toggleDarkMode());
        dispatch(showNotification(`Dark mode ${!darkMode ? 'enabled' : 'disabled'}`, 'success'));
    };

    const handleExportEvents = async () => {
        try {
            setExporting(true);
            const events = await getUserEvents(userData.userId);
            exportEvents(events);
            dispatch(setLastExport(new Date().toISOString()));
            dispatch(showNotification('Events exported successfully', 'success'));
        } catch {
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
        } catch {
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
        } catch {
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
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">Settings</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage your account and preferences</p>
            </div>

            {/* ── Profile ── */}
            <Card className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <FiUser className="text-gray-500" size={18} />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Profile Information</h2>
                    </div>
                    {!profileEdit && (
                        <button
                            onClick={() => { setProfileEdit(true); setProfileData({ firstName: userData?.firstName || '', lastName: userData?.lastName || '' }); }}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            <FiEdit2 size={14} /> Edit
                        </button>
                    )}
                </div>

                {profileEdit ? (
                    <div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="First Name"
                                value={profileData.firstName}
                                onChange={e => setProfileData(p => ({ ...p, firstName: e.target.value }))}
                                placeholder="John"
                            />
                            <Input
                                label="Last Name"
                                value={profileData.lastName}
                                onChange={e => setProfileData(p => ({ ...p, lastName: e.target.value }))}
                                placeholder="Doe"
                            />
                        </div>
                        <div className="flex gap-3 mt-4">
                            <Button variant="secondary" size="small" onClick={() => setProfileEdit(false)} className="flex items-center gap-1">
                                <FiX size={14} /> Cancel
                            </Button>
                            <Button variant="primary" size="small" onClick={handleProfileSave} disabled={profileLoading} className="flex items-center gap-1">
                                <FiCheck size={14} /> {profileLoading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Name</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{userData?.firstName} {userData?.lastName}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Email</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{userData?.email}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Role</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">{userData?.role}</span>
                        </div>
                    </div>
                )}
            </Card>


            {/* ── Change Password ── */}
            <Card className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <FiLock className="text-gray-500" size={18} />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Change Password</h2>
                </div>
                <form onSubmit={handlePasswordChange}>
                    <Input
                        label="Current Password"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={e => { setPasswordData(p => ({ ...p, currentPassword: e.target.value })); setPasswordErrors(er => ({ ...er, currentPassword: '' })); }}
                        error={passwordErrors.currentPassword}
                        placeholder="••••••••"
                    />
                    <Input
                        label="New Password"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={e => { setPasswordData(p => ({ ...p, newPassword: e.target.value })); setPasswordErrors(er => ({ ...er, newPassword: '' })); }}
                        error={passwordErrors.newPassword}
                        placeholder="Min. 6 characters"
                    />
                    <Input
                        label="Confirm New Password"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={e => { setPasswordData(p => ({ ...p, confirmPassword: e.target.value })); setPasswordErrors(er => ({ ...er, confirmPassword: '' })); }}
                        error={passwordErrors.confirmPassword}
                        placeholder="••••••••"
                    />
                    <Button type="submit" variant="primary" size="small" disabled={passwordLoading} className="flex items-center gap-1 mt-2">
                        <FiLock size={14} /> {passwordLoading ? 'Changing...' : 'Change Password'}
                    </Button>
                </form>
            </Card>

            {/*  Appearance  */}
            <Card className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Appearance</h2>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {darkMode ? <FiMoon size={18} /> : <FiSun size={18} />}
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Dark Mode</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{darkMode ? 'Currently enabled' : 'Currently disabled'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleToggleDarkMode}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${darkMode ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </Card>

            {/*  Data Export  */}
            <Card className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Export Data</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Download your data as CSV files
                    {lastExport && <span className="block mt-0.5">Last export: {new Date(lastExport).toLocaleString()}</span>}
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <Button variant="secondary" size="small" onClick={handleExportEvents} disabled={exporting} className="flex items-center justify-center gap-2">
                        <FiDownload size={14} /> Events
                    </Button>
                    <Button variant="secondary" size="small" onClick={handleExportGuests} disabled={exporting} className="flex items-center justify-center gap-2">
                        <FiDownload size={14} /> Guests
                    </Button>
                    <Button variant="secondary" size="small" onClick={handleExportExpenses} disabled={exporting} className="flex items-center justify-center gap-2">
                        <FiDownload size={14} /> Expenses
                    </Button>
                    <Button variant="primary" size="small" onClick={handleExportAll} disabled={exporting} className="flex items-center justify-center gap-2">
                        <FiDownload size={14} /> Export All
                    </Button>
                </div>
            </Card>

            {/*  Danger Zone  */}
            <Card className="border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3 mb-4">
                    <FiAlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                    <div>
                        <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">Danger Zone</h2>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">These actions cannot be undone</p>
                    </div>
                </div>
                <Button variant="danger" size="small" onClick={() => setResetModal(true)} className="flex items-center gap-2">
                    <FiTrash2 size={14} /> Reset All Application Data
                </Button>
            </Card>

            {/* Reset Modal */}
            <Modal
                isOpen={resetModal}
                onClose={() => setResetModal(false)}
                title="Reset All Data"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setResetModal(false)}>Cancel</Button>
                        <Button variant="danger" onClick={() => { setResetModal(false); dispatch(showNotification('Data reset feature coming soon', 'info')); }}>
                            Confirm Reset
                        </Button>
                    </>
                }
            >
                <div className="space-y-3">
                    <p className="text-gray-700 dark:text-gray-300">Are you absolutely sure you want to reset all data?</p>
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                        <p className="text-sm text-red-700 dark:text-red-300 font-medium mb-1">This will permanently delete:</p>
                        <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400 space-y-0.5">
                            <li>All events, guests, tasks</li>
                            <li>All budgets and expenses</li>
                            <li>All settings and preferences</li>
                        </ul>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Settings;

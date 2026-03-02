// Inbox page — system announcements for all users
import React, { useEffect, useState } from 'react';
import { getAnnouncement } from '../services/announcementService';
import Card from '../components/ui/Card';
import { FiBell, FiCheckCircle } from 'react-icons/fi';

const STORAGE_KEY = 'eventplanpro_inbox_read';

const Inbox = () => {
    const [announcement, setAnnouncement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRead, setIsRead] = useState(false);

    useEffect(() => {
        const load = async () => {
            const ann = await getAnnouncement();
            setAnnouncement(ann);
            setLoading(false);

            if (ann) {
                
                // Check if this specific announcement has been read
                const readTimestamp = localStorage.getItem(STORAGE_KEY);
                setIsRead(readTimestamp === ann.updatedAt);
            }
        };
        load();
    }, []);

    const markAsRead = () => {
        if (announcement) {
            localStorage.setItem(STORAGE_KEY, announcement.updatedAt);
            setIsRead(true);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8 flex items-center gap-3">
                <FiBell className="text-primary-600" size={28} />
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Inbox</h1>
                    <p className="text-gray-500 dark:text-gray-400">System announcements and notifications</p>
                </div>
            </div>

            {loading ? (
                <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            ) : announcement ? (
                <Card>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl mt-0.5">📢</span>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">System Announcement</p>
                                    {!isRead && (
                                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                            New
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 mb-3">{announcement.message}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                    Posted: {new Date(announcement.updatedAt).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {!isRead && (
                            <button
                                onClick={markAsRead}
                                title="Mark as read"
                                className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 transition-colors"
                            >
                                <FiCheckCircle size={14} />
                                Mark Read
                            </button>
                        )}
                    </div>

                    {isRead && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-1 text-xs text-gray-400">
                            <FiCheckCircle size={12} />
                            Marked as read
                        </div>
                    )}
                </Card>
            ) : (
                <Card>
                    <div className="text-center py-12">
                        <FiBell className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={48} />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No announcements yet</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Check back later for system announcements.</p>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default Inbox;

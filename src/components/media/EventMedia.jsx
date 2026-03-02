import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { FiImage, FiVideo, FiPlus, FiTrash2 } from 'react-icons/fi';
import { showNotification } from '../../store/slices/notificationSlice';
import { useDispatch } from 'react-redux';

const MAX_FILE_SIZE_MB = 1; // 1 MB limit (Firestore doc limit is ~1MB)
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

const EventMedia = ({ eventId, userId }) => {
    const dispatch = useDispatch();
    const [mediaItems, setMediaItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadMedia();
    }, [eventId]);

    const loadMedia = async () => {
        setLoading(true);
        try {
            const mediaRef = collection(db, 'events', eventId, 'media');
            
            // orderBy requires a Firestore index; use a simple getDocs fallback
            let snapshot;
            try {
                const q = query(mediaRef, orderBy('createdAt', 'desc'));
                snapshot = await getDocs(q);
            } catch {
                snapshot = await getDocs(mediaRef);
            }
            const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setMediaItems(items);
        } catch (error) {
            console.error('Error loading media:', error);
            dispatch(showNotification('Failed to load media gallery', 'error'));
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = ''; // reset input right away

        if (file.size > MAX_FILE_SIZE) {
            dispatch(showNotification(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit`, 'error'));
            return;
        }

        setUploading(true);
        const reader = new FileReader();

        reader.onerror = () => {
            dispatch(showNotification('Failed to read file', 'error'));
            setUploading(false);
        };

        reader.onload = async () => {
            try {
                const base64Data = reader.result;
                const type = file.type.startsWith('image/') ? 'image'
                    : file.type.startsWith('video/') ? 'video' : 'other';

                await addDoc(collection(db, 'events', eventId, 'media'), {
                    url: base64Data,
                    type,
                    fileName: file.name,
                    fileSize: file.size,
                    userId: userId || '',
                    createdAt: serverTimestamp(),
                });

                dispatch(showNotification('Media uploaded successfully', 'success'));
                await loadMedia(); // refresh gallery after upload completes
            } catch (error) {
                console.error('Upload error:', error);
                dispatch(showNotification('Failed to upload media', 'error'));
            } finally {
                setUploading(false);
            }
        };

        reader.readAsDataURL(file);
    };

    const handleDelete = async (mediaId) => {
        if (!window.confirm('Are you sure you want to delete this media?')) return;
        try {
            await deleteDoc(doc(db, 'events', eventId, 'media', mediaId));
            dispatch(showNotification('Media deleted', 'success'));
            setMediaItems(prev => prev.filter(m => m.id !== mediaId));
        } catch (error) {
            console.error('Delete error:', error);
            dispatch(showNotification('Failed to delete media', 'error'));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <FiImage className="text-primary-600" />
                    Event Media Gallery
                </h3>
                <label className={`flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg cursor-pointer transition-colors ${uploading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}>
                    <FiPlus size={20} />
                    <span>{uploading ? 'Uploading...' : 'Upload Media'}</span>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                </label>
            </div>

            <p className="text-xs text-gray-400 italic">
                * Files must be under {MAX_FILE_SIZE_MB}MB. Supported: images and videos.
            </p>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading gallery...</div>
            ) : mediaItems.length === 0 ? (
                <Card className="text-center py-12">
                    <FiImage className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-500 font-medium">No photos or videos yet</p>
                    <p className="text-sm text-gray-400 mt-1">Upload memories from your event planning!</p>
                </Card>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {mediaItems.map((item) => (
                        <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            {item.type === 'image' ? (
                                <img
                                    src={item.url}
                                    alt={item.fileName}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center">
                                    <FiVideo size={40} className="text-gray-400" />
                                    <span className="text-[10px] text-gray-500 mt-2 px-2 text-center truncate w-full">{item.fileName}</span>
                                </div>
                            )}

                            <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white text-[10px] truncate">{item.fileName}</p>
                            </div>

                            <button
                                onClick={() => handleDelete(item.id)}
                                className="absolute top-2 right-2 p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete media"
                            >
                                <FiTrash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EventMedia;

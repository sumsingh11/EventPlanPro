import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { FiSend, FiTrash2, FiMessageCircle } from 'react-icons/fi';

const TaskComments = ({ taskId, userId, userName }) => {
    const [comments, setComments] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!taskId) return;
        loadComments();
    }, [taskId]);

    const loadComments = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, 'tasks', taskId, 'comments'),
                orderBy('createdAt', 'desc')
            );
            const snap = await getDocs(q);
            setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch {
            // fallback without orderBy (no index)
            try {
                const snap = await getDocs(collection(db, 'tasks', taskId, 'comments'));
                setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => {
                    const ta = a.createdAt?.seconds || 0;
                    const tb = b.createdAt?.seconds || 0;
                    return tb - ta;
                }));
            } catch { setComments([]); }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim() || submitting) return;
        setSubmitting(true);
        try {
            const docRef = await addDoc(collection(db, 'tasks', taskId, 'comments'), {
                text: text.trim(),
                userId: userId || '',
                userName: userName || 'You',
                createdAt: serverTimestamp(),
            });
            setComments(prev => [{ id: docRef.id, text: text.trim(), userId, userName: userName || 'You', createdAt: null }, ...prev]);
            setText('');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        await deleteDoc(doc(db, 'tasks', taskId, 'comments', commentId));
        setComments(prev => prev.filter(c => c.id !== commentId));
    };

    const formatTime = (ts) => {
        if (!ts?.seconds) return 'Just now';
        return new Date(ts.seconds * 1000).toLocaleString();
    };

    return (
        <div className="mt-3 border-t border-gray-100 dark:border-gray-700 pt-3">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-2">
                <FiMessageCircle size={12} /> Comments ({comments.length})
            </p>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
                <input
                    type="text"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 text-sm px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <button
                    type="submit"
                    disabled={!text.trim() || submitting}
                    className="flex-shrink-0 p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40 transition-colors"
                >
                    <FiSend size={14} />
                </button>
            </form>

            {/* Comment list */}
            {loading ? (
                <p className="text-xs text-gray-400">Loading...</p>
            ) : comments.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No comments yet. Be the first to add one!</p>
            ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                    {comments.map(c => (
                        <div key={c.id} className="group flex items-start gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-900 dark:text-gray-100">{c.text}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{c.userName} · {formatTime(c.createdAt)}</p>
                            </div>
                            {c.userId === userId && (
                                <button
                                    onClick={() => handleDelete(c.id)}
                                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 flex-shrink-0 transition-opacity"
                                >
                                    <FiTrash2 size={12} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TaskComments;

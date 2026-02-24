import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const ANNOUNCEMENT_DOC = 'settings/announcement';

// Get the current system announcement
export const getAnnouncement = async () => {
    try {
        const docSnap = await getDoc(doc(db, ANNOUNCEMENT_DOC));
        if (docSnap.exists()) {
            return docSnap.data();
        }
        return null;
    } catch (error) {
        console.error('Error fetching announcement:', error);
        return null;
    }
};

// Set or update the system announcement (admin only)
export const setAnnouncement = async (message) => {
    try {
        await setDoc(doc(db, ANNOUNCEMENT_DOC), {
            message,
            updatedAt: new Date().toISOString(),
        });
        return { success: true };
    } catch (error) {
        console.error('Error setting announcement:', error);
        throw error;
    }
};

// Clear the announcement
export const clearAnnouncement = async () => {
    try {
        await deleteDoc(doc(db, ANNOUNCEMENT_DOC));
        return { success: true };
    } catch (error) {
        console.error('Error clearing announcement:', error);
        throw error;
    }
};

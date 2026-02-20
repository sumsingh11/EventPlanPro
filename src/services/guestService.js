import {
    collection,
    doc,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

const GUESTS_COLLECTION = 'guests';

// Create guest
export const createGuest = async (guestData, eventId, userId) => {
    try {
        // Check for duplicate email in this event first (client-side check)
        const existingGuests = await getEventGuests(eventId);
        const duplicate = existingGuests.find(g => g.email.toLowerCase() === guestData.email.toLowerCase());

        if (duplicate) {
            throw new Error('A guest with this email already exists for this event');
        }

        const docRef = await addDoc(collection(db, GUESTS_COLLECTION), {
            ...guestData,
            eventId,
            userId,
            guestId: '', // Will be updated with doc ID
            createdAt: serverTimestamp(),
        });

        // Update with the generated ID
        await updateDoc(docRef, { guestId: docRef.id });

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating guest:', error);
        throw error;
    }
};

// Get all guests for an event
export const getEventGuests = async (eventId) => {
    try {
        const q = query(
            collection(db, GUESTS_COLLECTION),
            where('eventId', '==', eventId)
        );

        const querySnapshot = await getDocs(q);
        const guests = [];
        querySnapshot.forEach((doc) => {
            guests.push({ id: doc.id, ...doc.data() });
        });

        return guests;
    } catch (error) {
        console.error('Error fetching guests:', error);
        throw error;
    }
};

// Get all guests for a user
export const getUserGuests = async (userId) => {
    try {
        const q = query(
            collection(db, GUESTS_COLLECTION),
            where('userId', '==', userId)
        );

        const querySnapshot = await getDocs(q);
        const guests = [];
        querySnapshot.forEach((doc) => {
            guests.push({ id: doc.id, ...doc.data() });
        });

        return guests;
    } catch (error) {
        console.error('Error fetching user guests:', error);
        throw error;
    }
};

// Update guest
export const updateGuest = async (guestId, guestData) => {
    try {
        const docRef = doc(db, GUESTS_COLLECTION, guestId);
        await updateDoc(docRef, guestData);

        return { success: true };
    } catch (error) {
        console.error('Error updating guest:', error);
        throw error;
    }
};

// Delete guest
export const deleteGuest = async (guestId) => {
    try {
        await deleteDoc(doc(db, GUESTS_COLLECTION, guestId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting guest:', error);
        throw error;
    }
};

// Get all guests (admin only)
export const getAllGuests = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, GUESTS_COLLECTION));
        const guests = [];
        querySnapshot.forEach((doc) => {
            guests.push({ id: doc.id, ...doc.data() });
        });

        return guests;
    } catch (error) {
        console.error('Error fetching all guests:', error);
        throw error;
    }
};

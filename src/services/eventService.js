import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

const EVENTS_COLLECTION = 'events';

// Create event
export const createEvent = async (eventData, userId) => {
    try {
        const docRef = await addDoc(collection(db, EVENTS_COLLECTION), {
            ...eventData,
            userId,
            eventId: '', // Will be updated with doc ID
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        // Update with the generated ID
        await updateDoc(docRef, { eventId: docRef.id });

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating event:', error);
        throw error;
    }
};

// Get all events for a user
export const getUserEvents = async (userId) => {
    try {
        const q = query(
            collection(db, EVENTS_COLLECTION),
            where('userId', '==', userId),
            orderBy('date', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const events = [];
        querySnapshot.forEach((doc) => {
            events.push({ id: doc.id, ...doc.data() });
        });

        return events;
    } catch (error) {
        console.error('Error fetching events:', error);
        throw error;
    }
};

// Get single event
export const getEvent = async (eventId) => {
    try {
        const docRef = doc(db, EVENTS_COLLECTION, eventId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error('Error fetching event:', error);
        throw error;
    }
};

// Update event
export const updateEvent = async (eventId, eventData) => {
    try {
        const docRef = doc(db, EVENTS_COLLECTION, eventId);
        await updateDoc(docRef, {
            ...eventData,
            updatedAt: serverTimestamp(),
        });

        return { success: true };
    } catch (error) {
        console.error('Error updating event:', error);
        throw error;
    }
};

// Delete event
export const deleteEvent = async (eventId) => {
    try {
        await deleteDoc(doc(db, EVENTS_COLLECTION, eventId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting event:', error);
        throw error;
    }
};

// Get all events (admin only)
export const getAllEvents = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, EVENTS_COLLECTION));
        const events = [];
        querySnapshot.forEach((doc) => {
            events.push({ id: doc.id, ...doc.data() });
        });

        return events;
    } catch (error) {
        console.error('Error fetching all events:', error);
        throw error;
    }
};

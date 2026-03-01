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
import { setBudget } from './budgetService';

const EVENTS_COLLECTION = 'events';

// Create event
export const createEvent = async (eventData, userId) => {
    try {
        const docRef = await addDoc(collection(db, EVENTS_COLLECTION), {
            ...eventData,
            userId,
            eventId: '', // Will be updated with doc ID
            status: eventData.status || 'active',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        // Update with the generated ID
        await updateDoc(docRef, { eventId: docRef.id });

        // If budgetLimit was provided, create the budget document
        if (eventData.budgetLimit && parseFloat(eventData.budgetLimit) > 0) {
            await setBudget(
                { totalBudget: parseFloat(eventData.budgetLimit) },
                docRef.id,
                userId
            );
        }

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating event:', error);
        throw error;
    }
};

// Get all events for a user — falls back to JS sort if the composite index isn't built yet
export const getUserEvents = async (userId) => {
    const COLLECTION = collection(db, EVENTS_COLLECTION);
    try {
        const q = query(COLLECTION, where('userId', '==', userId), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        const events = [];
        querySnapshot.forEach((doc) => events.push({ id: doc.id, ...doc.data() }));
        return events;
    } catch (indexError) {
        // Likely "The query requires an index" — fall back to where-only + JS sort
        console.warn('getUserEvents orderBy failed, falling back to JS sort:', indexError.message);
        try {
            const q2 = query(COLLECTION, where('userId', '==', userId));
            const snapshot2 = await getDocs(q2);
            const events = [];
            snapshot2.forEach((doc) => events.push({ id: doc.id, ...doc.data() }));
            // Sort descending by date in JS
            return events.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        } catch (error) {
            console.error('Error fetching events:', error);
            throw error;
        }
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

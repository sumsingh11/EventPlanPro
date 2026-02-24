import { collection, doc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Get all users (admin only)
export const getAllUsers = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const users = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });
        return users;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

// Update a user's role (admin only)
export const updateUserRole = async (userId, newRole) => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { role: newRole });
        return { success: true };
    } catch (error) {
        console.error('Error updating user role:', error);
        throw error;
    }
};

// Delete a user document from Firestore (admin only)
// Note: This removes the Firestore record only. Firebase Auth account stays.
export const deleteUserAccount = async (userId) => {
    try {
        await deleteDoc(doc(db, 'users', userId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};

// Get system-wide statistics (admin only)
export const getSystemStats = async () => {
    try {
        const [usersSnap, eventsSnap, guestsSnap, tasksSnap, budgetsSnap, expensesSnap] = await Promise.all([
            getDocs(collection(db, 'users')),
            getDocs(collection(db, 'events')),
            getDocs(collection(db, 'guests')),
            getDocs(collection(db, 'tasks')),
            getDocs(collection(db, 'budgets')),
            getDocs(collection(db, 'expenses')),
        ]);

        let totalBudget = 0;
        let totalExpenses = 0;

        budgetsSnap.forEach((doc) => {
            totalBudget += doc.data().totalBudget || 0;
        });

        expensesSnap.forEach((doc) => {
            totalExpenses += doc.data().amount || 0;
        });

        return {
            totalUsers: usersSnap.size,
            totalEvents: eventsSnap.size,
            totalGuests: guestsSnap.size,
            totalTasks: tasksSnap.size,
            totalBudget,
            totalExpenses,
        };
    } catch (error) {
        console.error('Error fetching system stats:', error);
        throw error;
    }
};

// Get all events across all users (admin only)
export const getAllEvents = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'events'));
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

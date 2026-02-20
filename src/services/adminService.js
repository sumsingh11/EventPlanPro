import { collection, getDocs } from 'firebase/firestore';
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

// Get system-wide statistics (admin only)
export const getSystemStats = async () => {
    try {
        // Get counts from all collections
        const [usersSnap, eventsSnap, guestsSnap, tasksSnap, budgetsSnap, expensesSnap] = await Promise.all([
            getDocs(collection(db, 'users')),
            getDocs(collection(db, 'events')),
            getDocs(collection(db, 'guests')),
            getDocs(collection(db, 'tasks')),
            getDocs(collection(db, 'budgets')),
            getDocs(collection(db, 'expenses')),
        ]);

        // Calculate total budget and expenses
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

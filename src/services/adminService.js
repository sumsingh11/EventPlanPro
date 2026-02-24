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

// Admin delete any event
export const adminDeleteEvent = async (eventId) => {
    try {
        await deleteDoc(doc(db, 'events', eventId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting event:', error);
        throw error;
    }
};

// Export system-wide report as CSV
export const exportSystemReport = async () => {
    const [usersSnap, eventsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'events')),
    ]);

    let csv = 'SYSTEM REPORT\n\n';

    csv += 'USERS\nName,Email,Role,Joined\n';
    usersSnap.forEach((d) => {
        const u = d.data();
        const joined = u.createdAt ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : '';
        csv += `"${u.firstName || ''} ${u.lastName || ''}","${u.email || ''}","${u.role || 'user'}","${joined}"\n`;
    });

    csv += '\nEVENTS\nName,Type,Date,Location,Status,Owner\n';
    eventsSnap.forEach((d) => {
        const e = d.data();
        csv += `"${e.name || ''}","${e.type || ''}","${e.date || ''}","${e.location || ''}","${e.status || 'active'}","${e.userId || ''}"\n`;
    });

    // Trigger download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `system_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


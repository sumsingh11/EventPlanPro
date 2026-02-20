import {
    collection,
    doc,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

const TASKS_COLLECTION = 'tasks';

// Create task
export const createTask = async (taskData, eventId, userId) => {
    try {
        const docRef = await addDoc(collection(db, TASKS_COLLECTION), {
            ...taskData,
            eventId,
            userId,
            taskId: '', // Will be updated with doc ID
            status: taskData.status || false,
            createdAt: serverTimestamp(),
        });

        // Update with the generated ID
        await updateDoc(docRef, { taskId: docRef.id });

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating task:', error);
        throw error;
    }
};

// Get all tasks for an event
export const getEventTasks = async (eventId) => {
    try {
        const q = query(
            collection(db, TASKS_COLLECTION),
            where('eventId', '==', eventId),
            orderBy('dueDate', 'asc')
        );

        const querySnapshot = await getDocs(q);
        const tasks = [];
        querySnapshot.forEach((doc) => {
            tasks.push({ id: doc.id, ...doc.data() });
        });

        return tasks;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        throw error;
    }
};

// Get all tasks for a user
export const getUserTasks = async (userId) => {
    try {
        const q = query(
            collection(db, TASKS_COLLECTION),
            where('userId', '==', userId)
        );

        const querySnapshot = await getDocs(q);
        const tasks = [];
        querySnapshot.forEach((doc) => {
            tasks.push({ id: doc.id, ...doc.data() });
        });

        return tasks;
    } catch (error) {
        console.error('Error fetching user tasks:', error);
        throw error;
    }
};

// Update task
export const updateTask = async (taskId, taskData) => {
    try {
        const docRef = doc(db, TASKS_COLLECTION, taskId);
        await updateDoc(docRef, taskData);

        return { success: true };
    } catch (error) {
        console.error('Error updating task:', error);
        throw error;
    }
};

// Toggle task completion
export const toggleTaskStatus = async (taskId, currentStatus) => {
    try {
        const docRef = doc(db, TASKS_COLLECTION, taskId);
        await updateDoc(docRef, { status: !currentStatus });

        return { success: true };
    } catch (error) {
        console.error('Error toggling task status:', error);
        throw error;
    }
};

// Delete task
export const deleteTask = async (taskId) => {
    try {
        await deleteDoc(doc(db, TASKS_COLLECTION, taskId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting task:', error);
        throw error;
    }
};

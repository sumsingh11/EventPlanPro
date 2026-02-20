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
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

const BUDGETS_COLLECTION = 'budgets';
const EXPENSES_COLLECTION = 'expenses';

// Create or update budget for an event
export const setBudget = async (budgetData, eventId, userId) => {
    try {
        // Check if budget already exists for this event
        const existingBudgets = await getEventBudget(eventId);

        if (existingBudgets) {
            // Update existing budget
            await updateDoc(doc(db, BUDGETS_COLLECTION, existingBudgets.id), {
                totalBudget: budgetData.totalBudget,
                updatedAt: serverTimestamp(),
            });
            return { success: true, id: existingBudgets.id };
        } else {
            // Create new budget
            const docRef = await addDoc(collection(db, BUDGETS_COLLECTION), {
                ...budgetData,
                eventId,
                userId,
                budgetId: '', // Will be updated with doc ID
                totalSpent: 0,
                remainingBudget: budgetData.totalBudget,
                updatedAt: serverTimestamp(),
            });

            // Update with the generated ID
            await updateDoc(docRef, { budgetId: docRef.id });

            return { success: true, id: docRef.id };
        }
    } catch (error) {
        console.error('Error setting budget:', error);
        throw error;
    }
};

// Get budget for an event
export const getEventBudget = async (eventId) => {
    try {
        const q = query(
            collection(db, BUDGETS_COLLECTION),
            where('eventId', '==', eventId)
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const budgetDoc = querySnapshot.docs[0];
            return { id: budgetDoc.id, ...budgetDoc.data() };
        }
        return null;
    } catch (error) {
        console.error('Error fetching budget:', error);
        throw error;
    }
};

// Recalculate budget totals based on expenses
export const recalculateBudget = async (budgetId) => {
    try {
        // Get all expenses for this budget
        const q = query(
            collection(db, EXPENSES_COLLECTION),
            where('budgetId', '==', budgetId)
        );

        const querySnapshot = await getDocs(q);
        let totalSpent = 0;

        querySnapshot.forEach((doc) => {
            totalSpent += doc.data().amount;
        });

        // Get budget document to get totalBudget
        const budgetDoc = await getDoc(doc(db, BUDGETS_COLLECTION, budgetId));
        const budgetData = budgetDoc.data();
        const totalBudget = budgetData.totalBudget;
        const remainingBudget = totalBudget - totalSpent;

        // Update budget document
        await updateDoc(doc(db, BUDGETS_COLLECTION, budgetId), {
            totalSpent,
            remainingBudget,
            updatedAt: serverTimestamp(),
        });

        return { success: true, totalSpent, remainingBudget };
    } catch (error) {
        console.error('Error recalculating budget:', error);
        throw error;
    }
};

// EXPENSE OPERATIONS

// Create expense
export const createExpense = async (expenseData, budgetId, eventId, userId) => {
    try {
        const docRef = await addDoc(collection(db, EXPENSES_COLLECTION), {
            ...expenseData,
            budgetId,
            eventId,
            userId,
            expenseId: '', // Will be updated with doc ID
            paidStatus: expenseData.paidStatus || false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        // Update with the generated ID
        await updateDoc(docRef, { expenseId: docRef.id });

        // Recalculate budget
        await recalculateBudget(budgetId);

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating expense:', error);
        throw error;
    }
};

// Get all expenses for a budget
export const getBudgetExpenses = async (budgetId) => {
    try {
        const q = query(
            collection(db, EXPENSES_COLLECTION),
            where('budgetId', '==', budgetId)
        );

        const querySnapshot = await getDocs(q);
        const expenses = [];
        querySnapshot.forEach((doc) => {
            expenses.push({ id: doc.id, ...doc.data() });
        });

        return expenses;
    } catch (error) {
        console.error('Error fetching expenses:', error);
        throw error;
    }
};

// Get all expenses for a user
export const getUserExpenses = async (userId) => {
    try {
        const q = query(
            collection(db, EXPENSES_COLLECTION),
            where('userId', '==', userId)
        );

        const querySnapshot = await getDocs(q);
        const expenses = [];
        querySnapshot.forEach((doc) => {
            expenses.push({ id: doc.id, ...doc.data() });
        });

        return expenses;
    } catch (error) {
        console.error('Error fetching user expenses:', error);
        throw error;
    }
};

// Update expense
export const updateExpense = async (expenseId, expenseData, budgetId) => {
    try {
        const docRef = doc(db, EXPENSES_COLLECTION, expenseId);
        await updateDoc(docRef, {
            ...expenseData,
            updatedAt: serverTimestamp(),
        });

        // Recalculate budget
        await recalculateBudget(budgetId);

        return { success: true };
    } catch (error) {
        console.error('Error updating expense:', error);
        throw error;
    }
};

// Delete expense
export const deleteExpense = async (expenseId, budgetId) => {
    try {
        await deleteDoc(doc(db, EXPENSES_COLLECTION, expenseId));

        // Recalculate budget
        await recalculateBudget(budgetId);

        return { success: true };
    } catch (error) {
        console.error('Error deleting expense:', error);
        throw error;
    }
};

// Get all expenses (admin only)
export const getAllExpenses = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, EXPENSES_COLLECTION));
        const expenses = [];
        querySnapshot.forEach((doc) => {
            expenses.push({ id: doc.id, ...doc.data() });
        });

        return expenses;
    } catch (error) {
        console.error('Error fetching all expenses:', error);
        throw error;
    }
};

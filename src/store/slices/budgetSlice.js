import { createSlice } from '@reduxjs/toolkit';
import {
    setBudget,
    getEventBudget,
    createExpense,
    getBudgetExpenses,
    updateExpense,
    deleteExpense
} from '../../services/budgetService';

const initialState = {
    budget: null,
    expenses: [],
    loading: false,
    error: null,
};

const budgetSlice = createSlice({
    name: 'budget',
    initialState,
    reducers: {
        setBudgetData: (state, action) => {
            state.budget = action.payload;
            state.loading = false;
        },
        setExpenses: (state, action) => {
            state.expenses = action.payload;
            state.loading = false;
        },
        addExpense: (state, action) => {
            state.expenses.push(action.payload);
        },
        updateExpenseInState: (state, action) => {
            const index = state.expenses.findIndex(e => e.id === action.payload.id);
            if (index !== -1) {
                state.expenses[index] = { ...state.expenses[index], ...action.payload };
            }
        },
        removeExpense: (state, action) => {
            state.expenses = state.expenses.filter(e => e.id !== action.payload);
        },
        updateBudgetTotals: (state, action) => {
            if (state.budget) {
                state.budget.totalSpent = action.payload.totalSpent;
                state.budget.remainingBudget = action.payload.remainingBudget;
            }
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        clearBudget: (state) => {
            state.budget = null;
            state.expenses = [];
        },
    },
});

export const {
    setBudgetData,
    setExpenses,
    addExpense,
    updateExpenseInState,
    removeExpense,
    updateBudgetTotals,
    setLoading,
    setError,
    clearBudget,
} = budgetSlice.actions;

// Thunks
export const fetchEventBudget = (eventId) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const budget = await getEventBudget(eventId);
        dispatch(setBudgetData(budget));

        if (budget) {
            const expenses = await getBudgetExpenses(budget.id);
            dispatch(setExpenses(expenses));
        }

        return { success: true };
    } catch (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    }
};

export const createOrUpdateBudget = (budgetData, eventId, userId) => async (dispatch) => {
    try {
        const result = await setBudget(budgetData, eventId, userId);
        const newBudget = {
            ...budgetData,
            id: result.id,
            budgetId: result.id,
            eventId,
            userId,
            totalSpent: 0,
            remainingBudget: budgetData.totalBudget,
        };
        dispatch(setBudgetData(newBudget));
        return { success: true, id: result.id };
    } catch (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    }
};

export const addNewExpense = (expenseData, budgetId, eventId, userId) => async (dispatch) => {
    try {
        const result = await createExpense(expenseData, budgetId, eventId, userId);
        const newExpense = {
            ...expenseData,
            id: result.id,
            expenseId: result.id,
            budgetId,
            eventId,
            userId
        };
        dispatch(addExpense(newExpense));

        // Recalculate budget totals locally
        dispatch(fetchEventBudget(eventId));

        return { success: true, id: result.id };
    } catch (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    }
};

export const modifyExpense = (expenseId, expenseData, budgetId, eventId) => async (dispatch) => {
    try {
        await updateExpense(expenseId, expenseData, budgetId);
        dispatch(updateExpenseInState({ id: expenseId, ...expenseData }));

        // Recalculate budget totals
        dispatch(fetchEventBudget(eventId));

        return { success: true };
    } catch (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    }
};

export const deleteExpenseById = (expenseId, budgetId, eventId) => async (dispatch) => {
    try {
        await deleteExpense(expenseId, budgetId);
        dispatch(removeExpense(expenseId));

        // Recalculate budget totals
        dispatch(fetchEventBudget(eventId));

        return { success: true };
    } catch (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    }
};

// Selectors
export const selectBudgetExceeded = (state) => {
    if (!state.budget.budget) return false;
    return state.budget.budget.totalSpent > state.budget.budget.totalBudget;
};

export default budgetSlice.reducer;

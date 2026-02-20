import { createSlice } from '@reduxjs/toolkit';
import { createTask, getEventTasks, updateTask, toggleTaskStatus, deleteTask } from '../../services/taskService';

const initialState = {
    tasks: [],
    loading: false,
    error: null,
    statusFilter: 'all', // 'all', 'pending', 'completed'
};

const taskSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        setTasks: (state, action) => {
            state.tasks = action.payload;
            state.loading = false;
        },
        addTask: (state, action) => {
            state.tasks.push(action.payload);
        },
        updateTaskInState: (state, action) => {
            const index = state.tasks.findIndex(t => t.id === action.payload.id);
            if (index !== -1) {
                state.tasks[index] = { ...state.tasks[index], ...action.payload };
            }
        },
        removeTask: (state, action) => {
            state.tasks = state.tasks.filter(t => t.id !== action.payload);
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        setStatusFilter: (state, action) => {
            state.statusFilter = action.payload;
        },
        clearTasks: (state) => {
            state.tasks = [];
        },
    },
});

export const {
    setTasks,
    addTask,
    updateTaskInState,
    removeTask,
    setLoading,
    setError,
    setStatusFilter,
    clearTasks,
} = taskSlice.actions;

// Thunks
export const fetchEventTasks = (eventId) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const tasks = await getEventTasks(eventId);
        dispatch(setTasks(tasks));
        return { success: true };
    } catch (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    }
};

export const addNewTask = (taskData, eventId, userId) => async (dispatch) => {
    try {
        const result = await createTask(taskData, eventId, userId);
        const newTask = { ...taskData, id: result.id, taskId: result.id, eventId, userId, status: false };
        dispatch(addTask(newTask));
        return { success: true, id: result.id };
    } catch (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    }
};

export const modifyTask = (taskId, taskData) => async (dispatch) => {
    try {
        await updateTask(taskId, taskData);
        dispatch(updateTaskInState({ id: taskId, ...taskData }));
        return { success: true };
    } catch (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    }
};

export const toggleTask = (taskId, currentStatus) => async (dispatch) => {
    try {
        await toggleTaskStatus(taskId, currentStatus);
        dispatch(updateTaskInState({ id: taskId, status: !currentStatus }));
        return { success: true };
    } catch (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    }
};

export const deleteTaskById = (taskId) => async (dispatch) => {
    try {
        await deleteTask(taskId);
        dispatch(removeTask(taskId));
        return { success: true };
    } catch (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    }
};

// Selectors
export const selectFilteredTasks = (state) => {
    if (state.tasks.statusFilter === 'all') {
        return state.tasks.tasks;
    } else if (state.tasks.statusFilter === 'completed') {
        return state.tasks.tasks.filter(task => task.status === true);
    } else if (state.tasks.statusFilter === 'pending') {
        return state.tasks.tasks.filter(task => task.status === false);
    }
    return state.tasks.tasks;
};

export const selectTaskProgress = (state) => {
    const total = state.tasks.tasks.length;
    if (total === 0) return 0;
    const completed = state.tasks.tasks.filter(t => t.status === true).length;
    return Math.round((completed / total) * 100);
};

export default taskSlice.reducer;

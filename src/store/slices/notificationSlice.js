import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    notifications: [],
};

let nextId = 1;

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        addNotification: (state, action) => {
            state.notifications.push({
                id: nextId++,
                ...action.payload,
                timestamp: Date.now(),
            });
        },
        removeNotification: (state, action) => {
            state.notifications = state.notifications.filter(n => n.id !== action.payload);
        },
        clearAllNotifications: (state) => {
            state.notifications = [];
        },
    },
});

export const { addNotification, removeNotification, clearAllNotifications } = notificationSlice.actions;

// Helper thunk for showing notifications
export const showNotification = (message, type = 'info') => (dispatch) => {
    dispatch(addNotification({ message, type }));

    // Auto-dismiss after 5 seconds
    const id = nextId - 1;
    setTimeout(() => {
        dispatch(removeNotification(id));
    }, 5000);
};

export default notificationSlice.reducer;

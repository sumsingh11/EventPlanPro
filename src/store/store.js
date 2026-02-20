import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import eventReducer from './slices/eventSlice';
import guestReducer from './slices/guestSlice';
import taskReducer from './slices/taskSlice';
import budgetReducer from './slices/budgetSlice';
import settingsReducer from './slices/settingsSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        events: eventReducer,
        guests: guestReducer,
        tasks: taskReducer,
        budget: budgetReducer,
        settings: settingsReducer,
        notifications: notificationReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: ['auth/setUser'],
                // Ignore these field paths in all actions
                ignoredActionPaths: ['payload.timestamp', 'payload.createdAt', 'payload.updatedAt'],
                // Ignore these paths in the state
                ignoredPaths: ['auth.user'],
            },
        }),
});

export default store;

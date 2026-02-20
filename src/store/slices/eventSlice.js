import { createSlice } from '@reduxjs/toolkit';
import { createEvent, getUserEvents, updateEvent, deleteEvent } from '../../services/eventService';

const initialState = {
    events: [],
    currentEvent: null,
    loading: false,
    error: null,
    searchQuery: '',
    filterType: 'all',
    sortBy: 'date', // 'date', 'name'
    sortOrder: 'asc', // 'asc', 'desc'
};

const eventSlice = createSlice({
    name: 'events',
    initialState,
    reducers: {
        setEvents: (state, action) => {
            state.events = action.payload;
            state.loading = false;
        },
        setCurrentEvent: (state, action) => {
            state.currentEvent = action.payload;
        },
        addEvent: (state, action) => {
            state.events.push(action.payload);
        },
        updateEventInState: (state, action) => {
            const index = state.events.findIndex(e => e.id === action.payload.id);
            if (index !== -1) {
                state.events[index] = action.payload;
            }
        },
        removeEvent: (state, action) => {
            state.events = state.events.filter(e => e.id !== action.payload);
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
        },
        setFilterType: (state, action) => {
            state.filterType = action.payload;
        },
        setSortBy: (state, action) => {
            state.sortBy = action.payload;
        },
        setSortOrder: (state, action) => {
            state.sortOrder = action.payload;
        },
    },
});

export const {
    setEvents,
    setCurrentEvent,
    addEvent,
    updateEventInState,
    removeEvent,
    setLoading,
    setError,
    setSearchQuery,
    setFilterType,
    setSortBy,
    setSortOrder,
} = eventSlice.actions;

// Thunks
export const fetchEvents = (userId) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const events = await getUserEvents(userId);
        dispatch(setEvents(events));
        return { success: true };
    } catch (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    }
};

export const addNewEvent = (eventData, userId) => async (dispatch) => {
    try {
        const result = await createEvent(eventData, userId);
        const newEvent = { ...eventData, id: result.id, eventId: result.id };
        dispatch(addEvent(newEvent));
        return { success: true, id: result.id };
    } catch (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    }
};

export const modifyEvent = (eventId, eventData) => async (dispatch) => {
    try {
        await updateEvent(eventId, eventData);
        dispatch(updateEventInState({ id: eventId, ...eventData }));
        return { success: true };
    } catch (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    }
};

export const deleteEventById = (eventId) => async (dispatch) => {
    try {
        await deleteEvent(eventId);
        dispatch(removeEvent(eventId));
        return { success: true };
    } catch (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    }
};

export const duplicateEvent = (eventData, userId) => async (dispatch) => {
    try {
        const newEventData = {
            ...eventData,
            name: `${eventData.name} (Copy)`,
        };
        delete newEventData.id;
        delete newEventData.eventId;
        delete newEventData.createdAt;
        delete newEventData.updatedAt;

        const result = await createEvent(newEventData, userId);
        const newEvent = { ...newEventData, id: result.id, eventId: result.id };
        dispatch(addEvent(newEvent));
        return { success: true, id: result.id };
    } catch (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    }
};

// Selectors
export const selectFilteredEvents = (state) => {
    let filtered = [...state.events.events];

    // Apply search
    if (state.events.searchQuery) {
        filtered = filtered.filter(event =>
            event.name.toLowerCase().includes(state.events.searchQuery.toLowerCase())
        );
    }

    // Apply filter
    if (state.events.filterType !== 'all') {
        filtered = filtered.filter(event => event.type === state.events.filterType);
    }

    // Apply sort
    filtered.sort((a, b) => {
        if (state.events.sortBy === 'date') {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return state.events.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        } else if (state.events.sortBy === 'name') {
            return state.events.sortOrder === 'asc'
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        }
        return 0;
    });

    return filtered;
};

export default eventSlice.reducer;

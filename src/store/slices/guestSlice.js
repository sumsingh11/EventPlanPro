import { createSlice } from '@reduxjs/toolkit';
import { createGuest, getEventGuests, updateGuest, deleteGuest } from '../../services/guestService';

const initialState = {
    guests: [],
    loading: false,
    error: null,
    rsvpFilter: 'all', // 'all', 'Attending', 'Not Attending', 'Pending'
};

const guestSlice = createSlice({
    name: 'guests',
    initialState,
    reducers: {
        setGuests: (state, action) => {
            state.guests = action.payload;
            state.loading = false;
        },
        addGuest: (state, action) => {
            state.guests.push(action.payload);
        },
        updateGuestInState: (state, action) => {
            const index = state.guests.findIndex(g => g.id === action.payload.id);
            if (index !== -1) {
                state.guests[index] = { ...state.guests[index], ...action.payload };
            }
        },
        removeGuest: (state, action) => {
            state.guests = state.guests.filter(g => g.id !== action.payload);
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        setRsvpFilter: (state, action) => {
            state.rsvpFilter = action.payload;
        },
        clearGuests: (state) => {
            state.guests = [];
        },
    },
});

export const {
    setGuests,
    addGuest,
    updateGuestInState,
    removeGuest,
    setLoading,
    setError,
    setRsvpFilter,
    clearGuests,
} = guestSlice.actions;

// Thunks
export const fetchEventGuests = (eventId) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const guests = await getEventGuests(eventId);
        dispatch(setGuests(guests));
        return { success: true };
    } catch (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    }
};

export const addNewGuest = (guestData, eventId, userId) => async (dispatch) => {
    try {
        const result = await createGuest(guestData, eventId, userId);
        const newGuest = { ...guestData, id: result.id, guestId: result.id, eventId, userId };
        dispatch(addGuest(newGuest));
        return { success: true, id: result.id };
    } catch (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    }
};

export const modifyGuest = (guestId, guestData) => async (dispatch) => {
    try {
        await updateGuest(guestId, guestData);
        dispatch(updateGuestInState({ id: guestId, ...guestData }));
        return { success: true };
    } catch (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    }
};

export const deleteGuestById = (guestId) => async (dispatch) => {
    try {
        await deleteGuest(guestId);
        dispatch(removeGuest(guestId));
        return { success: true };
    } catch (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    }
};

// Selectors
export const selectFilteredGuests = (state) => {
    if (state.guests.rsvpFilter === 'all') {
        return state.guests.guests;
    }
    return state.guests.guests.filter(guest => guest.rsvpStatus === state.guests.rsvpFilter);
};

export const selectGuestCount = (state) => {
    return state.guests.guests.length;
};

export const selectAttendingCount = (state) => {
    return state.guests.guests.filter(g => g.rsvpStatus === 'Attending').length;
};

export default guestSlice.reducer;

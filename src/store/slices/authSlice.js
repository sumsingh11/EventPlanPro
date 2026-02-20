import { createSlice } from '@reduxjs/toolkit';
import { loginUser, registerUser, logoutUser, getUserData } from '../../services/authService';

const initialState = {
    user: null,
    userData: null,
    isAuthenticated: false,
    loading: true, // Start as true while Firebase initializes
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action) => {
            if (action.payload === null) {
                // Handle logout case
                state.user = null;
                state.userData = null;
                state.isAuthenticated = false;
                state.loading = false;
                state.error = null;
            } else {
                // Handle login case
                state.user = action.payload.user;
                state.userData = action.payload.userData;
                state.isAuthenticated = !!action.payload.user;
                state.loading = false;
                state.error = null;
            }
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        clearError: (state) => {
            state.error = null;
        },
        logout: (state) => {
            state.user = null;
            state.userData = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
        },
    },
});

export const { setUser, setLoading, setError, clearError, logout } = authSlice.actions;

// Thunks
export const login = (email, password) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const result = await loginUser(email, password);
        dispatch(setUser({ user: result.user, userData: result.userData }));
        return { success: true };
    } catch (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    }
};

export const register = (userData) => async (dispatch) => {
    try {
        dispatch(setLoading(true));
        const result = await registerUser(userData);
        const fullUserData = await getUserData(result.user.uid);
        dispatch(setUser({ user: result.user, userData: fullUserData }));
        return { success: true };
    } catch (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    }
};

export const signOut = () => async (dispatch) => {
    try {
        await logoutUser();
        dispatch(logout());
        return { success: true };
    } catch (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    }
};

export const fetchUserData = (userId) => async (dispatch) => {
    try {
        const userData = await getUserData(userId);
        dispatch(setUser({ user: { uid: userId }, userData }));
        return { success: true };
    } catch (error) {
        dispatch(setError(error.message));
        return { success: false, error: error.message };
    }
};

export default authSlice.reducer;

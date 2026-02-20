import { createSlice } from '@reduxjs/toolkit';
import { storage } from '../../utils/localStorage';

const initialState = {
    darkMode: storage.getDarkMode(),
    lastExport: storage.getLastExport(),
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        toggleDarkMode: (state) => {
            state.darkMode = !state.darkMode;
            storage.setDarkMode(state.darkMode);

            // Apply dark mode class to document
            if (state.darkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        },
        setDarkMode: (state, action) => {
            state.darkMode = action.payload;
            storage.setDarkMode(state.darkMode);

            // Apply dark mode class to document
            if (state.darkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        },
        setLastExport: (state, action) => {
            state.lastExport = action.payload;
            storage.setLastExport(action.payload);
        },
    },
});

export const { toggleDarkMode, setDarkMode, setLastExport } = settingsSlice.actions;

export default settingsSlice.reducer;

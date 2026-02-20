// LocalStorage utility for UI preferences only
// IMPORTANT: NOT storing event-related data in localStorage

const STORAGE_KEYS = {
    DARK_MODE: 'eventplanpro_dark_mode',
    LAST_EXPORT: 'eventplanpro_last_export',
};

export const storage = {
    // Dark mode preference
    getDarkMode: () => {
        const value = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
        return value === 'true';
    },

    setDarkMode: (isDark) => {
        localStorage.setItem(STORAGE_KEYS.DARK_MODE, isDark.toString());
    },

    // Last export timestamp
    getLastExport: () => {
        return localStorage.getItem(STORAGE_KEYS.LAST_EXPORT);
    },

    setLastExport: (timestamp) => {
        localStorage.setItem(STORAGE_KEYS.LAST_EXPORT, timestamp);
    },

    // Clear all preferences
    clearAll: () => {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    },
};

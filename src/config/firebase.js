// Firebase Configuration
// Importing the functions needed from the SDKs
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Web app's Firebase configuration
// Note: Firebase client-side API keys are safe to include in source code.
// Security is enforced by Firebase Security Rules, not by hiding these keys.
const firebaseConfig = {
    apiKey: "AIzaSyAGaPQGhxxDGLIYeBZSjOJNaB3hJBMjPGg",
    authDomain: "eventplanpro-9b946.firebaseapp.com",
    projectId: "eventplanpro-9b946",
    storageBucket: "eventplanpro-9b946.firebasestorage.app",
    messagingSenderId: "15523434345",
    appId: "1:15523434345:web:73788651b594e775eeb7f8",
    measurementId: "G-V118XHKJRW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore — connect to the named 'production' database
export const db = getFirestore(app, 'production');

export default app;

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Register new user
export const registerUser = async (userData) => {
    try {
        const { email, password, firstName, lastName, role = 'user' } = userData;

        // Creating user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Creating user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            userId: user.uid,
            firstName,
            lastName,
            email,
            role,
            createdAt: serverTimestamp(),
        });

        return { success: true, user };
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};


// Login user
export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();

        return { success: true, user, userData };
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

// Logout user
export const logoutUser = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};

// Get current user data from Firestore
export const getUserData = async (userId) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            return userDoc.data();
        }
        return null;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
};

// Listen to auth state changes
export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Register new user
export const registerUser = async (userData) => {
    try {
        const { email, password, firstName, lastName, role = 'user' } = userData;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

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

// Update user profile (name fields) in Firestore
export const updateUserProfile = async (userId, profileData) => {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            ...profileData,
            updatedAt: serverTimestamp(),
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};

// Change password — requires re-authentication first
export const changePassword = async (currentPassword, newPassword) => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No authenticated user');

        // Re-authenticate to confirm identity before password change
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);

        // Now update password
        await updatePassword(user, newPassword);
        return { success: true };
    } catch (error) {
        console.error('Error changing password:', error);
        throw error;
    }
};

// Listen to auth state changes
export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};

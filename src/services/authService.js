import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';

// Google Sign In
export const googleSignIn = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if user exists in Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        let userData;
        if (!userDoc.exists()) {
            // Create user document for first-time Google sign-in
            const nameParts = user.displayName ? user.displayName.split(' ') : ['User', ''];
            userData = {
                userId: user.uid,
                firstName: nameParts[0] || 'User',
                lastName: nameParts.slice(1).join(' ') || '',
                email: user.email,
                role: 'user',
                createdAt: serverTimestamp(),
            };
            await setDoc(doc(db, 'users', user.uid), userData);
        } else {
            userData = userDoc.data();
        }

        return { success: true, user, userData };
    } catch (error) {
        console.error('Google Sign-In error:', error);
        throw error;
    }
};

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

// Login user — requires a registered Firestore user document to exist
export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (!userDoc.exists()) {
            // Auth account exists but no Firestore profile — force them to register
            await signOut(auth);
            throw new Error('No account found. Please register first.');
        }

        return { success: true, user, userData: userDoc.data() };
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

// ensureUserDocument — only used to check existence, never auto-creates
export const ensureUserDocument = async (userId) => {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) return userDoc.data();
    // No document = user deleted from DB without re-registering; return null so caller handles it
    return null;
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

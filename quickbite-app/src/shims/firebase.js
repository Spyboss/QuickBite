/**
 * Shim for Firebase
 * 
 * This file provides empty implementations of the Firebase functions and components
 * that are being imported by the application.
 */

// Create empty Firebase app
export const initializeApp = () => ({
  name: 'shim-app',
  options: {},
  automaticDataCollectionEnabled: false
});

// Create empty Firebase auth
export const getAuth = () => ({
  app: initializeApp(),
  currentUser: null,
  languageCode: 'en',
  settings: {},
  tenantId: null
});

// Create empty Firebase messaging
export const getMessaging = () => ({
  app: initializeApp()
});

// Create empty Firebase functions
export const signInWithEmailAndPassword = async () => ({
  user: {
    uid: 'shim-user-id',
    email: 'shim@example.com',
    emailVerified: false,
    displayName: 'Shim User',
    photoURL: null,
    phoneNumber: null,
    isAnonymous: false,
    tenantId: null,
    providerData: [],
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString()
    }
  }
});

export const createUserWithEmailAndPassword = signInWithEmailAndPassword;
export const signOut = async () => {};
export const onAuthStateChanged = () => () => {};
export const sendPasswordResetEmail = async () => {};
export const updateProfile = async () => {};
export const updateEmail = async () => {};
export const updatePassword = async () => {};
export const deleteUser = async () => {};
export const reauthenticateWithCredential = async () => {};
export const EmailAuthProvider = {
  credential: (email, password) => ({ email, password })
};

// Create empty Firebase messaging functions
export const getToken = async () => 'shim-token';
export const onMessage = () => () => {};

// Create empty Firebase analytics
export const getAnalytics = () => ({
  app: initializeApp()
});

export const logEvent = () => {};

// Export default object
export default {
  initializeApp,
  getAuth,
  getMessaging,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  getToken,
  onMessage,
  getAnalytics,
  logEvent
};

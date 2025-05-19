/**
 * Type definitions for Firebase shim
 */

// Firebase app
export function initializeApp(config?: any): any;

// Firebase auth
export function getAuth(app?: any): any;
export function signInWithEmailAndPassword(auth: any, email: string, password: string): Promise<any>;
export function createUserWithEmailAndPassword(auth: any, email: string, password: string): Promise<any>;
export function signOut(auth: any): Promise<void>;
export function onAuthStateChanged(auth: any, callback: (user: any) => void): () => void;
export function sendPasswordResetEmail(auth: any, email: string): Promise<void>;
export function updateProfile(user: any, profile: any): Promise<void>;
export function updateEmail(user: any, email: string): Promise<void>;
export function updatePassword(user: any, password: string): Promise<void>;
export function deleteUser(user: any): Promise<void>;
export function reauthenticateWithCredential(user: any, credential: any): Promise<any>;
export const EmailAuthProvider: {
  credential: (email: string, password: string) => any;
};

// Firebase messaging
export function getMessaging(app?: any): any;
export function getToken(messaging: any, options?: any): Promise<string>;
export function onMessage(messaging: any, callback: (payload: any) => void): () => void;

// Firebase analytics
export function getAnalytics(app?: any): any;
export function logEvent(analytics: any, eventName: string, eventParams?: any): void;

// Default export
declare const _default: {
  initializeApp: typeof initializeApp;
  getAuth: typeof getAuth;
  getMessaging: typeof getMessaging;
  signInWithEmailAndPassword: typeof signInWithEmailAndPassword;
  createUserWithEmailAndPassword: typeof createUserWithEmailAndPassword;
  signOut: typeof signOut;
  onAuthStateChanged: typeof onAuthStateChanged;
  sendPasswordResetEmail: typeof sendPasswordResetEmail;
  updateProfile: typeof updateProfile;
  updateEmail: typeof updateEmail;
  updatePassword: typeof updatePassword;
  deleteUser: typeof deleteUser;
  reauthenticateWithCredential: typeof reauthenticateWithCredential;
  EmailAuthProvider: typeof EmailAuthProvider;
  getToken: typeof getToken;
  onMessage: typeof onMessage;
  getAnalytics: typeof getAnalytics;
  logEvent: typeof logEvent;
};
export default _default;

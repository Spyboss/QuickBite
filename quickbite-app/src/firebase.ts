// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging"; // Import getMessaging
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCc_BJGomzB4LYZsIVkHmkc9_udYpLa2cU",
  authDomain: "quickbite-adfa4.firebaseapp.com",
  projectId: "quickbite-adfa4",
  storageBucket: "quickbite-adfa4.firebasestorage.app",
  messagingSenderId: "1056634975866",
  appId: "1:1056634975866:web:703a455045484d7c88adc3",
  measurementId: "G-G9N7N776X2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
export const messaging = getMessaging(app);

// You can also initialize other Firebase services here if needed, e.g.:
// import { getAnalytics } from "firebase/analytics";
// const analytics = getAnalytics(app);

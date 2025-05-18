// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
try {
  importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

  // Initialize the Firebase app in the service worker by passing in
  // your app's Firebase config object.
  // https://firebase.google.com/docs/web/setup#config-object
  firebase.initializeApp({
    apiKey: "AIzaSyCc_BJGomzB4LYZsIVkHmkc9_udYpLa2cU",
    authDomain: "quickbite-adfa4.firebaseapp.com",
    projectId: "quickbite-adfa4",
    storageBucket: "quickbite-adfa4.firebasestorage.app",
    messagingSenderId: "1056634975866",
    appId: "1:1056634975866:web:703a455045484d7c88adc3",
    measurementId: "G-G9N7N776X2"
  });

  // Retrieve an instance of Firebase Messaging so that it can handle background
  // messages.
  const messaging = firebase.messaging();

  // Handle background messages
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    try {
      // Customize notification here
      const notificationTitle = payload.notification?.title || 'QuickBite Notification';
      const notificationOptions = {
        body: payload.notification?.body || 'You have a new notification',
        icon: '/vite.svg'
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    } catch (notificationError) {
      console.error('[firebase-messaging-sw.js] Error showing notification:', notificationError);
    }
  });

  console.log('[firebase-messaging-sw.js] Firebase Messaging service worker initialized successfully');
} catch (error) {
  console.error('[firebase-messaging-sw.js] Error initializing Firebase Messaging service worker:', error);
}

// Add basic fetch event handler for offline support
self.addEventListener('fetch', (event) => {
  // We don't need to handle this event specifically,
  // but having a fetch handler makes the service worker more robust
  console.log('[firebase-messaging-sw.js] Fetch event for ', event.request.url);
});

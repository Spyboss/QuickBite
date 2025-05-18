// This script checks if the service worker is registered correctly
(function() {
  // Only run in secure contexts
  if (!window.isSecureContext) {
    console.log('Service Worker check skipped: Not in a secure context');
    return;
  }

  // Check if service workers are supported
  if (!('serviceWorker' in navigator)) {
    console.log('Service Workers are not supported in this browser.');
    return;
  }

  // Function to register the service worker
  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/firebase-cloud-messaging-push-scope'
      });
      console.log('Firebase Cloud Messaging service worker registered manually:', registration);
      return registration;
    } catch (error) {
      console.error('Error registering Firebase Cloud Messaging service worker:', error);
      return null;
    }
  };

  // Check and register service worker with retry logic
  const checkAndRegisterServiceWorker = async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log('Service Worker Registrations:', registrations);

      // Check if firebase-messaging-sw.js is registered
      const fcmServiceWorker = registrations.find(reg =>
        reg.scope.includes('firebase-cloud-messaging-push-scope') ||
        (reg.active && reg.active.scriptURL.includes('firebase-messaging-sw.js'))
      );

      if (fcmServiceWorker) {
        console.log('Firebase Cloud Messaging service worker is registered correctly.');

        // Check if the service worker is active
        if (fcmServiceWorker.active) {
          console.log('Service worker is active.');
        } else {
          console.log('Service worker is registered but not active yet. Waiting for activation...');
          // Wait for the service worker to become active
          fcmServiceWorker.addEventListener('updatefound', () => {
            const newWorker = fcmServiceWorker.installing;
            newWorker.addEventListener('statechange', () => {
              console.log('Service worker state changed to:', newWorker.state);
            });
          });
        }

        return fcmServiceWorker;
      } else {
        console.log('Firebase Cloud Messaging service worker is NOT registered.');
        return await registerServiceWorker();
      }
    } catch (error) {
      console.error('Error checking service worker registrations:', error);
      // Try to register anyway
      return await registerServiceWorker();
    }
  };

  // Run the check when the page loads
  window.addEventListener('load', function() {
    // Add a small delay to ensure the page is fully loaded
    setTimeout(() => {
      checkAndRegisterServiceWorker().then(registration => {
        if (registration) {
          console.log('Service worker registration successful with scope:', registration.scope);
        } else {
          console.warn('Service worker registration failed.');
        }
      });
    }, 1000);
  });
})();
